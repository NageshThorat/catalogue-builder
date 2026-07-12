import pandas as pd
import random

def generate_sample_sales_report():
    data = {
        "Product Name": [
            "Wireless Bluetooth Earbuds",
            "Smart Fitness Watch",
            "Ergonomic Office Chair",
            "Mechanical Gaming Keyboard",
            "Noise Cancelling Headphones",
            "4K Ultra HD Monitor",
            "Portable Power Bank 20000mAh",
            "Stainless Steel Water Bottle",
            "Yoga Mat with Alignment Lines",
            "LED Desk Lamp with Wireless Charging"
        ],
        "Category": [
            "Electronics", "Electronics", "Furniture", "Electronics", "Electronics",
            "Electronics", "Electronics", "Home & Kitchen", "Fitness", "Home & Office"
        ],
        "MRP": [2999, 4999, 8500, 3500, 8999, 25000, 1500, 800, 1200, 2000]
    }
    
    # Calculate selling price and cost price based on MRP
    selling_prices = []
    cost_prices = []
    quantities = []
    
    for mrp in data["MRP"]:
        sp = int(mrp * random.uniform(0.7, 0.95))
        cp = int(sp * random.uniform(0.5, 0.8))
        selling_prices.append(sp)
        cost_prices.append(cp)
        quantities.append(random.randint(5, 50))
        
    data["Selling Price"] = selling_prices
    data["Cost Price"] = cost_prices
    data["Quantity Sold"] = quantities
    
    df = pd.DataFrame(data)
    
    # Calculate Profit/Loss
    df["Profit/Loss"] = (df["Selling Price"] - df["Cost Price"]) * df["Quantity Sold"]
    
    df.to_csv("sample_sales_report.csv", index=False)
    print("Generated sample_sales_report.csv successfully.")

if __name__ == "__main__":
    generate_sample_sales_report()
