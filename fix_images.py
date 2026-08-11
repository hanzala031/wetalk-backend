import os
import sys
import subprocess

def install_pillow():
    print("Checking Pillow (image library) installation...")
    try:
        from PIL import Image
        print("Pillow is already installed.")
    except ImportError:
        print("Pillow not found. Installing Pillow...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "Pillow"], check=True)
            print("Pillow installed successfully.")
        except Exception as e:
            print(f"Failed to install Pillow: {e}")
            print("Please run: pip install Pillow manually and then run this script.")
            sys.exit(1)

def fix_png_images():
    from PIL import Image
    assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "images")
    if not os.path.exists(assets_dir):
        print(f"Directory not found: {assets_dir}")
        return

    print(f"\nScanning and fixing PNG files in: {assets_dir}")
    fixed_count = 0
    for file in os.listdir(assets_dir):
        if file.lower().endswith(".png"):
            path = os.path.join(assets_dir, file)
            try:
                # Open image and re-save as true PNG format
                with Image.open(path) as img:
                    img.save(path, "PNG")
                print(f"✅ Properly formatted & verified: {file}")
                fixed_count += 1
            except Exception as e:
                print(f"❌ Error processing {file}: {e}")
                
    print(f"\n🎉 Done! Verified and fixed {fixed_count} PNG files successfully.")

if __name__ == "__main__":
    install_pillow()
    fix_png_images()
