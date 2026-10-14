from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_TAGS = 30
MAX_TAG_LENGTH = 40


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str
    avatar_url: Optional[str] = None
    target_role: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    tech_stack: List[str] = []
    skills: List[str] = []

    @field_validator("tech_stack", "skills", mode="before")
    @classmethod
    def none_as_empty(cls, value):
        return value or []


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    target_role: Optional[str] = Field(default=None, max_length=255)
    experience_years: Optional[int] = Field(default=None, ge=0, le=50)
    bio: Optional[str] = Field(default=None, max_length=1000)
    tech_stack: List[str] = Field(default=[], max_length=MAX_TAGS)
    skills: List[str] = Field(default=[], max_length=MAX_TAGS)

    @field_validator("full_name", mode="before")
    @classmethod
    def strip_name(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("target_role", "bio", mode="before")
    @classmethod
    def blank_as_none(cls, value):
        if isinstance(value, str):
            value = value.strip()
        return value or None

    @field_validator("tech_stack", "skills")
    @classmethod
    def clean_tags(cls, values: List[str]) -> List[str]:
        """Trim each tag and drop blanks and case-insensitive duplicates."""
        seen, cleaned = set(), []
        for value in values:
            tag = value.strip()
            if len(tag) > MAX_TAG_LENGTH:
                raise ValueError(
                    f"Each item must be at most {MAX_TAG_LENGTH} characters"
                )
            if tag and tag.lower() not in seen:
                seen.add(tag.lower())
                cleaned.append(tag)
        return cleaned
