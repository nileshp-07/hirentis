import json
from typing import Any, Dict, List, Optional, Union
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def get_chat_completion(
    messages: List[Dict[str, str]],
    model: str = "gpt-4o-mini",
    temperature: float = 0.2,
    max_tokens: Optional[int] = None,
    response_format: Optional[str] = "text",
    stream: bool = False
) -> Union[str, Dict[str, Any]]:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured.")

    call_args = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream
    }

    if response_format == "json":
        call_args["response_format"] = {"type": "json_object"}

    response = await client.chat.completions.create(**call_args)

    if stream:
        return response

    content = response.choices[0].message.content

    if response_format == "json":
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            print(f"Warning: OpenAI returned invalid JSON content: {content}")
            return {"error": "Invalid API response format", "raw": content}

    return content
