import os
import json
import asyncio
import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Fallback DB path
FALLBACK_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
    "db_fallback.json"
)

class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.is_fallback = True
        self.lock = asyncio.Lock()  # Lock for thread-safe JSON file writes
        
    async def connect(self):
        try:
            print("Attempting to connect to MongoDB...")
            if self.client:
                try:
                    self.client.close()
                except Exception:
                    pass
            self.client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                retryWrites=True,
                retryReads=True,
                maxPoolSize=10,
                minPoolSize=1
            )
            # Test connection
            await self.client.admin.command('ping')
            self.db = self.client.get_database("wetalk_db")
            self.is_fallback = False
            print(f"MongoDB Connected successfully. Database: {self.db.name}")
            
            # Ensure unique index on user email field to prevent duplicate accounts
            try:
                await self.db.users.create_index("email", unique=True)
                print("Unique index on users.email ensured.")
            except Exception as e:
                print(f"Failed to create unique index on users.email: {e}")

            # Migration: Update any existing users named "Google Learner" to their email prefix or a cleaner name
            try:
                cursor = self.db.users.find({"name": "Google Learner"})
                async for user_doc in cursor:
                    email = user_doc.get("email", "")
                    new_name = email.split('@')[0].replace('.', ' ').title() if email else "Learner"
                    await self.db.users.update_one(
                        {"_id": user_doc["_id"]},
                        {"$set": {"name": new_name}}
                    )
                    print(f"Migration: Updated user name from 'Google Learner' to '{new_name}' (ID: {user_doc['_id']})")
            except Exception as e:
                print(f"Failed to run 'Google Learner' name migration: {e}")
        except Exception as e:
            print(f"MongoDB Connection failed: {e}")
            print(f"Using Offline Fallback Mode. Local DB path: {FALLBACK_DB_PATH}")
            self.is_fallback = True
            self._init_fallback_db()

    def _init_fallback_db(self):
        if not os.path.exists(FALLBACK_DB_PATH):
            data = {
                "users": [],
                "lessons": [],
                "userprogresses": [],
                "userstreaks": [],
                "notifications": [],
                "wtcointransactions": []
            }
            with open(FALLBACK_DB_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, default=str)

    def _read_fallback(self) -> Dict[str, List[Dict[str, Any]]]:
        self._init_fallback_db()
        try:
            with open(FALLBACK_DB_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading fallback database: {e}")
            return {"users": [], "lessons": [], "userprogresses": [], "userstreaks": [], "notifications": [], "wtcointransactions": []}

    def _write_fallback(self, data: Dict[str, List[Dict[str, Any]]]):
        try:
            with open(FALLBACK_DB_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            print(f"Error writing fallback database: {e}")

    # Helper to serialize dict for JSON/MongoDB representation
    def _clean_doc(self, doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not doc:
            return None
        doc = dict(doc)
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        
        # Convert date fields
        for k, v in doc.items():
            if isinstance(v, datetime.datetime):
                doc[k] = v.isoformat()
            elif isinstance(v, dict):
                doc[k] = self._clean_doc(v)
            elif isinstance(v, list):
                doc[k] = [self._clean_doc(item) if isinstance(item, dict) else item for item in v]
        return doc

    # --- Users Collection Operations ---
    async def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.strip().lower()
        if not self.is_fallback:
            user = await self.db.users.find_one({"email": email_clean})
            return self._clean_doc(user)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                for u in db_data.get("users", []):
                    if u.get("email", "").strip().lower() == email_clean:
                        return self._clean_doc(u)
            return None

    async def find_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_fallback:
            try:
                user = await self.db.users.find_one({"_id": ObjectId(user_id)})
                return self._clean_doc(user)
            except Exception:
                user = await self.db.users.find_one({"_id": user_id})
                return self._clean_doc(user)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                for u in db_data.get("users", []):
                    if str(u.get("_id")) == str(user_id):
                        return self._clean_doc(u)
            return None

    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_data = dict(user_data)
        if "createdAt" not in user_data:
            user_data["createdAt"] = datetime.datetime.utcnow().isoformat()
        
        if not self.is_fallback:
            res = await self.db.users.insert_one(user_data)
            user_data["_id"] = str(res.inserted_id)
            return self._clean_doc(user_data)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                if "_id" not in user_data:
                    user_data["_id"] = str(ObjectId())
                db_data["users"].append(user_data)
                self._write_fallback(db_data)
                return self._clean_doc(user_data)

    async def update_user(self, user_id: str, update_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.is_fallback:
            try:
                query = {"_id": ObjectId(user_id)}
                await self.db.users.update_one(query, update_dict)
                user = await self.db.users.find_one(query)
                return self._clean_doc(user)
            except Exception:
                query = {"_id": user_id}
                await self.db.users.update_one(query, update_dict)
                user = await self.db.users.find_one(query)
                return self._clean_doc(user)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                user_idx = -1
                for idx, u in enumerate(db_data.get("users", [])):
                    if str(u.get("_id")) == str(user_id):
                        user_idx = idx
                        break
                
                if user_idx != -1:
                    user = db_data["users"][user_idx]
                    if "$set" in update_dict:
                        for k, v in update_dict["$set"].items():
                            user[k] = v
                    elif "$inc" in update_dict:
                        for k, v in update_dict["$inc"].items():
                            user[k] = user.get(k, 0) + v
                    else:
                        for k, v in update_dict.items():
                            user[k] = v
                    db_data["users"][user_idx] = user
                    self._write_fallback(db_data)
                    return self._clean_doc(user)
            return None

    async def delete_user(self, user_id: str) -> bool:
        if not self.is_fallback:
            try:
                res = await self.db.users.delete_one({"_id": ObjectId(user_id)})
                return res.deleted_count > 0
            except Exception:
                res = await self.db.users.delete_one({"_id": user_id})
                return res.deleted_count > 0
        else:
            async with self.lock:
                db_data = self._read_fallback()
                initial_len = len(db_data["users"])
                db_data["users"] = [u for u in db_data["users"] if str(u.get("_id")) != str(user_id)]
                if len(db_data["users"]) < initial_len:
                    self._write_fallback(db_data)
                    return True
            return False

    # --- Lessons Collection Operations ---
    async def find_lesson_by_number(self, lesson_number: int) -> Optional[Dict[str, Any]]:
        if not self.is_fallback:
            lesson = await self.db.lessons.find_one({"lessonNumber": int(lesson_number)})
            return self._clean_doc(lesson)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                for l in db_data.get("lessons", []):
                    if int(l.get("lessonNumber", 0)) == int(lesson_number):
                        return self._clean_doc(l)
            return None

    async def get_all_lessons(self) -> List[Dict[str, Any]]:
        if not self.is_fallback:
            cursor = self.db.lessons.find().sort("lessonNumber", 1)
            lessons = await cursor.to_list(length=100)
            return [self._clean_doc(l) for l in lessons]
        else:
            async with self.lock:
                db_data = self._read_fallback()
                lessons = sorted(db_data.get("lessons", []), key=lambda x: int(x.get("lessonNumber", 0)))
                return [self._clean_doc(l) for l in lessons]

    async def create_lessons(self, lessons_list: List[Dict[str, Any]]):
        if not self.is_fallback:
            await self.db.lessons.delete_many({})
            await self.db.lessons.insert_many(lessons_list)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                db_data["lessons"] = []
                for l in lessons_list:
                    if "_id" not in l:
                        l["_id"] = str(ObjectId())
                    db_data["lessons"].append(l)
                self._write_fallback(db_data)

    # --- UserProgress Collection Operations ---
    async def find_user_progress(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_fallback:
            progress = await self.db.userprogresses.find_one({"userId": user_id})
            if not progress:
                try:
                    progress = await self.db.userprogresses.find_one({"userId": ObjectId(user_id)})
                except Exception:
                    pass
            return self._clean_doc(progress)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                for p in db_data.get("userprogresses", []):
                    if str(p.get("userId")) == str(user_id):
                        return self._clean_doc(p)
            return None

    async def create_user_progress(self, progress_data: Dict[str, Any]) -> Dict[str, Any]:
        progress_data = dict(progress_data)
        if "createdAt" not in progress_data:
            progress_data["createdAt"] = datetime.datetime.utcnow().isoformat()
            
        if not self.is_fallback:
            res = await self.db.userprogresses.insert_one(progress_data)
            progress_data["_id"] = str(res.inserted_id)
            return self._clean_doc(progress_data)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                if "_id" not in progress_data:
                    progress_data["_id"] = str(ObjectId())
                db_data["userprogresses"].append(progress_data)
                self._write_fallback(db_data)
                return self._clean_doc(progress_data)

    async def update_user_progress(self, user_id: str, update_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.is_fallback:
            query = {"userId": user_id}
            await self.db.userprogresses.update_one(query, update_dict)
            progress = await self.db.userprogresses.find_one(query)
            if not progress:
                try:
                    query = {"userId": ObjectId(user_id)}
                    await self.db.userprogresses.update_one(query, update_dict)
                    progress = await self.db.userprogresses.find_one(query)
                except Exception:
                    pass
            return self._clean_doc(progress)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                idx_found = -1
                for idx, p in enumerate(db_data.get("userprogresses", [])):
                    if str(p.get("userId")) == str(user_id):
                        idx_found = idx
                        break
                
                if idx_found != -1:
                    progress = db_data["userprogresses"][idx_found]
                    if "$set" in update_dict:
                        for k, v in update_dict["$set"].items():
                            if "." in k:
                                parts = k.split(".")
                                if len(parts) == 2:
                                    if parts[0] not in progress:
                                        progress[parts[0]] = {}
                                    progress[parts[0]][parts[1]] = v
                            else:
                                progress[k] = v
                    else:
                        for k, v in update_dict.items():
                            progress[k] = v
                    db_data["userprogresses"][idx_found] = progress
                    self._write_fallback(db_data)
                    return self._clean_doc(progress)
            return None

    # --- UserStreak Collection Operations ---
    async def find_user_streak(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_fallback:
            streak = await self.db.userstreaks.find_one({"userId": user_id})
            if not streak:
                try:
                    streak = await self.db.userstreaks.find_one({"userId": ObjectId(user_id)})
                except Exception:
                    pass
            return self._clean_doc(streak)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                for s in db_data.get("userstreaks", []):
                    if str(s.get("userId")) == str(user_id):
                        return self._clean_doc(s)
            return None

    async def create_user_streak(self, streak_data: Dict[str, Any]) -> Dict[str, Any]:
        streak_data = dict(streak_data)
        if "createdAt" not in streak_data:
            streak_data["createdAt"] = datetime.datetime.utcnow().isoformat()
            
        if not self.is_fallback:
            res = await self.db.userstreaks.insert_one(streak_data)
            streak_data["_id"] = str(res.inserted_id)
            return self._clean_doc(streak_data)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                if "_id" not in streak_data:
                    streak_data["_id"] = str(ObjectId())
                db_data["userstreaks"].append(streak_data)
                self._write_fallback(db_data)
                return self._clean_doc(streak_data)

    async def update_user_streak(self, user_id: str, update_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.is_fallback:
            query = {"userId": user_id}
            await self.db.userstreaks.update_one(query, update_dict)
            streak = await self.db.userstreaks.find_one(query)
            if not streak:
                try:
                    query = {"userId": ObjectId(user_id)}
                    await self.db.userstreaks.update_one(query, update_dict)
                    streak = await self.db.userstreaks.find_one(query)
                except Exception:
                    pass
            return self._clean_doc(streak)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                idx_found = -1
                for idx, s in enumerate(db_data.get("userstreaks", [])):
                    if str(s.get("userId")) == str(user_id):
                        idx_found = idx
                        break
                
                if idx_found != -1:
                    streak = db_data["userstreaks"][idx_found]
                    if "$set" in update_dict:
                        for k, v in update_dict["$set"].items():
                            streak[k] = v
                    elif "$inc" in update_dict:
                        for k, v in update_dict["$inc"].items():
                            streak[k] = streak.get(k, 0) + v
                    else:
                        for k, v in update_dict.items():
                            streak[k] = v
                    db_data["userstreaks"][idx_found] = streak
                    self._write_fallback(db_data)
                    return self._clean_doc(streak)
            return None

    # --- Notifications Collection Operations ---
    async def get_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.is_fallback:
            cursor = self.db.notifications.find({"user": user_id}).sort("createdAt", -1)
            notifs = await cursor.to_list(length=500)
            if not notifs:
                try:
                    cursor = self.db.notifications.find({"user": ObjectId(user_id)}).sort("createdAt", -1)
                    notifs = await cursor.to_list(length=500)
                except Exception:
                    pass
            return [self._clean_doc(n) for n in notifs]
        else:
            async with self.lock:
                db_data = self._read_fallback()
                notifs = [n for n in db_data.get("notifications", []) if str(n.get("user")) == str(user_id)]
                notifs = sorted(notifs, key=lambda x: x.get("createdAt", ""), reverse=True)
                return [self._clean_doc(n) for n in notifs]

    async def create_notifications(self, notifications: List[Dict[str, Any]]):
        if not self.is_fallback:
            await self.db.notifications.insert_many(notifications)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                for n in notifications:
                    n = dict(n)
                    if "_id" not in n:
                        n["_id"] = str(ObjectId())
                    db_data["notifications"].append(n)
                self._write_fallback(db_data)

    async def clear_notifications(self, user_id: str):
        if not self.is_fallback:
            await self.db.notifications.delete_many({"user": user_id})
            try:
                await self.db.notifications.delete_many({"user": ObjectId(user_id)})
            except Exception:
                pass
        else:
            async with self.lock:
                db_data = self._read_fallback()
                db_data["notifications"] = [n for n in db_data["notifications"] if str(n.get("user")) != str(user_id)]
                self._write_fallback(db_data)

    async def update_notification(self, notification_id: str, user_id: str, update_dict: Dict[str, Any]) -> bool:
        if not self.is_fallback:
            try:
                res = await self.db.notifications.update_one(
                    {"_id": ObjectId(notification_id), "user": user_id},
                    update_dict
                )
                return res.modified_count > 0
            except Exception:
                try:
                    res = await self.db.notifications.update_one(
                        {"_id": notification_id, "user": user_id},
                        update_dict
                    )
                    return res.modified_count > 0
                except Exception:
                    return False
        else:
            async with self.lock:
                db_data = self._read_fallback()
                for n in db_data.get("notifications", []):
                    if str(n.get("_id")) == str(notification_id) and str(n.get("user")) == str(user_id):
                        if "$set" in update_dict:
                            for k, v in update_dict["$set"].items():
                                n[k] = v
                        else:
                            for k, v in update_dict.items():
                                n[k] = v
                        self._write_fallback(db_data)
                        return True
            return False

    async def create_coin_transaction(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        tx_data = dict(tx_data)
        if "date" not in tx_data:
            tx_data["date"] = datetime.datetime.utcnow().isoformat()
            
        if not self.is_fallback:
            res = await self.db.wtcointransactions.insert_one(tx_data)
            tx_data["_id"] = str(res.inserted_id)
            return self._clean_doc(tx_data)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                if "wtcointransactions" not in db_data:
                    db_data["wtcointransactions"] = []
                if "_id" not in tx_data:
                    tx_data["_id"] = str(ObjectId())
                db_data["wtcointransactions"].append(tx_data)
                self._write_fallback(db_data)
                return self._clean_doc(tx_data)

    async def get_coin_transactions(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.is_fallback:
            cursor = self.db.wtcointransactions.find({"userId": user_id}).sort("date", -1)
            txs = await cursor.to_list(length=500)
            if not txs:
                try:
                    cursor = self.db.wtcointransactions.find({"userId": ObjectId(user_id)}).sort("date", -1)
                    txs = await cursor.to_list(length=500)
                except Exception:
                    pass
            return [self._clean_doc(t) for t in txs]
        else:
            async with self.lock:
                db_data = self._read_fallback()
                txs = [t for t in db_data.get("wtcointransactions", []) if str(t.get("userId")) == str(user_id)]
                txs = sorted(txs, key=lambda x: x.get("date", ""), reverse=True)
                return [self._clean_doc(t) for t in txs]

    async def find_coin_transaction(self, user_id: str, reward_type: str, match_metadata: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        if not self.is_fallback:
            query = {"userId": user_id, "rewardType": reward_type}
            if match_metadata:
                for k, v in match_metadata.items():
                    query[f"metadata.{k}"] = v
            
            tx = await self.db.wtcointransactions.find_one(query)
            if not tx:
                try:
                    query["userId"] = ObjectId(user_id)
                    tx = await self.db.wtcointransactions.find_one(query)
                except Exception:
                    pass
            return self._clean_doc(tx)
        else:
            async with self.lock:
                db_data = self._read_fallback()
                for t in db_data.get("wtcointransactions", []):
                    if str(t.get("userId")) == str(user_id) and t.get("rewardType") == reward_type:
                        if match_metadata:
                            meta = t.get("metadata", {})
                            matches = True
                            for k, v in match_metadata.items():
                                if meta.get(k) != v:
                                    matches = False
                                    break
                            if not matches:
                                continue
                        return self._clean_doc(t)
            return None

db = DatabaseManager()

# Safe background task creation at import time
try:
    loop = asyncio.get_running_loop()
    loop.create_task(db.connect())
except RuntimeError:
    # No running event loop (e.g. during serverless import).
    # Connection will be initiated during FastAPI startup.
    pass
