import os
import shutil
import subprocess
import sys

def run_command(cmd, desc):
    print(f"🔄 {desc}...")
    try:
        subprocess.run(cmd, shell=True, check=True)
        print(f"✅ {desc} completed successfully.")
        return True
    except Exception as e:
        print(f"❌ Failed: {desc}. Error: {e}")
        return False

def main():
    print("==================================================")
    print("🚀 WeTalk Backend Migration & Cleanup Script")
    print("==================================================\n")
    
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)

    # 1. Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("⚠️ Warning: Dependency installation failed. Please run: pip install -r requirements.txt manually.")

    # 2. Run Seeding Script
    print("🌱 Seeding lessons...")
    try:
        # Import and run seed script directly in the same Python process
        import seed_lessons
        import asyncio
        asyncio.run(seed_lessons.main())
        print("✅ Seeding completed.")
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        print("Please run: python seed_lessons.py manually after installing dependencies.")
        return

    # 3. Clean up Node.js files
    print("\n🧹 Cleaning up old Node.js backend files...")
    
    files_to_delete = [
        "server.js",
        "package.json",
        "package-lock.json",
        "server.log",
        "server-err.log",
        "seedLessons.js"
    ]
    
    folders_to_delete = [
        "src",
        "node_modules"
    ]
    
    for f in files_to_delete:
        path = os.path.join(backend_dir, f)
        if os.path.exists(path):
            try:
                os.remove(path)
                print(f"🗑️ Deleted file: {f}")
            except Exception as e:
                print(f"⚠️ Could not delete file {f}: {e}")
                
    for folder in folders_to_delete:
        path = os.path.join(backend_dir, folder)
        if os.path.exists(path):
            try:
                shutil.rmtree(path)
                print(f"🗑️ Deleted directory: {folder}/")
            except Exception as e:
                print(f"⚠️ Could not delete directory {folder}: {e}")

    print("\n🎉 Backend Migration Successful!")
    print("Your backend has been completely migrated to FastAPI (Python).")
    print("To start the server, run:")
    print("   python run.py")
    print("==================================================")

if __name__ == "__main__":
    main()
