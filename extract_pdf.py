import pdfplumber
import pandas as pd
import sys

def extract_pdf_to_csv(pdf_path, csv_path):
    all_data = []
    headers = None
    
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            table = page.extract_table()
            if table:
                if i == 0:
                    # First page has headers
                    headers = table[0]
                    # Sometimes headers are split across multiple lines in the cell, replace newlines with space
                    headers = [str(h).replace('\n', ' ') if h else '' for h in headers]
                    all_data.extend(table[1:])
                else:
                    all_data.extend(table)
            print(f"Processed page {i+1}/{len(pdf.pages)}")
            
    # Clean data: remove newlines inside cells
    cleaned_data = []
    for row in all_data:
        cleaned_row = [str(cell).replace('\n', ' ') if cell else '' for cell in row]
        cleaned_data.append(cleaned_row)
        
    df = pd.DataFrame(cleaned_data, columns=headers)
    df.to_csv(csv_path, index=False)
    print(f"Successfully extracted data to {csv_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python extract_pdf.py <input.pdf> <output.csv>")
        sys.exit(1)
        
    extract_pdf_to_csv(sys.argv[1], sys.argv[2])
