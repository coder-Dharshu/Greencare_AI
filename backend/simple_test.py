import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Testing different model names:\n")

model_names_to_try = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
    "models/gemini-pro",
    "models/gemini-1.5-pro",
]

for model_name in model_names_to_try:
    try:
        print(f"Trying: {model_name}...", end=" ")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello")
        print(f"✅ SUCCESS! Response: {response.text[:30]}")
        print(f"   >>> USE THIS MODEL: {model_name}\n")
        break  # Stop after first success
    except Exception as e:
        error_msg = str(e)[:100]
        print(f"❌ FAILED: {error_msg}\n")
