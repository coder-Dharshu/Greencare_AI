import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Finding working model...\n")

working_model = None

try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"Testing: {model.name}")
            try:
                test_model = genai.GenerativeModel(model.name)
                response = test_model.generate_content("Hello")
                print(f"SUCCESS with: {model.name}")
                print(f"Response: {response.text[:50]}\n")
                working_model = model.name
                break
            except Exception as e:
                print(f"Failed: {str(e)[:80]}\n")
except Exception as e:
    print(f"Error: {e}")

if working_model:
    # Save to file
    with open('backend/WORKING_MODEL.txt', 'w') as f:
        f.write(working_model)
    print(f"\n{'='*50}")
    print(f"WORKING MODEL SAVED: {working_model}")
    print(f"{'='*50}")
else:
    print("No working model found!")
