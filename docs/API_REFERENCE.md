# API Reference

The Intelligent Catalogue Builder uses a **FastAPI** backend to handle file uploads, asynchronous processing, and serving parsed catalogue data.

## Base URL
When running locally, the base URL is: `http://localhost:8000`

---

## 1. Health Check

Checks if the API server is running successfully.

**Endpoint:** `GET /`

### Response (200 OK)
```json
{
  "message": "Welcome to the Intelligent Catalogue Builder API"
}
```

---

## 2. Upload Sales Report

Uploads a raw CSV or Excel sales report and kicks off a background job to process and enrich the data using AI.

**Endpoint:** `POST /upload`  
**Content-Type:** `multipart/form-data`

### Request Body
| Field | Type | Description |
|---|---|---|
| `file` | `File` | The raw sales report file (must be `.csv`, `.xlsx`, or `.xls`). |

### Response (200 OK)
```json
{
  "message": "File uploaded successfully. Processing started.",
  "job_id": "uuid-string-here"
}
```

### Response (400 Bad Request)
```json
{
  "error": "Unsupported file format. Please upload CSV or Excel."
}
```

---

## 3. Fetch Catalogue Status / Data

Fetches the current status of an ongoing job or the full parsed catalogue if the job has completed.

**Endpoint:** `GET /catalogue/{job_id}`

### Path Parameters
| Parameter | Type | Description |
|---|---|---|
| `job_id` | `string` | The unique ID of the job returned by the `/upload` endpoint. |

### Response (Processing)
```json
{
  "status": "processing",
  "filename": "sales_dataset.csv",
  "data": []
}
```

### Response (Completed)
```json
{
  "status": "completed",
  "filename": "sales_dataset.csv",
  "data": [
    {
      "id": "item-uuid",
      "product_code": "P123",
      "batch_id": "B001",
      "product_name": "Cleaned Product Name",
      "brand": "Brand Name",
      "category": "Main Category",
      "subcategory": "Sub Category",
      "uom": "PCS",
      "total_quantity": 100,
      "total_sales_amount": 1000.0,
      "total_purchase_amount": 500.0,
      "profit_and_loss": 500.0,
      "mrp": 12.0,
      "selling_price": 10.0,
      "cost_price": 5.0,
      "margin": 5.0,
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "description": "2-sentence AI generated description.",
      "tags": ["tag1", "tag2"],
      "marketing_copy": {
        "push": "Push notification copy",
        "whatsapp": "WhatsApp message copy"
      }
    }
  ]
}
```

### Response (Error)
```json
{
  "error": "Job ID not found"
}
```
