import os
import uuid
import logging
import aiofiles
from fastapi import UploadFile, HTTPException
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader

logger = logging.getLogger(__name__)

UPLOAD_DIR = "storage/resumes"


async def save_and_extract_text_from_file(file: UploadFile) -> tuple[str, str]:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1].lower()
    file_id = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_id)

    try:
        # aiofiles is used for non-blocking file operations
        async with aiofiles.open(file_path, mode="wb") as f:
            content = await file.read()
            await f.write(content)
    except Exception as e:
        logger.error(f"Failed to save file {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not save the uploaded file.")

    try:
        if file_extension == ".pdf":
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            text = "\n".join([doc.page_content for doc in docs])

        elif file_extension in [".docx", ".doc"]:
            loader = Docx2txtLoader(file_path)
            docs = loader.load()
            text = "\n".join([doc.page_content for doc in docs])
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")

    except Exception as e:
        logger.error(f"LangChain extraction error for {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to process document content."
        )

    if not text.strip():
        raise HTTPException(
            status_code=400, detail="The file appears to be empty or unreadable."
        )

    return file_path, text
