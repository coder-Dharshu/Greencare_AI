import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure API
api_key = os.getenv("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:20]}...{api_key[-10:]}")
print()

genai.configure(api_key=api_key)

print("="*60)
print("LISTING ALL AVAILABLE MODELS:")
print("="*60)

try:
    models = genai.list_models()
    content_gen_models = []
    
    for m in models:
        print(f"\nModel: {m.name}")
        print(f"  Display Name: {m.display_name}")
        print(f"  Supported Methods: {m.supported_generation_methods}")
        
        if 'generateContent' in m.supported_generation_methods:
            content_gen_models.append(m.name)
            print(f"  ✅ SUPPORTS generateContent")
    
    print("\n" + "="*60)
    print(f"MODELS SUPPORTING 'generateContent': {len(content_gen_models)}")
    print("="*60)
    for model_name in content_gen_models:
        print(f"  - {model_name}")
    
    print("\n" + "="*60)
    print("TESTING EACH MODEL:")
    print("="*60)
    
    for model_name in content_gen_models[:3]:  # Test first 3 only
        print(f"\nTesting {model_name}...")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say 'Hello World'")
            print(f"  ✅ SUCCESS! Response: {response.text[:50]}...")
        except Exception as e:
            print(f"  ❌ FAILED: {str(e)[:100]}...")
            
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
