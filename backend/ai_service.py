import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def enrich_product_data(product_name, category):
    """
    Uses Gemini to extract structured information from a product name and category.
    Returns a JSON string which we can parse into a dictionary.
    """
    if not api_key:
        print("Warning: No GEMINI_API_KEY found. Falling back to mock data.")
        return get_mock_data(product_name, category)

    prompt = f"""
    You are an expert e-commerce data enrichment AI.
    I have a product with the following raw data:
    - Raw Name: "{product_name}"
    - Raw Category: "{category}"

    Your task is to extract and generate the following fields:
    1. "clean_name": A professional, cleaned-up version of the product name.
    2. "brand": Extract the brand name if present. If unknown, put "Unknown Brand".
    3. "subcategory": Suggest a more specific subcategory based on the name.
    4. "tags": An array of 3-4 descriptive tags (e.g. ["grocery", "beverage", "summer"]).
    5. "description": Write a short, engaging 2-sentence marketing description for this product.
    6. "push_notification": A short, catchy push notification (under 80 chars) to drive sales.
    7. "whatsapp_message": A slightly longer, friendly WhatsApp message for loyal customers with emojis.

    Respond ONLY with a valid JSON object matching the keys exactly as written above. Do not include markdown formatting like ```json.
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        # Parse the JSON response
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return get_mock_data(product_name, category)

def get_mock_data(product_name, category):
    return {
        "clean_name": product_name.title(),
        "brand": "Detected Brand",
        "subcategory": "Detected Subcategory",
        "tags": ["trending", "new"],
        "description": f"This is an engaging description for {product_name.title()}.",
        "push_notification": f"🚨 Deal Alert! Get {product_name} at a special price!",
        "whatsapp_message": f"Hi! Check out our latest arrival: {product_name}. Buy now!"
    }
