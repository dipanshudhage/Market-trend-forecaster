from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import os
import httpx
import json
from dotenv import load_dotenv
from app.schemas.chat import ChatRequest, ChatResponse

load_dotenv()

router = APIRouter()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


# ---------- SYSTEM PROMPT ----------
SYSTEM_PROMPT = """
You are a Market Intelligence AI assistant.

Formatting Rules:
- Every section must start with ## heading
- Always add a blank line after headings
- Use bullet points for statistics and events
- Never merge headings and text

Example format:

## Market Overview

Explanation text.

## Key Statistics

- Stat 1
- Stat 2
- Stat 3
"""

# ---------- STANDARD CHAT ENDPOINT ----------
@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):

    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key not configured"
        )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "meta-llama/llama-3-8b-instruct",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Context: {request.context}\nUser Query: {request.message}"
            }
        ],
        "temperature": 0.4,
        "max_tokens": 700
    }

    try:
        async with httpx.AsyncClient(timeout=40.0) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers=headers,
                json=data
            )

            response.raise_for_status()

            result = response.json()

            reply = result["choices"][0]["message"]["content"]

            return ChatResponse(
                success=True,
                reply=reply
            )

    except Exception as e:
        print("Chat API Exception:", e)

        return ChatResponse(
            success=False,
            reply="I'm having trouble processing your request. Please try again."
        )


# ---------- STREAMING CHAT ENDPOINT ----------
@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):

    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key not configured"
        )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "meta-llama/llama-3-8b-instruct",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Context: {request.context}\nUser Query: {request.message}"
            }
        ],
        "temperature": 0.4,
        "max_tokens": 700,
        "stream": True
    }

    async def event_generator():

        async with httpx.AsyncClient(timeout=60.0) as client:

            async with client.stream(
                "POST",
                OPENROUTER_URL,
                headers=headers,
                json=data
            ) as response:

                async for line in response.aiter_lines():

                    if line.startswith("data: "):

                        if line.strip() == "data: [DONE]":
                            break

                        try:
                            chunk = json.loads(line[6:])

                            content = chunk["choices"][0].get("delta", {}).get("content", "")

                            if content:
                                yield f"data: {json.dumps(content)}\n\n"

                        except Exception:
                            continue

                yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )