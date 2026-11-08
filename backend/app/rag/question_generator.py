"""Grounded question generator using textbook context and candidate background."""

from typing import Any, Dict, List, Optional
from app.rag.llm_gateway import LLMGateway
from app.models.resume import Resume
from app.models.role import Role


class QuestionGenerator:
    """Generates authoritative, grounded interview questions derived from textbook chunks."""

    def __init__(self, llm_gateway: Optional[LLMGateway] = None):
        self.llm = llm_gateway or LLMGateway.get_instance()

    def generate_question(
        self,
        retrieved_chunk: Dict[str, Any],
        role: Role,
        resume: Optional[Resume] = None,
        difficulty: str = "intermediate",
        question_order: int = 1,
    ) -> Dict[str, Any]:
        """
        Formulates a grounded technical question based on the retrieved textbook excerpt
        and the candidate's profile.
        """
        system_prompt = (
            "You are a Senior Principal Technical Interviewer conducting a rigorous, structured screening interview.\n"
            "CRITICAL INSTRUCTIONS:\n"
            "1. Ground your question strictly in the provided REFERENCE TEXTBOOK PASSAGE. Do not hallucinate external concepts.\n"
            "2. Connect the question naturally to the candidate's resume background or technologies if possible.\n"
            "3. Formulate a clear, direct, and insightful technical question that tests both theoretical intuition and practical understanding.\n"
            "4. Avoid generic multiple-choice or trivia questions. Focus on algorithmic mechanisms, trade-offs, and design decisions.\n"
            "5. Return strictly valid JSON."
        )

        candidate_info = "General candidate profile"
        if resume:
            skills = ", ".join(resume.extracted_skills or [])
            tech = ", ".join(resume.extracted_tech or [])
            candidate_info = f"Candidate Skills: {skills} | Technologies: {tech} | Domain Exposure: {', '.join(resume.domain_exposure or [])}"

        prompt = f"""Target Role: {role.title}
Question Number: {question_order}
Target Difficulty: {difficulty}

Candidate Background:
{candidate_info}

REFERENCE TEXTBOOK PASSAGE:
Book: {retrieved_chunk.get('book_title', 'Core Textbook')}
Author: {retrieved_chunk.get('author', 'Author')}
Page: {retrieved_chunk.get('page_number', 'N/A')}
Text Excerpt:
\"\"\"{retrieved_chunk.get('text', '')}\"\"\"

TASK:
Generate a grounded technical interview question testing the candidate on the concepts presented in the textbook excerpt above.

Return a JSON object with this exact schema:
{{
  "question_text": "<The interview question to ask the candidate>",
  "topic": "<Specific subject topic, e.g. Gradient Descent Convergence, Cross-Validation Bias>",
  "target_competency": "<Specific skill or mental model being tested>",
  "expected_key_points": [
    "<Key concept 1 the candidate should mention in a good answer>",
    "<Key concept 2 the candidate should mention>",
    "<Key concept 3 the candidate should mention>"
  ],
  "difficulty": "{difficulty}"
}}
"""

        result = self.llm.generate_json(prompt=prompt, system_prompt=system_prompt)

        # Attach source traceability
        result["source_traceability"] = {
            "book_title": retrieved_chunk.get("book_title", "Technical Reference"),
            "author": retrieved_chunk.get("author", "Unknown"),
            "page_number": retrieved_chunk.get("page_number", 1),
            "chunk_id": retrieved_chunk.get("chunk_id", ""),
            "similarity_score": retrieved_chunk.get("similarity_score", 0.0),
            "excerpt": retrieved_chunk.get("text", "")[:350] + ("..." if len(retrieved_chunk.get("text", "")) > 350 else ""),
        }

        return result

