import os
import json
import asyncio
import subprocess
from app.db import db
from app.config import settings

async def main():
    print("🌱 Starting Lesson Seeding Script...")
    
    # 1. Connect to Database Manager
    await db.connect()
    
    lessons = []
    
    # 2. Check if we have lessons in db_fallback.json
    fallback_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db_fallback.json")
    if os.path.exists(fallback_path):
        try:
            with open(fallback_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                lessons = data.get("lessons", [])
                print(f"📖 Loaded {len(lessons)} lessons from local db_fallback.json")
        except Exception as e:
            print(f"⚠️ Could not load lessons from db_fallback.json: {e}")
            
    # 3. If db_fallback was empty or missing, try extracting from seedLessons.js using Node
    js_seed_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seedLessons.js")
    if not lessons and os.path.exists(js_seed_path):
        print("🔗 Extracting lessons from seedLessons.js via Node...")
        try:
            cmd = [
                "node", 
                "-e", 
                "const fs = require('fs'); const content = fs.readFileSync('seedLessons.js', 'utf8'); eval(content + '; console.log(JSON.stringify(lessons))')"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            lessons = json.loads(result.stdout)
            print(f"✅ Extracted {len(lessons)} lessons from seedLessons.js")
        except Exception as e:
            print(f"❌ Failed to extract lessons from seedLessons.js: {e}")
            
    if not lessons:
        print("❌ No lessons found to seed! Exiting.")
        return
        
    # 4. Seed database
    if not db.is_fallback:
        print(f"☁️ Connected to MongoDB Atlas. Seeding {len(lessons)} lessons...")
        try:
            # Delete existing lessons to prevent duplicates
            await db.db.lessons.delete_many({})
            res = await db.db.lessons.insert_many(lessons)
            print(f"🎉 Successfully seeded {len(res.inserted_ids)} lessons in MongoDB Atlas!")
        except Exception as e:
            print(f"❌ Database error seeding lessons: {e}")
    else:
        print(f"🗄️ Connected to Offline Fallback JSON. Seeding {len(lessons)} lessons...")
        await db.create_lessons(lessons)
        print(f"🎉 Successfully seeded lessons in local db_fallback.json!")

if __name__ == "__main__":
    asyncio.run(main())
