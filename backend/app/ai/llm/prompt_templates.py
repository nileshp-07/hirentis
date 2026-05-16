RESUME_PARSING_PROMPT = """
You are an expert recruitment AI. Extract the following information from the resume text into a VALID JSON format.
Only return the JSON. Do not include any explanation.

Output Schema:
{{
  "is_resume": true, // Set to false if the text is NOT a professional resume (e.g. it's random text, a generic document, a book, etc.)
  "skills": ["List of technical and soft skills"],
  "experience_years": 0,
  "projects": [
    {{
      "title": "Project Name",
      "tech_stack": ["List of technologies used"],
      "description": "Brief description of the work done"
    }}
  ],
  "work_experience": [
    {{
      "company": "Company Name",
      "role": "Role Name",
      "duration": "Duration of work",
      "description": "Brief description of the responsibilities"
    }}
  ],
  "education": [
    {{
      "degree": "Degree Name",
      "institution": "Institution Name",
      "duration": "Duration of education",
      "description": "Brief description of studies"
    }}
  ],
  "summary": "Brief summary of the candidate's professional background"
}}

Resume Text:
{text}
"""


INTERVIEW_OVERVIEW_PROMPT = """
You are an expert technical interviewer preparing a briefing.
Generate an interview overview JSON based on the provided details.
Only return the VALID JSON format, do not include any markdown formatting or explanation.
Input Details:
- Role: {role}
- Experience Level: {experience_level}
- Interview Type: {interview_type}
- Tech Stack: {tech_stack}
- Job Description: {job_description}
- Resume Data: {resume_data}
Output Schema:
{{
  "overview_title": "String title",
  "summary": "String summary of the interview focus",
  "estimated_duration": "45 mins",
  "focus_areas": ["Skill 1", "Skill 2"],
  "requirements": ["Requirement 1", "Requirement 2"],
  "culture_fit": ["Trait 1", "Trait 2"],
  "resume_highlights": {{
    "resume_name": "Applicant Resume",
    "experience_summary": "Short summary",
    "skills": ["Skill 1", "Skill 2"]
  }}
}}
"""
