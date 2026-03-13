import os
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv
import base64
from prompts import get_diagnosis_prompt, get_recommendation_prompt

load_dotenv()

app = Flask(__name__)
CORS(app)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

groq_client = None
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
else:
    print("⚠️ WARNING: GROQ_API_KEY not found in environment variables.")

DATA_FILE = "plants.json"

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

@app.route('/', methods=['GET'])
def home():
    return "Greencare AI Backend is Running!"
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
@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    if not groq_client:
        return jsonify({'error': 'Groq API client not initialized. Check GROQ_API_KEY.'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file:
        return jsonify({'error': 'Empty file'}), 400

    try:
        # Read and encode file data
        image_data = file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        prompt = get_diagnosis_prompt()

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{file.content_type};base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"}
        )
        
        text = completion.choices[0].message.content
        return jsonify(json.loads(text))

    except Exception as e:
        print(f"Error in diagnosis: {e}")
        return jsonify({'error': str(e)}), 500
@app.route('/api/recommend', methods=['POST'])
def recommend():
    if not groq_client:
        return jsonify({'error': 'Groq API client not initialized. Check GROQ_API_KEY.'}), 500

    try:
        criteria = request.json
        prompt = get_recommendation_prompt(
            location=criteria.get('location', 'India'),
            environment=criteria.get('environment', ''),
            light_level=criteria.get('lightLevel', ''),
            maintenance=criteria.get('maintenance', ''),
            pet_safe=criteria.get('petSafe', False),
            notes=criteria.get('notes', '')
        )
        
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a botanical expert that provides responses in JSON format."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        data = json.loads(completion.choices[0].message.content)        
        recommendations = data.get("recommendations", [])
        return jsonify(recommendations)

    except json.JSONDecodeError as e:
        return jsonify({'error': f'Failed to parse AI response as JSON: {str(e)}'}), 500

    except Exception as e:
        print(f"Error in recommendations: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)

