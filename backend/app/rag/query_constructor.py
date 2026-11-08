"""Dynamic query constructor combining resume competencies, role taxonomy, and interview history."""

from typing import List, Optional
from app.models.role import Role
from app.models.resume import Resume
from app.models.question import InterviewQuestion


class QueryConstructor:
    """Constructs dynamic semantic search queries for vector retrieval."""

    @staticmethod
    def construct_query(
        role: Role,
        resume: Optional[Resume] = None,
        previous_questions: Optional[List[InterviewQuestion]] = None,
        difficulty: str = "intermediate",
    ) -> str:
        """
        Synthesizes a targeted search query based on:
        - Candidate skills that intersect with the role
        - Uncovered topics from the role's primary curriculum
        - Target difficulty level
        """
        previous_topics = set()
        if previous_questions:
            for q in previous_questions:
                if q.topic:
                    previous_topics.add(q.topic.lower())

        # Select candidate skills relevant to this role
        candidate_skills = []
        if resume and resume.extracted_skills:
            candidate_skills = resume.extracted_skills[:6]

        # Find unexplored primary topics
        unexplored_topics = [
            t for t in (role.primary_topics or [])
            if t.lower() not in previous_topics
        ]
        chosen_topic = unexplored_topics[0] if unexplored_topics else (role.primary_topics[0] if role.primary_topics else role.title)

        # Build query
        query_parts = [chosen_topic]
        if candidate_skills:
            query_parts.append(" ".join(candidate_skills[:3]))

        if difficulty == "advanced":
            query_parts.append("mathematical derivation computational complexity trade-offs")
        elif difficulty == "beginner":
            query_parts.append("foundational concepts definitions intuitive explanation")
        else:
            query_parts.append("practical application algorithm optimization principles")

        return f"{role.title}: {' '.join(query_parts)}"

