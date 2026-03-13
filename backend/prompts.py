def get_diagnosis_prompt() -> str:
    return """
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

def get_recommendation_prompt(location: str, environment: str, light_level: str, maintenance: str, pet_safe: bool, notes: str) -> str:
    return f"""
    Act as a botanical expert. Suggest 5 plants suitable for a home garden in {location}.
    
    User Preferences:
    - Environment: {environment}
    - Light Level: {light_level}
    - Maintenance: {maintenance}
    - Pet Safe: {pet_safe}
    - Additional Notes: {notes}
    
    Return a JSON array of objects with this exact structure:
    {{
        "recommendations": [
            {{
                "name": string,
                "scientificName": string,
                "description": string,
                "waterNeeds": string,
                "lightNeeds": string,
                "difficulty": string
            }}
        ]
    }}
    """
