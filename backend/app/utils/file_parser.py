import os
import shutil
import uuid
import logging
from fastapi import UploadFile, HTTPException
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader

logger = logging.getLogger(__name__)

UPLOAD_DIR = "storage/resumes"


def delete_file(file_path: str) -> None:
    try:
        os.remove(file_path)
    except FileNotFoundError:
        pass
    except OSError as e:
        logger.warning(f"Could not delete file {file_path}: {e}")


def save_and_extract_text_from_file(file: UploadFile) -> tuple[str, str]:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1].lower()
    file_id = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_id)

    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        logger.error(f"Failed to save file {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not save the uploaded file.")

    try:
        if file_extension == ".pdf":
            loader = PyPDFLoader(file_path)
        elif file_extension in [".docx", ".doc"]:
            loader = Docx2txtLoader(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")

        docs = loader.load()
        text = "\n".join([doc.page_content for doc in docs])
    except HTTPException:
        delete_file(file_path)
        raise
    except Exception as e:
        delete_file(file_path)
        logger.error(f"LangChain extraction error for {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to process document content."
        )

    if not text.strip():
        delete_file(file_path)
        raise HTTPException(
            status_code=400, detail="The file appears to be empty or unreadable."
        )

    return file_path, text
