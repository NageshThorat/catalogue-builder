# User Guide

Welcome to the **Intelligent Catalogue Builder**! This tool transforms your raw, messy sales reports into a beautifully enriched product catalogue and generates ready-to-use marketing creatives.

Follow this guide to get the most out of the platform.

---

## 1. Preparing Your Data

The system accepts `.csv`, `.xls`, or `.xlsx` files.

For the best results, your file should include the following column headers (they can be messy or mixed case, but having these keywords helps):
- `product name` (Required - used to remove duplicates)
- `category`
- `mrp`
- `selling price`
- `cost price`
- `product code`
- `total quantity`

*Note: If your file has thousands of rows, the system will automatically drop duplicates to keep the catalogue clean.*

---

## 2. Uploading Your File

1. Open the Web Application in your browser (usually `http://localhost:5173`).
2. On the home page, click the large **Upload** area or drag and drop your Excel/CSV file into it.
3. Once the file is selected, the system will begin processing.
4. You will see a loading animation while the AI works in the background to clean product names, generate descriptions, write marketing copy, and fetch real images. 

*(Please be patient if you have a large file, as the AI needs time to carefully write copy for each item!)*

---

## 3. Viewing the Catalogue

Once processing is complete, you will be taken to the Dashboard.

### The Digital Catalogue Tab
- This is a beautiful grid view of all your products.
- Click on any product card to see the **AI Enriched** data, including the detected Brand, clean name, and the AI-generated descriptions.
- You can review the margins (Selling Price vs Cost Price) calculated automatically for you.

### Exporting the Clean Data
- Click the **Export CSV** button in the top right corner.
- This will download a completely cleaned and enriched CSV file. You can upload this new CSV directly to your admin dashboard, Shopify, or inventory management system!

---

## 4. Generating Marketing Creatives

Click on the **Marketing Creatives** tab at the top of the dashboard. This is where the magic happens!

The system takes your enriched products and automatically groups them into campaigns:
- **Best Sellers**
- **Premium Selection**
- **Clearance Sales**

### Downloading Posters
For every product, the system dynamically designs a beautiful, visually appealing poster.
- Simply click the **Download Poster** button underneath a poster.
- It will instantly save a high-quality `.png` image to your computer, ready to be posted on Instagram, Facebook, or your website.

### Copying Push Notifications & WhatsApp Messages
- Underneath each product in the Creatives tab, you will see pre-written **Push Notifications** and **WhatsApp Messages**.
- These are custom-written by the AI to match the specific product and campaign tone.
- Click the **Copy** button next to them to easily paste them into your marketing tools!
