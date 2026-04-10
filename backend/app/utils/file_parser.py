import os
import uuid
from fastapi import UploadFile, HTTPException
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader

UPLOAD_DIR = "storage/resumes"

async def save_and_extract_text_from_file(file: UploadFile) -> tuple[str, str]:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    file_id = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_id)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
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
        raise HTTPException(status_code=500, detail=f"LangChain extraction failed: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="The file appears to be empty or unreadable.")

    return file_path, text