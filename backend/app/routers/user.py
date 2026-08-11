import re
import json
import datetime
from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile
from typing import Dict, Any, List, Optional
from app.dependencies import get_current_user
from app.db import db
from app.utils.cloudinary import upload_image_to_cloudinary
from app.utils.coin_helper import award_lesson_and_module_rewards
from app.models.user import UpdateProfileRequest, UploadImageRequest, SyncProgressRequest, UpdateSettingsRequest

router = APIRouter(prefix="/api/user", tags=["user"])

# Helper to format relative notification times
def format_time(created_at_str: str) -> str:
    try:
        clean_str = created_at_str.replace("Z", "+00:00")
        created_at = datetime.datetime.fromisoformat(clean_str)
        if created_at.tzinfo is not None:
            created_at = created_at.astimezone(datetime.timezone.utc).replace(tzinfo=None)
    except Exception:
        return "Just now"
        
    now = datetime.datetime.utcnow()
    diff = now - created_at
    seconds = diff.total_seconds()
    minutes = int(seconds // 60)
    hours = int(minutes // 60)
    days = int(hours // 24)
    
    if minutes < 1:
        return "Just now"
    if minutes < 60:
        return f"{minutes}m ago"
    if hours < 24:
        return f"{hours}h ago"
    if days < 7:
        return f"{days}d ago"
    return created_at.strftime("%m/%d/%Y")

@router.get("/profile")
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "_id": current_user["_id"],
            "name": current_user.get("name", "Learner"),
            "email": current_user.get("email"),
            "profileImage": current_user.get("profileImage", "default-avatar.png"),
            "learningGoal": current_user.get("learningGoal", "Casual"),
            "targetLanguage": current_user.get("targetLanguage", "English"),
            "xp": current_user.get("xp", 0),
            "coins": current_user.get("coins", 0),
            "wtCoins": current_user.get("wtCoins", 0),
            "streak": current_user.get("streak", 0),
            "createdAt": current_user.get("createdAt")
        }
    }

@router.put("/profile")
async def update_profile(body: UpdateProfileRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    update_fields = {}
    if body.name is not None:
        update_fields["name"] = body.name
    if body.email is not None:
        update_fields["email"] = body.email.strip().lower()
    if body.profileImage is not None:
        update_fields["profileImage"] = body.profileImage
    if body.learningGoal is not None:
        update_fields["learningGoal"] = body.learningGoal
    if body.targetLanguage is not None:
        update_fields["targetLanguage"] = body.targetLanguage
    if body.wtCoins is not None:
        update_fields["wtCoins"] = body.wtCoins
    if body.isProfileCompleted is not None:
        update_fields["isProfileCompleted"] = body.isProfileCompleted
        
    if update_fields:
        user = await db.update_user(user_id, {"$set": update_fields})
    else:
        user = current_user
        
    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "_id": user["_id"],
            "name": user.get("name"),
            "email": user.get("email"),
            "profileImage": user.get("profileImage"),
            "learningGoal": user.get("learningGoal"),
            "targetLanguage": user.get("targetLanguage"),
            "wtCoins": user.get("wtCoins", 0),
            "isProfileCompleted": user.get("isProfileCompleted", False),
        }
    }

@router.post("/upload-image")
async def upload_image(body: UploadImageRequest):
    base64_data = body.base64Data
    
    # Validate base64 format
    matches = re.match(r"^data:([A-Za-z-+\/]+);base64,(.+)$", base64_data)
    if not matches:
        raise HTTPException(status_code=400, detail={"success": False, "message": "Invalid base64 image data format"})
        
    # Check size (~2MB)
    base64_str = matches.group(2)
    size_in_bytes = (len(base64_str) * 3) / 4
    if size_in_bytes > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail={"success": False, "message": "Image too large. Please use an image under 2MB."})
        
    print("Image accepted as base64 data URL")
    return {
        "success": True,
        "secure_url": base64_data
    }


@router.post("/upload-profile/{user_id}")
async def upload_profile_picture(user_id: str, file: UploadFile = File(...)):
    # 1. Validate that the uploaded file type starts with image/
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. File must be an image."
        )
        
    try:
        # 2. Read image file bytes
        file_bytes = await file.read()
        
        # 3. Upload to Cloudinary inside wetalk/profile_pictures folder
        secure_url = upload_image_to_cloudinary(
            file_bytes=file_bytes,
            folder_path="wetalk/profile_pictures"
        )
        
        # 4. Update the user document in MongoDB Atlas
        # Set both profilePic and profileImage to remain fully compatible
        update_data = {
            "$set": {
                "profilePic": secure_url,
                "profileImage": secure_url
            }
        }
        user = await db.update_user(user_id, update_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return {
            "success": True,
            "message": "Profile picture updated successfully",
            "profilePicUrl": secure_url
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading profile image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}"
        )

@router.get("/sync")
async def get_progress(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "progressData": current_user.get("progressData", {}) or {}
    }

@router.post("/sync")
async def save_progress(body: SyncProgressRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    progress_data = body.progressData
    
    await db.update_user(user_id, {"$set": {"progressData": progress_data}})
    current_user["progressData"] = progress_data
    
    rewards_earned = []
    if progress_data and "completed_lessons" in progress_data:
        try:
            raw = progress_data["completed_lessons"]
            completed_list = []
            if isinstance(raw, str):
                completed_list = json.loads(raw)
            elif isinstance(raw, list):
                completed_list = raw
                
            completed_lessons = [int(x) for x in completed_list if str(x).isdigit()]
            
            for lesson_num in completed_lessons:
                rewards = await award_lesson_and_module_rewards(current_user, lesson_num, completed_lessons)
                if rewards:
                    rewards_earned.extend(rewards)
        except Exception as e:
            print(f"Error processing rewards during sync: {e}")
            
    return {
        "success": True,
        "message": "Progress synced successfully",
        "rewardsEarned": rewards_earned
    }

@router.get("/settings")
async def get_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "settings": {
            "learningGoal": current_user.get("learningGoal", "Casual"),
            "targetLanguage": current_user.get("targetLanguage", "English"),
            "notificationPrefs": current_user.get("notificationPrefs", {}) or {},
            "privacySettings": current_user.get("privacySettings", {}) or {}
        }
    }

@router.put("/settings")
async def update_settings(body: UpdateSettingsRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    update_dict = {}
    if body.learningGoal is not None:
        update_dict["learningGoal"] = body.learningGoal
    if body.targetLanguage is not None:
        update_dict["targetLanguage"] = body.targetLanguage
        
    if body.notificationPrefs is not None:
        prefs = current_user.get("notificationPrefs", {}) or {}
        prefs.update(body.notificationPrefs)
        update_dict["notificationPrefs"] = prefs
        
    if body.privacySettings is not None:
        priv = current_user.get("privacySettings", {}) or {}
        priv.update(body.privacySettings)
        update_dict["privacySettings"] = priv
        
    user = await db.update_user(user_id, {"$set": update_dict})
    
    return {
        "success": True,
        "message": "Settings updated successfully",
        "settings": {
            "learningGoal": user.get("learningGoal"),
            "targetLanguage": user.get("targetLanguage"),
            "notificationPrefs": user.get("notificationPrefs"),
            "privacySettings": user.get("privacySettings"),
        }
    }

@router.delete("/account")
async def delete_account(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    deleted = await db.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=500, detail={"success": False, "message": "Failed to delete account"})
        
    return {
        "success": True,
        "message": "Account deleted successfully"
    }

@router.get("/wt-coins/details")
@router.get("/wt-coins-details")
@router.get("/wt-coins")
async def get_coin_details(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    transactions = await db.get_coin_transactions(user_id)
    
    total_earned = 0
    total_redeemed = 0
    
    for t in transactions:
        earned = t.get("coinsEarned", 0)
        if earned > 0:
            total_earned += earned
        else:
            total_redeemed += abs(earned)
            
    recent_transactions = transactions[:10]
    
    return {
        "success": True,
        "currentBalance": current_user.get("wtCoins", 0) or 0,
        "totalEarned": total_earned,
        "totalRedeemed": total_redeemed,
        "recentTransactions": recent_transactions
    }

# --- Notifications Endpoints ---
@router.get("/notifications")
async def get_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    notifications = await db.get_notifications(user_id)
    
    # Seed initial notifications if none exist
    if not notifications:
        now = datetime.datetime.utcnow()
        initial_notifications = [
            {
                "user": user_id,
                "title": "Welcome to AI Learning!",
                "description": "Start your first lesson today and begin your English journey.",
                "category": "Updates",
                "isRead": False,
                "createdAt": now.isoformat() + "Z"
            },
            {
                "user": user_id,
                "title": "Daily Streak Reminder",
                "description": "Don't forget to practice today to keep your streak alive!",
                "category": "Reminders",
                "isRead": False,
                "createdAt": (now - datetime.timedelta(hours=1)).isoformat() + "Z"
            },
            {
                "user": user_id,
                "title": "New Lesson Available",
                "description": "A new lesson on \"Business English\" has been added for you.",
                "category": "Lessons",
                "isRead": False,
                "createdAt": (now - datetime.timedelta(days=1)).isoformat() + "Z"
            }
        ]
        await db.create_notifications(initial_notifications)
        notifications = await db.get_notifications(user_id)
        
    res_notifs = []
    for notif in notifications:
        res_notifs.append({
            "id": notif["_id"],
            "title": notif.get("title"),
            "description": notif.get("description"),
            "category": notif.get("category"),
            "isRead": notif.get("isRead", False),
            "createdAt": notif.get("createdAt"),
            "time": format_time(notif.get("createdAt", ""))
        })
        
    return {
        "success": True,
        "notifications": res_notifs
    }

@router.put("/notifications/{notification_id}")
async def mark_notification_read(notification_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    updated = await db.update_notification(notification_id, user_id, {"$set": {"isRead": True}})
    if not updated:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Notification not found"})
        
    return {
        "success": True,
        "message": "Notification marked as read"
    }

@router.delete("/notifications")
async def clear_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    await db.clear_notifications(user_id)
    return {
        "success": True,
        "message": "Notifications cleared successfully"
    }

@router.get("/grammar-corrections")
async def get_grammar_corrections(current_user: Dict[str, Any] = Depends(get_current_user)):
    corrections = [
        {
            "id": 1,
            "wrong": "I go to the market yesterday.",
            "correct": "I went to the market yesterday.",
            "why": "Use Simple Past tense ('went') for completed actions in the past. 'Go' is present tense and cannot be used with 'yesterday'."
        },
        {
            "id": 2,
            "wrong": "The team are playing well today.",
            "correct": "The team is playing well today.",
            "why": "In standard formal English, collective nouns like 'team' take a singular verb ('is') when acting as a single unit."
        },
        {
            "id": 3,
            "wrong": "She don't know the answer.",
            "correct": "She doesn't know the answer.",
            "why": "With third-person singular subjects (she/he/it), use 'doesn't' as the auxiliary verb, not 'don't'."
        }
    ]
    return {
        "success": True,
        "corrections": corrections
    }
