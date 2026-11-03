import logging
import os
import shutil
import tempfile

from fastapi import HTTPException, UploadFile
from langchain_community.document_loaders import Docx2txtLoader, PyPDFLoader

logger = logging.getLogger(__name__)

LOADERS = {".pdf": PyPDFLoader, ".docx": Docx2txtLoader, ".doc": Docx2txtLoader}


def _remove(path: str) -> None:
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
    except OSError as e:
        logger.warning(f"Could not delete temporary file {path}: {e}")


def extract_text_from_upload(file: UploadFile) -> str:
    """The text of an uploaded resume. The file is only kept on disk while it is
    read, in a temporary file deleted straight after; the original isn't stored."""
    extension = os.path.splitext(file.filename)[1].lower()
    loader_class = LOADERS.get(extension)
    if loader_class is None:
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    fd, path = tempfile.mkstemp(prefix="resume-", suffix=extension)
    try:
        try:
            with os.fdopen(fd, "wb") as tmp:
                shutil.copyfileobj(file.file, tmp)
        except Exception as e:
            logger.error(f"Failed to save file {file.filename}: {e}")
            raise HTTPException(
                status_code=500, detail="Could not save the uploaded file."
            )

        try:
            docs = loader_class(path).load()
        except Exception as e:
            logger.error(f"LangChain extraction error for {file.filename}: {e}")
            raise HTTPException(
                status_code=500, detail="Failed to process document content."
            )
    finally:
        _remove(path)

    text = "\n".join(doc.page_content for doc in docs)
    if not text.strip():
        raise HTTPException(
            status_code=400, detail="The file appears to be empty or unreadable."
        )
    return text
