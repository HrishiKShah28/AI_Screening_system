"""End-to-end integration test of the screening system pipeline."""

import json
from pathlib import Path
import sys

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.services.resume_service import ResumeService
from app.services.interview_service import InterviewService
from app.services.evaluation_service import EvaluationService


def main():
    print("=" * 60)
    print("RUNNING END-TO-END PIPELINE VERIFICATION")
    print("=" * 60)

    db = SessionLocal()
    try:
        resume_service = ResumeService()
        interview_service = InterviewService()
        eval_service = EvaluationService()

        # Step 1: Parse Sample Resume
        print("\n[1] Parsing Candidate Resume...")
        with open("data/sample_resumes/alex_rivera_ai_engineer.txt", "r") as f:
            resume_text = f.read()

        resume = resume_service.process_text_resume(
            raw_text=resume_text,
            candidate_name="Alex Rivera",
            db=db,
        )
        print(f"  + Resume created: ID={resume.id}, Candidate={resume.candidate_name}")
        print(f"  + Extracted Skills: {resume.extracted_skills}")
        print(f"  + Extracted Tech: {resume.extracted_tech}")
        print(f"  + Experience Level: {resume.experience_level}")

        # Step 2: Initialize Interview Session
        print("\n[2] Initializing Interview Session for AI/ML Engineer...")
        session = interview_service.create_session(
            resume_id=resume.id,
            role_id="ai_ml_engineer",
            total_questions=2,
            db=db,
        )
        print(f"  + Session ID: {session.id}, Status: {session.status}")

        # Step 3: Fetch Grounded Next Question
        print("\n[3] Generating Question 1 (RAG Retrieval + Groq)...")
        q1_result = interview_service.get_next_question(session.id, db)
        q1 = q1_result.question
        print(f"  + Question 1: {q1.question_text}")
        print(f"  + Topic: {q1.topic} (Difficulty: {q1.difficulty})")
        print(f"  + Source Book: {q1.source_traceability.book_title} (p. {q1.source_traceability.page_number})")
        print(f"  + Similarity: {q1.source_traceability.similarity_score}")

        # Step 4: Submit Answer
        print("\n[4] Submitting Candidate Answer...")
        sample_answer = (
            "Batch gradient descent computes the loss gradient over the entire dataset per update, "
            "providing a smooth and monotonic convergence trajectory on convex surfaces, but becomes computationally expensive. "
            "In contrast, Stochastic Gradient Descent (SGD) updates weights per individual sample, introducing high gradient variance "
            "which causes noisy oscillations that can help escape saddle points. Mini-batch gradient descent balances both approaches "
            "by taking 32 or 64 samples, exploiting SIMD GPU parallelism while maintaining moderate gradient stability."
        )
        ans1_res = interview_service.submit_answer(
            session_id=session.id,
            question_id=q1.question_id,
            answer_text=sample_answer,
            time_taken_seconds=75,
            db=db,
        )
        print(f"  + Answer Status: {ans1_res.status}")
        print(f"  + Composite Score: {ans1_res.evaluation.score}/10")
        print(f"  + Conceptual Accuracy: {ans1_res.evaluation.conceptual_accuracy}/10")
        print(f"  + Practical Depth: {ans1_res.evaluation.practical_depth}/10")
        print(f"  + Feedback: {ans1_res.evaluation.feedback}")
        print(f"  + Next Action: {ans1_res.next_action}")

        # Step 5: Fetch Question 2 (Adaptive)
        print("\n[5] Generating Question 2 (Adaptive difficulty based on Q1 score)...")
        q2_result = interview_service.get_next_question(session.id, db)
        q2 = q2_result.question
        print(f"  + Question 2: {q2.question_text}")
        print(f"  + Topic: {q2.topic} (Difficulty: {q2.difficulty})")
        print(f"  + Source Book: {q2.source_traceability.book_title} (p. {q2.source_traceability.page_number})")

        # Step 6: Submit Answer 2
        print("\n[6] Submitting Answer 2...")
        sample_answer_2 = (
            "L1 regularization adds an absolute weight penalty forcing coefficients to zero for feature selection. "
            "L2 regularization penalizes squared weights, shrinking them smoothly without eliminating features, "
            "which is effective for mitigating multicollinearity."
        )
        ans2_res = interview_service.submit_answer(
            session_id=session.id,
            question_id=q2.question_id,
            answer_text=sample_answer_2,
            time_taken_seconds=60,
            db=db,
        )
        print(f"  + Score 2: {ans2_res.evaluation.score}/10")
        print(f"  + Next Action: {ans2_res.next_action}")

        # Step 7: Complete Session & Generate Final Report
        print("\n[7] Completing Interview and Generating Final Report...")
        comp_res = interview_service.complete_session(session.id, db)
        print(f"  + Session Status: {comp_res.status}")

        report = eval_service.generate_final_report(session, db)
        print("\n" + "=" * 60)
        print("FINAL SCREENING REPORT")
        print("=" * 60)
        print(f"Candidate: {report.candidate_name}")
        print(f"Role: {report.role_title}")
        print(f"Overall Score: {report.overall_score} / 10.0")
        print(f"Recommendation: {report.recommendation}")
        print(f"Executive Summary: {report.executive_summary}")
        print(f"Competencies: {report.competency_breakdown.model_dump()}")
        print(f"Key Strengths: {report.strengths}")
        print(f"Areas for Improvement: {report.areas_for_improvement}")
        print(f"Questions Evaluated: {len(report.questions_summary)}")
        print("\n[SUCCESS] Entire screening pipeline passed with flying colors!")

    finally:
        db.close()


if __name__ == "__main__":
    main()
