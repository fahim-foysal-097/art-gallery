import os
from PIL import Image

# --- CONFIGURATION VARIABLES ---
# relative to where running the script!
INPUT_DIR = "./assets/img/"
OUTPUT_DIR = "./assets/thumbs/"
THUMB_PREFIX = "thumb-"
MAX_SIZE = (600, 600)  # Maximum width/height.
OUTPUT_FORMAT = "WEBP"
QUALITY = 80           # 0 to 100

def create_thumbnails():
    if not os.path.exists(INPUT_DIR):
        print(f"Error: Input directory '{INPUT_DIR}' not found.")
        return

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    supported_formats = ('.png', '.jpg', '.jpeg', '.webp', '.bmp')

    for filename in os.listdir(INPUT_DIR):
        # Skip files that are already thumbnails
        if filename.startswith(THUMB_PREFIX):
            continue

        if filename.lower().endswith(supported_formats):
            input_path = os.path.join(INPUT_DIR, filename)
            
            # Extract name without extension and create new output path
            name_without_ext = os.path.splitext(filename)[0]
            new_filename = f"{THUMB_PREFIX}{name_without_ext}.webp"
            output_path = os.path.join(OUTPUT_DIR, new_filename)

            try:
                with Image.open(input_path) as img:
                    # Convert to RGB if image has transparency (RGBA) and saving as JPEG-like format
                    # WEBP supports RGBA, but it's good practice to ensure compatibility
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    # thumbnail() modifies the image in-place and preserves aspect ratio
                    img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
                    
                    img.save(output_path, format=OUTPUT_FORMAT, quality=QUALITY)
                    print(f"Generated: {new_filename}")
            except Exception as e:
                print(f"Failed to process {filename}: {e}")

if __name__ == "__main__":
    print("Starting thumbnail generation...")
    create_thumbnails()
    print("Done!")