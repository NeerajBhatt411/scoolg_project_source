from PIL import Image
import sys

def make_square(image_path, size, save_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    
    # Calculate padding to make it square
    width, height = img.size
    max_dim = max(width, height)
    
    # Create a new square transparent image
    square_img = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    
    # Paste original image in the center
    paste_x = (max_dim - width) // 2
    paste_y = (max_dim - height) // 2
    square_img.paste(img, (paste_x, paste_y), img)
    
    # Resize to the target size
    square_img = square_img.resize((size, size), Image.Resampling.LANCZOS)
    square_img.save(save_path, "PNG")

logo_path = r"c:\Users\neera\Downloads\scoolg_project_source\scoolg-teacher-pwa\public\scoolg-logo.png"

make_square(logo_path, 512, r"c:\Users\neera\Downloads\scoolg_project_source\scoolg-teacher-pwa\public\pwa-512x512.png")
make_square(logo_path, 192, r"c:\Users\neera\Downloads\scoolg_project_source\scoolg-teacher-pwa\public\pwa-192x192.png")

make_square(logo_path, 512, r"c:\Users\neera\Downloads\scoolg_project_source\scoolg-student-pwa\public\pwa-512x512.png")
make_square(logo_path, 192, r"c:\Users\neera\Downloads\scoolg_project_source\scoolg-student-pwa\public\pwa-192x192.png")

print("Square icons generated successfully!")
