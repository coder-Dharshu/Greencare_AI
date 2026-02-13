import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model = genai.GenerativeModel('models/gemini-2.5-flash')

criteria = {
    'location': 'Bengaluru, Karnataka, India',
    'environment': 'indoor',
    'lightLevel': 'medium',
    'maintenance': 'low',
    'petSafe': False,
    'notes': ''
}

prompt = f"""
Act as an expert Indian botanist. Suggest 5 plants strictly suitable for a home balcony garden in {criteria.get('location')}.

User Preferences:
- Environment: {criteria.get('environment')}
- Light Level: {criteria.get('lightLevel')}
- Maintenance: {criteria.get('maintenance')}
- Pet Safe: {criteria.get('petSafe')}
- Notes: {criteria.get('notes')}

Return a JSON array of objects with this structure:
[
    {{
        "name": string,
        "scientificName": string,
        "description": string,
        "waterNeeds": string,
        "lightNeeds": string,
        "difficulty": string
    }}
]
"""

print("Sending request to Gemini...")
try:
    response = model.generate_content(prompt)
    print("\n" + "="*60)
    print("RAW RESPONSE:")
    print("="*60)
    print(response.text)
    print("\n" + "="*60)
    
    # Try to parse it
    text = response.text.strip()
    if text.startswith('```json'):
        text = text[7:-3]
    elif text.startswith('```'):
        text = text[3:-3]
    
    print("CLEANED TEXT:")
    print("="*60)
    print(text)
    print("\n" + "="*60)
    
    parsed = json.loads(text)
    print("PARSED JSON:")
    print("="*60)
    print(json.dumps(parsed, indent=2))
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
