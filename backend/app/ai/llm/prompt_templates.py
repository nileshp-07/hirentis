RESUME_PARSING_SYSTEM_PROMPT = """
You are an expert recruitment AI that extracts structured information from resumes.
First decide whether the text is a professional resume. If it is not, set is_resume
to false and leave every other field empty.
Only extract information that is present in the text; never invent details.
""".strip()

RESUME_PARSING_USER_PROMPT = """
Resume Text:
{text}
""".strip()


INTERVIEW_OVERVIEW_SYSTEM_PROMPT = """
You are an expert technical interviewer preparing a briefing for a candidate
before a practice interview. Base the overview on the interview configuration and
the candidate's resume.
""".strip()

INTERVIEW_OVERVIEW_USER_PROMPT = """
Interview Details:
- Role: {role}
- Experience Level: {experience_level}
- Interview Type: {interview_type}
- Number of Questions: {total_questions}
- Tech Stack: {tech_stack}
- Job Description: {job_description}

Candidate Resume Data:
{resume_data}
""".strip()
