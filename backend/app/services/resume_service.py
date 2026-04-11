import uuid
import logging
from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.utils.file_parser import save_and_extract_text_from_file
from app.ai.llm.openai_client import get_chat_completion
from app.ai.llm.prompt_templates import RESUME_PARSING_PROMPT

logger = logging.getLogger(__name__)

async def parse_resume_content(text: str) -> dict:
    try:
        messages = [
            {"role": "system", "content": "You are a specialized resume parsing agent."},
            {"role": "user", "content": RESUME_PARSING_PROMPT.format(text=text)}
        ]
        return await get_chat_completion(messages, response_format="json")
    except Exception as e:
        logger.error(f"Resume parsing failed: {str(e)}")
        return {
            "skills": [],
            "experience_years": 0,
            "projects": [],
            "summary": "Error during AI parsing."
        }

async def process_resume_upload(db: Session, user_id: uuid.UUID, file):
    file_path, text = await save_and_extract_text_from_file(file)

    parsed_json = await parse_resume_content(text)

    db.query(Resume).filter(Resume.user_id == user_id, Resume.is_active == True).update({
        "is_active": False
    })
    
    new_resume = Resume(
        user_id = user_id,
        title = file.filename,
        file_path = file_path,
        raw_text = text,
        parsed_data = parsed_json,
        is_active = True
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume