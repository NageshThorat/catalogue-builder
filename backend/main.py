from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import uuid
import time
import os
from ai_service import enrich_product_data
from image_service import get_product_images

app = FastAPI(title="Intelligent Catalogue Builder API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for hackathon prototype
catalogues_db = {}
creatives_db = {}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Intelligent Catalogue Builder API"}

@app.post("/upload")
async def upload_sales_report(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Endpoint to upload a sales report (CSV or Excel).
    Processes the file asynchronously.
    """
    try:
        contents = await file.read()
        filename = file.filename
        
        # Read data based on file extension
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents), on_bad_lines='skip')
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            return {"error": "Unsupported file format. Please upload CSV or Excel."}
        
        # Generate a unique job ID
        job_id = str(uuid.uuid4())
        
        # Initial save to DB
        catalogues_db[job_id] = {
            "status": "processing",
            "filename": filename,
            "data": []
        }
        
        # Start background processing
        background_tasks.add_task(process_report, job_id, df)
        
        return {"message": "File uploaded successfully. Processing started.", "job_id": job_id}
        
    except Exception as e:
        return {"error": str(e)}

@app.get("/catalogue/{job_id}")
def get_catalogue(job_id: str):
    """Fetch the processed catalogue by job ID"""
    if job_id not in catalogues_db:
        return {"error": "Job ID not found"}
    return catalogues_db[job_id]

# Mock AI Processing function
def process_report(job_id: str, df: pd.DataFrame):
    try:
        print(f"Processing job: {job_id}")
        # Clean column names (lower case, strip whitespace)
        df.columns = df.columns.str.lower().str.strip()
        
        # Remove duplicates based on product name
        if 'product name' in df.columns:
            df.drop_duplicates(subset=['product name'], keep='first', inplace=True)
            print(f"Dataset size after duplicate removal: {len(df)} rows")
        
        def safe_float(val, default=0.0):
            try:
                f = float(val)
                import math
                return default if math.isnan(f) or math.isinf(f) else f
            except (ValueError, TypeError):
                return default

        processed_data = []
        for index, row in df.iterrows():
            # Extract real fields from CSV
            raw_product_name = str(row.get('product name', f"Product {index}"))
            category = str(row.get('category', "Mock Category"))
            mrp = safe_float(row.get('mrp', 0))
            selling_price = safe_float(row.get('selling price', mrp * 0.9))
            cost_price = safe_float(row.get('cost price', selling_price * 0.7))
            
            product_code = str(row.get('product code', ''))
            batch_id = str(row.get('batch id', ''))
            uom = str(row.get('uom', ''))
            total_quantity = safe_float(row.get('total quantity', 0))
            total_sales_amount = safe_float(row.get('total sales amount', 0))
            total_purchase_amount = safe_float(row.get('total purchase amount', 0))
            profit_and_loss = safe_float(row.get('profit and loss', 0))
            
            # Simple margin calculation
            margin = selling_price - cost_price if selling_price else 0
            
            # Apply AI Enrichment to first 20 products only (to avoid rate limits/long processing)
            if index < 20:
                print(f"Applying AI Enrichment to product {index+1}: {raw_product_name}")
                enriched = enrich_product_data(raw_product_name, category)
                brand = enriched.get("brand", "Unknown Brand")
                product_name = enriched.get("clean_name", raw_product_name)
                subcategory = enriched.get("subcategory", "Mock Subcategory")
                tags = enriched.get("tags", ["trending"])
                description = enriched.get("description", "AI Generated Description")
                marketing_copy = {
                    "push": enriched.get("push_notification", "Buy now!"),
                    "whatsapp": enriched.get("whatsapp_message", "Check this out!")
                }
                images = get_product_images(product_name, brand, num_images=3)
                time.sleep(1.5) # Prevent DuckDuckGo rate limit
            else:
                product_name = raw_product_name
                brand = "Mock Brand"
                subcategory = "Mock Subcategory"
                tags = ["trending", "new"]
                description = f"This is an auto-generated description for {product_name}."
                marketing_copy = {
                    "push": f"🚨 Deal Alert! Get {product_name} at a special price!",
                    "whatsapp": f"Hi! Check out our latest arrival: {product_name}. Buy now!"
                }
                images = [
                    "https://placehold.co/400x400/png?text=Image+1",
                    "https://placehold.co/400x400/png?text=Image+2"
                ]

            item = {
                "id": str(uuid.uuid4()),
                "product_code": product_code,
                "batch_id": batch_id,
                "product_name": product_name,
                "brand": brand,
                "category": category,
                "subcategory": subcategory,
                "uom": uom,
                "total_quantity": total_quantity,
                "total_sales_amount": total_sales_amount,
                "total_purchase_amount": total_purchase_amount,
                "profit_and_loss": profit_and_loss,
                "mrp": mrp,
                "selling_price": selling_price,
                "cost_price": cost_price,
                "margin": round(margin, 2),
                "images": images,
                "description": description,
                "tags": tags,
                "marketing_copy": marketing_copy
            }
            processed_data.append(item)
            
        # Simulate processing time
        time.sleep(2) 
        
        catalogues_db[job_id]["status"] = "completed"
        catalogues_db[job_id]["data"] = processed_data
        print(f"Job {job_id} completed.")
        
    except Exception as e:
        print(f"Error processing job {job_id}: {e}")
        catalogues_db[job_id]["status"] = "failed"
        catalogues_db[job_id]["error"] = str(e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
