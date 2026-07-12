# Project Overview: Intelligent Catalogue Builder

This document provides a comprehensive overview of the **Intelligent Catalogue Builder**, detailing both its core features and the underlying business logic that powers its operations.

---

## 🌟 Core Features

The platform transforms raw, messy sales reports into beautiful, fully-enriched digital product catalogues and marketing creatives.

1. **Automated Sales Parsing**
   - Upload raw CSV or Excel (`.xls`, `.xlsx`) sales reports.
   - Automatically parses vital metrics (MRP, Selling Price, Cost Price, Volumes).
   - Normalizes and cleans column headers.

2. **Intelligent Duplicate Removal**
   - Automatically detects and drops duplicate items to keep the catalogue pristine (especially useful for large files).

3. **AI Catalogue Enrichment (Powered by Google Gemini)**
   - **Data Extraction**: Cleans messy product names and detects Brands and Categories/Subcategories.
   - **Content Generation**: Generates 2-sentence engaging product descriptions and relevant tags.

4. **Image Discovery Engine**
   - Automatically fetches high-quality product images from the web using the DuckDuckGo Search API.

5. **Marketing Copy Generation**
   - Generates high-converting Push Notifications and WhatsApp messages tailored for every single product and campaign.

6. **Marketing Creative Generator**
   - Dynamically renders visual Campaign Posters (Best Sellers, Premium Selection, Clearance Sales).
   - Allows 1-click PNG downloads using `html2canvas`.

7. **Upload-Ready Export**
   - Export the finalized, AI-enriched dataset as a clean CSV ready for immediate upload to any admin dashboard or Shopify.

---

## 🧠 Business Logic & Implementation Details

The backend (FastAPI) handles the heavy lifting of data processing, while ensuring a non-blocking experience for the frontend.

### 1. Data Ingestion & Cleaning Pipeline
- **File Parsing**: When a user uploads a file (`/upload`), `pandas` reads the CSV or Excel file.
- **Normalization**: All column names are converted to lowercase and whitespace is stripped to handle messy headers (e.g., `" Product Name "` becomes `"product name"`).
- **Deduplication**: The system drops duplicate rows based entirely on the `product name` column, keeping only the first occurrence.
- **Safe Type Conversion**: A custom `safe_float` function guarantees that missing values or strings in numeric columns (like MRP, Selling Price, Cost Price, Total Quantity) safely default to `0.0` instead of crashing the system.

### 2. Financial Calculations
- **Margin Calculation**: The system automatically calculates the profit margin for each item:
  ```python
  margin = selling_price - cost_price
  ```
  *(Safeguarded against `None` values).*

### 3. AI Enrichment Logic (`ai_service.py`)
- **Limitation**: To prevent API rate limits and long processing times, the full AI enrichment is applied to the **first 20 products** of the dataset. The remaining products fall back to mock data.
- **Prompt Engineering**: Google Gemini (`gemini-1.5-flash`) is prompted as an "expert e-commerce data enrichment AI". It takes the raw `product name` and `category` and is instructed to return a strictly formatted JSON object containing:
  - `clean_name`
  - `brand`
  - `subcategory`
  - `tags` (array of 3-4 descriptive words)
  - `description`
  - `push_notification` (under 80 chars)
  - `whatsapp_message` (with emojis)
- **Fallback Mechanism**: If the Gemini API key is missing or an error occurs, the system smoothly falls back to a `get_mock_data` function that generates placeholder text for these fields.

### 4. Image Discovery Logic (`image_service.py`)
- **Web Scraping**: Uses `duckduckgo_search` to query the web.
- **Search Query Pattern**: The query is dynamically constructed as: `"{brand} {clean_product_name} product high quality"`.
- **Rate Limiting**: Includes a retry loop (up to 3 attempts) with an exponential backoff (`time.sleep(2 * (attempt + 1))`) if HTTP 403 or Rate Limit errors occur.
- **Fallback**: Returns placeholder images (`https://placehold.co/...`) if all attempts fail.

### 5. Asynchronous Processing
- The file upload endpoint instantly returns a unique `job_id` and adds the parsing/enrichment process to FastAPI's `BackgroundTasks`.
- The frontend continuously polls the `/catalogue/{job_id}` endpoint.
- An in-memory dictionary (`catalogues_db`) stores the state of the job (`processing`, `completed`, `failed`), and once complete, it stores the enriched array of products.
