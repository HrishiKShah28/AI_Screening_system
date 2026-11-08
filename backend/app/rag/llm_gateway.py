"""Provider-agnostic LLM gateway supporting Groq, Gemini, and OpenAI."""

import json
import re
from typing import Any, Dict, Optional
from app.config import settings
from app.core.exceptions import LLMGenerationException


class LLMGateway:
    """Unified interface for executing LLM generations across different providers."""

    _instance: Optional["LLMGateway"] = None

    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self._groq_client = None

    @classmethod
    def get_instance(cls) -> "LLMGateway":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_groq_client(self):
        if self._groq_client is None:
            from groq import Groq
            if not settings.GROQ_API_KEY:
                raise LLMGenerationException("GROQ_API_KEY is not configured in environment.")
            self._groq_client = Groq(api_key=settings.GROQ_API_KEY)
        return self._groq_client

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        json_mode: bool = False,
        temperature: float = 0.2,
        max_tokens: int = 1200,
    ) -> str:
        """Executes text completion using configured provider."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        if self.provider == "groq":
            try:
                client = self._get_groq_client()
                kwargs: Dict[str, Any] = {
                    "model": settings.GROQ_MODEL,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}

                response = client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content
                return content.strip() if content else ""
            except Exception as e:
                # If error is model not found or rate limit, attempt fallback to qwen
                if "model_not_found" in str(e) or "404" in str(e):
                    try:
                        client = self._get_groq_client()
                        response = client.chat.completions.create(
                            model="qwen/qwen3.8-27b",
                            messages=messages,
                            temperature=temperature,
                            max_tokens=max_tokens,
                        )
                        content = response.choices[0].message.content
                        return content.strip() if content else ""
                    except Exception as inner_e:
                        raise LLMGenerationException(f"Groq fallback error: {inner_e}")
                raise LLMGenerationException(f"Groq generation failed: {e}")

        elif self.provider == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel(settings.GEMINI_MODEL)
                full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
                response = model.generate_content(full_prompt)
                return response.text.strip()
            except Exception as e:
                raise LLMGenerationException(f"Gemini generation failed: {e}")

        elif self.provider == "openai":
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)
                response = client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                raise LLMGenerationException(f"OpenAI generation failed: {e}")

        else:
            raise LLMGenerationException(f"Unsupported LLM provider: {self.provider}")

    def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> Dict[str, Any]:
        """Generates completion and parses it strictly into a Python dictionary."""
        augmented_system = (system_prompt or "") + "\nStrictly output ONLY valid JSON without any markdown formatting or commentary."
        raw_text = self.generate(
            prompt=prompt,
            system_prompt=augmented_system,
            json_mode=True,
            temperature=temperature,
        )

        # Clean markdown code blocks if present
        clean_text = raw_text.strip()
        if clean_text.startswith("```"):
            clean_text = re.sub(r"^```(?:json)?\n?", "", clean_text)
            clean_text = re.sub(r"\n?```$", "", clean_text)
        clean_text = clean_text.strip()

        try:
            return json.loads(clean_text)
        except json.JSONDecodeError as err:
            # Fallback regex search for { ... }
            match = re.search(r"(\{.*\})", clean_text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
            raise LLMGenerationException(
                f"Failed to parse LLM response into JSON: {err}",
                details={"raw_output": raw_text},
            )

