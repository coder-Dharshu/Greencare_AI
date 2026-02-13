import os
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️ WARNING: GEMINI_API_KEY not found in environment variables.")

DATA_FILE = "plants.json"

# --- HELPER FUNCTIONS ---
def load_plants():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_plants(plants):
    with open(DATA_FILE, 'w') as f:
        json.dump(plants, f, indent=2)

# --- API ENDPOINTS ---

@app.route('/', methods=['GET'])
def home():
    return "Greencare AI Backend is Running!"

# 1. Garden Management endpoints
@app.route('/api/plants', methods=['GET'])
def get_plants():
    return jsonify(load_plants())

@app.route('/api/plants', methods=['POST'])
def add_plant():
    data = request.json
    plants = load_plants()
    new_plant = {
        "id": str(uuid.uuid4()),
        "name": data.get("name"),
        "species": data.get("species"),
        "location": data.get("location", "Indoor"),
        "waterScheduleDays": data.get("waterScheduleDays", 7),
        "lastWatered": data.get("lastWatered", datetime.now().isoformat()),
        "imageUrl": data.get("imageUrl", ""),
        "notes": data.get("notes", "")
    }
    plants.append(new_plant)
    save_plants(plants)
    return jsonify(new_plant), 201

@app.route('/api/plants/<plant_id>', methods=['DELETE'])
def remove_plant(plant_id):
    plants = load_plants()
    plants = [p for p in plants if p['id'] != plant_id]
    save_plants(plants)
    return jsonify({"status": "success"})

@app.route('/api/plants/<plant_id>', methods=['PUT'])
def update_plant(plant_id):
    data = request.json
    plants = load_plants()
    updated_plant = None
    for p in plants:
        if p['id'] == plant_id:
            p.update(data)
            updated_plant = p
            break
    
    if updated_plant:
        save_plants(plants)
        return jsonify(updated_plant)
    return jsonify({"error": "Plant not found"}), 404

# 2. Disease Detection (Gemini Vision)
@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file:
        return jsonify({'error': 'Empty file'}), 400

    try:
        # Read file data directly
        image_data = file.read()
        
        # Prepare content for Gemini
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        prompt = """
        Analyze this image. Determine if it contains a plant. 
        If it does, identify the plant species. 
        Then, examine the plant for any signs of disease, pests, or nutritional deficiencies. 
        Provide a diagnosis, confidence score (0-1), and detailed treatment steps if issues are found. 
        If healthy, provide maintenance tips as 'preventativeMeasures'.
        
        Return the response as valid JSON with this structure:
        {
            "isPlant": boolean,
            "plantName": string,
            "healthStatus": "healthy" | "diseased" | "unknown",
            "diagnosis": string,
            "confidence": float,
            "treatment": [string],
            "preventativeMeasures": [string]
        }
        """

        response = model.generate_content([
            {'mime_type': file.content_type, 'data': image_data},
            prompt
        ])
        
        # Extract JSON from response
        text = response.text.strip()
        print(f"Diagnosis response (first 200 chars): {text[:200]}")
        
        # Remove markdown code blocks if present
        if '```json' in text:
            text = text.split('```json')[1].split('```')[0].strip()
        elif '```' in text:
            # Try to find JSON within any code block
            parts = text.split('```')
            for part in parts:
                part = part.strip()
                if part.startswith('{') or part.startswith('['):
                    text = part
                    break
        
        # If response doesn't start with { or [, try to find JSON
        if not text.startswith(('{', '[')):
            import re
            json_match = re.search(r'[\[{].*[\]}]', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)
            
        print(f"Cleaned JSON (first 200 chars): {text[:200]}")
        return jsonify(json.loads(text))

    except Exception as e:
        print(f"Error in diagnosis: {e}")
        return jsonify({'error': str(e)}), 500

# 3. Recommendations (Gemini Pro)
@app.route('/api/recommend', methods=['POST'])
def recommend():
    try:
        criteria = request.json
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
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
        
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        text = response.text.strip()
        print(f"Recommendation response (first 200 chars): {text[:200]}")
        
        # Remove markdown code blocks if present
        if '```json' in text:
            text = text.split('```json')[1].split('```')[0].strip()
        elif '```' in text:
            # Try to find JSON within any code block
            parts = text.split('```')
            for part in parts:
                part = part.strip()
                if part.startswith('{') or part.startswith('['):
                    text = part
                    break
        
        # If response doesn't start with { or [, try to find JSON
        if not text.startswith(('{', '[')):
            import re
            json_match = re.search(r'[\[{].*[\]}]', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)
        
        print(f"Cleaned JSON (first 200 chars): {text[:200]}")
        return jsonify(json.loads(text))

    except json.JSONDecodeError as e:
        print(f"JSON decode error in recommendations: {e}")
        print(f"Attempted to parse: {text[:500] if 'text' in locals() else 'N/A'}")
        return jsonify({'error': f'Failed to parse AI response as JSON: {str(e)}'}), 500

    except Exception as e:
        print(f"Error in recommendations: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

