from duckduckgo_search import DDGS
import time

def get_product_images(product_name, brand, num_images=3):
    """
    Fetches real product images using DuckDuckGo image search.
    """
    query = f"{brand} {product_name} product high quality"
    
    for attempt in range(3):
        try:
            results = DDGS().images(
                keywords=query,
                region="wt-wt",
                safesearch="moderate",
                size="Medium",
                max_results=num_images
            )
            
            images = []
            for r in results:
                if "image" in r:
                    images.append(r["image"])
                    
            if images:
                return images
                
        except Exception as e:
            if "403" in str(e) or "Ratelimit" in str(e):
                print(f"Rate limited on {product_name}. Retrying in {2 * (attempt + 1)} seconds...")
                time.sleep(2 * (attempt + 1))
            else:
                print(f"Error fetching images for {product_name}: {e}")
                break
                
    return [
        "https://placehold.co/400x400/png?text=Image+Search+Error",
        "https://placehold.co/400x400/png?text=Image+Search+Error"
    ]
