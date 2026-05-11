import os
from PIL import Image

# --- CONFIGURATION VARIABLES ---
INPUT_DIR = "./original/"
OUTPUT_DIR = "./assets/img/"
MAX_RESOLUTION = (1920, 1920)
OUTPUT_FORMAT = "JPEG"
QUALITY = 70

def compress_images():
    if not os.path.exists(INPUT_DIR):
        print(f"Error: Input directory '{INPUT_DIR}' not found.")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    supported_formats = ('.png', '.jpg', '.jpeg', '.webp', '.bmp')

    for filename in os.listdir(INPUT_DIR):
        if filename.lower().endswith(supported_formats):
            input_path = os.path.join(INPUT_DIR, filename)
            
            # Keep the exact same name, but ensure the extension matches the output format
            name_without_ext = os.path.splitext(filename)[0]
            new_filename = f"{name_without_ext}.jpg"
            output_path = os.path.join(OUTPUT_DIR, new_filename)

            try:
                with Image.open(input_path) as img:
                    # Convert to RGB to ensure we can save as JPEG
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    # Resize if the image is larger than our max bounds
                    img.thumbnail(MAX_RESOLUTION, Image.Resampling.LANCZOS)
                    
                    # Save with low quality for maximum file size reduction
                    # optimize=True does extra passes to shrink file size further
                    img.save(output_path, format=OUTPUT_FORMAT, quality=QUALITY, optimize=True)
                    
                    # Get file sizes to show the user the savings
                    orig_size = os.path.getsize(input_path) / 1024
                    new_size = os.path.getsize(output_path) / 1024
                    print(f"Compressed {filename}: {orig_size:.1f}KB -> {new_size:.1f}KB")
                    
            except Exception as e:
                print(f"Failed to process {filename}: {e}")

if __name__ == "__main__":
    print("Starting heavy image compression...")
    compress_images()
    print("Done!")