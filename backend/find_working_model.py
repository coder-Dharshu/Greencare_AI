import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"SDK Version: {genai.__version__}")
print()

genai.configure(api_key=api_key)

# Try listing models with their full names
print("Attempting to list models...")
try:
    for model in genai.list_models():
        print(f"Found: {model.name}")
        if 'generateContent' in model.supported_generation_methods:
            print(f"  ✅ Supports generateContent")
            # Try to use this model
            try:
                test_model = genai.GenerativeModel(model.name)
                response = test_model.generate_content("Hello")
                print(f"  ✅✅ WORKS! Use: {model.name}")
                print(f"  Response: {response.text[:50]}")
                break
            except Exception as e:
                print(f"  ❌ Failed to generate: {str(e)[:80]}")
        print()
except Exception as e:
    print(f"Error listing models: {e}")
