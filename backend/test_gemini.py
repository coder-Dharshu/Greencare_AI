import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure API
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Testing Gemini API...")
print(f"API Key (first 10 chars): {api_key[:10]}...")
print("\nListing available models:")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")

print("\n" + "="*50)
print("Testing a simple text generation:")
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Failed with gemini-pro: {e}")
    
print("\n" + "="*50)
print("Trying gemini-1.5-pro:")
try:
    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content("Say hello")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Failed with gemini-1.5-pro: {e}")
