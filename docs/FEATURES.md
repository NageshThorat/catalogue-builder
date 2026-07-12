# Features of Intelligent Catalogue Builder

The Intelligent Catalogue Builder is designed to automate the transformation of raw, messy sales reports into fully enriched digital product catalogues and marketing creatives. Below is a comprehensive list of all the features offered by the platform.

## 1. Automated Data Ingestion & Parsing
- **Format Support**: Accepts raw sales reports in `.csv`, `.xls`, and `.xlsx` formats.
- **Data Parsing**: Automatically extracts vital metrics such as MRP, Selling Price, Cost Price, total quantity, and product codes.
- **Column Normalization**: Handles messy or mixed-case column headers intelligently.

## 2. Intelligent Data Cleaning
- **Duplicate Removal**: Automatically detects and drops duplicate items based on product names to ensure a pristine and accurate catalogue, which is especially useful for files with thousands of rows.

## 3. AI Catalogue Enrichment (Powered by Google Gemini)
- **Product Name Cleaning**: Transforms messy, truncated, or inconsistent product names into clean, readable titles.
- **Categorization**: Automatically detects and assigns products to appropriate Brands, Categories, and Subcategories.
- **Description Generation**: Writes engaging, 2-sentence product descriptions for every item.
- **Tagging**: Generates relevant tags for searchability and organization.

## 4. Image Discovery Engine
- **Automated Image Fetching**: Uses the DuckDuckGo Search API to perform real-time web scraping for high-quality product images.
- **Accurate Matching**: Searches using the exact AI-extracted Brand and Clean Name to ensure highly relevant image results.

## 5. Marketing Copy Generation
- **Push Notifications**: Automatically writes custom, high-converting push notification copy for every single product and campaign.
- **WhatsApp Messages**: Generates engaging WhatsApp message copy tailored to the specific product and its campaign tone.
- **1-Click Copy**: Easily copy the generated marketing text directly from the dashboard to paste into marketing tools.

## 6. Marketing Creative Generator
- **Dynamic Campaign Posters**: Automatically groups products into campaigns (e.g., Best Sellers, Premium Selection, Clearance Sales) and dynamically designs visually appealing posters.
- **1-Click PNG Downloads**: Built-in support to instantly download the generated posters as high-quality `.png` images using `html2canvas`, ready for social media posting (Instagram, Facebook, etc.).

## 7. Asynchronous Background Processing
- **Non-Blocking Execution**: Large file uploads are accepted immediately, returning a `job_id` while processing happens in the background.
- **Real-Time Polling**: The frontend continuously polls the backend to track processing status, allowing users to see when their catalogue is ready without freezing the browser.

## 8. Export and Integration Ready
- **Upload-Ready Export**: Export the finalized, AI-enriched dataset as a clean CSV file with a single click.
- **Platform Agnostic**: The exported CSV is structured and ready for immediate upload to any admin dashboard, Shopify, or inventory management system.
