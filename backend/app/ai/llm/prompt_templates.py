RESUME_PARSING_PROMPT = """
You are an expert recruitment AI. Extract the following information from the resume text into a VALID JSON format.
Only return the JSON. Do not include any explanation.

Output Schema:
{{
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