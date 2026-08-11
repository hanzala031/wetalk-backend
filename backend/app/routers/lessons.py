import datetime
import json
import math
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, List
from app.dependencies import get_current_user
from app.db import db
from app.utils.coin_helper import award_lesson_and_module_rewards, award_streak_reward
from app.models.lesson import CompleteStepRequest, CompleteLessonRequest

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

def get_remaining_time(last_completed_at_str: str) -> Dict[str, Any]:
    if not last_completed_at_str:
        return {"isLocked": False, "remainingStr": ""}
        
    try:
        # Parse ISO-formatted date string
        # Replace 'Z' with '+00:00' to support python's fromisoformat
        clean_str = last_completed_at_str.replace("Z", "+00:00")
        last_completed = datetime.datetime.fromisoformat(clean_str)
        # Convert timezone-naive or other timezone to UTC timezone-naive for comparison
        if last_completed.tzinfo is not None:
            last_completed = last_completed.astimezone(datetime.timezone.utc).replace(tzinfo=None)
    except Exception as e:
        print(f"Error parsing date {last_completed_at_str}: {e}")
        return {"isLocked": False, "remainingStr": ""}
        
    now = datetime.datetime.utcnow()
    lock_duration = datetime.timedelta(hours=24)
    time_since_completion = now - last_completed
    
    if time_since_completion >= lock_duration:
        return {"isLocked": False, "remainingStr": ""}
        
    time_remaining = lock_duration - time_since_completion
    seconds = time_remaining.total_seconds()
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    
    return {
        "isLocked": True,
        "remainingStr": f"{hours}h {minutes}m",
        "hours": hours,
        "minutes": minutes
    }

@router.get("/current")
async def get_current_lesson(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    progress = await db.find_user_progress(user_id)
    
    # If progress doesn't exist, initialize it
    if not progress:
        progress = await db.create_user_progress({
            "userId": user_id,
            "currentLessonNumber": 1,
            "completedLessons": [],
            "steps": {"learn": False, "practice": False, "quiz": False, "review": False},
            "lastCompletedAt": None
        })
        
    # Fetch details of current lesson
    current_lesson = await db.find_lesson_by_number(progress["currentLessonNumber"])
    if not current_lesson:
        return {
            "success": True,
            "message": "Congratulations! You have completed all available lessons.",
            "progress": progress
        }
        
    # Check 24-hour lockout timeframe
    if progress.get("lastCompletedAt"):
        lock_status = get_remaining_time(progress["lastCompletedAt"])
        
        if lock_status["isLocked"]:
            return {
                "success": True,
                "isLocked": True,
                "timeRemaining": lock_status["remainingStr"],
                "lessonNumber": current_lesson["lessonNumber"],
                "title": current_lesson["title"],
                "description": current_lesson["description"],
                "steps": progress["steps"],
                "message": f"Next lesson unlocks in {lock_status['remainingStr']}"
            }
            
    return {
        "success": True,
        "isLocked": False,
        "lesson": current_lesson,
        "steps": progress["steps"]
    }

@router.post("/complete-step")
async def complete_step(body: CompleteStepRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    lesson_number = body.lessonNumber
    step_name = body.stepName
    rewards_earned = []
    
    valid_steps = ["learn", "practice", "quiz", "review"]
    if step_name not in valid_steps:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "message": "Invalid step name. Must be: learn, practice, quiz, review"}
        )
        
    user_id = current_user["_id"]
    progress = await db.find_user_progress(user_id)
    if not progress:
        progress = await db.create_user_progress({
            "userId": user_id,
            "currentLessonNumber": 1,
            "completedLessons": [],
            "steps": {"learn": False, "practice": False, "quiz": False, "review": False},
            "lastCompletedAt": None
        })
        
    # Ensure active lesson matches
    if int(lesson_number) != int(progress["currentLessonNumber"]):
        raise HTTPException(
            status_code=400,
            detail={"success": False, "message": f"You can only complete steps for your current active lesson: Lesson {progress['currentLessonNumber']}"}
        )
        
    # Validate linear step ordering
    steps = progress.get("steps", {})
    if step_name == "practice" and not steps.get("learn"):
        raise HTTPException(status_code=400, detail={"success": False, "message": "You must complete the Learn step before starting Practice"})
    if step_name == "quiz" and not steps.get("practice"):
        raise HTTPException(status_code=400, detail={"success": False, "message": "You must complete the Practice step before starting Quiz"})
    if step_name == "review" and not steps.get("quiz"):
        raise HTTPException(status_code=400, detail={"success": False, "message": "You must complete the Quiz step before starting Review"})
        
    # Check 24h lock status before starting new steps
    if progress.get("lastCompletedAt"):
        lock_status = get_remaining_time(progress["lastCompletedAt"])
        if lock_status["isLocked"]:
            raise HTTPException(
                status_code=403,
                detail={"success": False, "message": f"Action forbidden. The next lesson is locked for {lock_status['remainingStr']}"}
            )
            
    # Mark the step as completed
    await db.update_user_progress(user_id, {"$set": {f"steps.{step_name}": True}})
    progress["steps"][step_name] = True

    if step_name == "quiz":
        try:
            # Check if already rewarded for this quiz
            existing_quiz_reward = await db.find_coin_transaction(
                user_id, 
                "Quiz Completed", 
                {"lessonNumber": int(lesson_number)}
            )
            if not existing_quiz_reward:
                # Award 2 WT Coins
                current_wt_coins = current_user.get("wtCoins", 0) or 0
                new_balance = current_wt_coins + 2
                await db.update_user(user_id, {"$set": {"wtCoins": new_balance}})
                current_user["wtCoins"] = new_balance
                
                await db.create_coin_transaction({
                    "userId": user_id,
                    "rewardType": "Quiz Completed",
                    "coinsEarned": 2,
                    "metadata": {"lessonNumber": int(lesson_number)}
                })
                rewards_earned.append({
                    "type": "Quiz Completed",
                    "amount": 2,
                    "currentBalance": new_balance
                })
        except Exception as e:
            print(f"Error awarding coins for quiz completion: {e}")
    
    is_lesson_fully_completed = False
    
    # If review is completed, complete the full lesson
    if step_name == "review":
        is_lesson_fully_completed = True
        
        completed_lessons = progress.get("completedLessons", []) or []
        if lesson_number not in completed_lessons:
            completed_lessons.append(lesson_number)
            
        last_completed_at = datetime.datetime.utcnow().isoformat() + "Z"
        current_lesson_number = progress["currentLessonNumber"] + 1
        
        await db.update_user_progress(user_id, {
            "$set": {
                "completedLessons": completed_lessons,
                "lastCompletedAt": last_completed_at,
                "currentLessonNumber": current_lesson_number,
                "steps": {"learn": False, "practice": False, "quiz": False, "review": False}
            }
        })
        progress["completedLessons"] = completed_lessons
        progress["lastCompletedAt"] = last_completed_at
        progress["currentLessonNumber"] = current_lesson_number
        progress["steps"] = {"learn": False, "practice": False, "quiz": False, "review": False}
        
        # Award profile stats (XP + Gems/Coins)
        xp = (current_user.get("xp", 0) or 0) + 100
        coins = (current_user.get("coins", 0) or 0) + 25
        
        # Sync with progressData for frontend
        progress_data = current_user.get("progressData", {}) or {}
        completed_list = []
        try:
            raw = progress_data.get("completed_lessons", "[]")
            if isinstance(raw, str):
                completed_list = json.loads(raw)
            elif isinstance(raw, list):
                completed_list = raw
        except Exception:
            completed_list = []
            
        if lesson_number not in completed_list:
            completed_list.append(lesson_number)
            
        progress_data["completed_lessons"] = json.dumps(completed_list)
        
        today_str = datetime.date.today().isoformat()
        progress_data[f"completion_date_{lesson_number}"] = today_str
        
        level = (xp // 1000) + 1
        await db.update_user(user_id, {
            "$set": {
                "xp": xp,
                "coins": coins,
                "level": level,
                "progressData": progress_data,
                "lastCompletionDate": datetime.datetime.utcnow().isoformat() + "Z"
            }
        })
        current_user["xp"] = xp
        current_user["coins"] = coins
        current_user["level"] = level
        current_user["progressData"] = progress_data
        
        # Award WT Coins
        rewards = await award_lesson_and_module_rewards(current_user, lesson_number, completed_lessons)
        if rewards:
            rewards_earned.extend(rewards)
            
        # Update UserStreak
        streak_doc = await db.find_user_streak(user_id)
        if not streak_doc:
            streak_doc = await db.create_user_streak({
                "userId": user_id,
                "currentStreak": 0,
                "dailyXpTarget": 50,
                "todayXpEarned": 0,
                "lastActiveDate": None,
                "weeklyProgress": []
            })
            
        streak_doc["todayXpEarned"] = (streak_doc.get("todayXpEarned", 0) or 0) + 100
        
        # Check target
        if streak_doc["todayXpEarned"] >= streak_doc.get("dailyXpTarget", 50):
            last_active_str = streak_doc.get("lastActiveDate")
            last_active_date = None
            if last_active_str:
                try:
                    last_active_date = last_active_str.split("T")[0]
                except Exception:
                    pass
                    
            if last_active_date != today_str:
                if last_active_date:
                    # check if yesterday
                    yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
                    if last_active_date == yesterday_str:
                        streak_doc["currentStreak"] += 1
                    else:
                        streak_doc["currentStreak"] = 1
                else:
                    streak_doc["currentStreak"] = 1
                    
                streak_doc["lastActiveDate"] = datetime.datetime.utcnow().isoformat() + "Z"
                
                # Award 7-Day Streak
                streak_reward = await award_streak_reward(current_user, streak_doc["currentStreak"])
                if streak_reward:
                    rewards_earned.append(streak_reward)
                    
        await db.update_user_streak(user_id, {
            "$set": {
                "todayXpEarned": streak_doc["todayXpEarned"],
                "currentStreak": streak_doc["currentStreak"],
                "lastActiveDate": streak_doc.get("lastActiveDate")
            }
        })
        
    return {
        "success": True,
        "message": f"Congratulations! Lesson {lesson_number} is fully completed. Next lesson will unlock in 24 hours." if is_lesson_fully_completed else f"Step {step_name} completed successfully.",
        "isLessonFullyCompleted": is_lesson_fully_completed,
        "progress": progress,
        "rewardsEarned": rewards_earned
    }

@router.get("/visible")
async def get_visible_lessons(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    progress = await db.find_user_progress(user_id)
    if not progress:
        progress = await db.create_user_progress({
            "userId": user_id,
            "currentLessonNumber": 1,
            "completedLessons": [],
            "steps": {"learn": False, "practice": False, "quiz": False, "review": False},
            "lastCompletedAt": None
        })
        
    all_lessons = await db.get_all_lessons()
    lock_status = get_remaining_time(progress.get("lastCompletedAt")) if progress.get("lastCompletedAt") else {"isLocked": False}
    
    visible_lessons = []
    for lesson in all_lessons:
        lesson_num = int(lesson["lessonNumber"])
        is_completed = lesson_num in (progress.get("completedLessons", []) or [])
        is_current = lesson_num == int(progress["currentLessonNumber"])
        is_unlocked = is_completed or (is_current and not lock_status["isLocked"])
        
        status_val = "locked"
        if is_completed:
            status_val = "completed"
        elif is_current:
            status_val = "locked" if lock_status["isLocked"] else "active"
            
        progress_percentage = 0
        if is_completed:
            progress_percentage = 100
        elif is_current:
            s = progress.get("steps", {}) or {}
            progress_percentage = (25 if s.get("learn") else 0) + (25 if s.get("practice") else 0) + (25 if s.get("quiz") else 0) + (25 if s.get("review") else 0)
            
        visible_lessons.append({
            "id": f"lesson_{lesson_num}",
            "lessonNumber": lesson_num,
            "title": lesson["title"],
            "description": lesson["description"],
            "isUnlocked": is_unlocked,
            "isCompleted": is_completed,
            "progressPercentage": progress_percentage,
            "status": status_val,
            "timeRemaining": lock_status["remainingStr"] if (is_current and lock_status["isLocked"]) else None
        })
        
    return visible_lessons

@router.get("/{lesson_id}")
async def get_lesson_by_id(lesson_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    # lesson_id can be lesson_1
    parts = lesson_id.split("_")
    try:
        lesson_num = int(parts[1]) if len(parts) > 1 else int(lesson_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lesson ID format")
        
    lesson = await db.find_lesson_by_number(lesson_num)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    user_id = current_user["_id"]
    progress = await db.find_user_progress(user_id)
    if not progress:
        progress = await db.create_user_progress({
            "userId": user_id,
            "currentLessonNumber": 1,
            "completedLessons": [],
            "steps": {"learn": False, "practice": False, "quiz": False, "review": False},
            "lastCompletedAt": None
        })
        
    is_completed = lesson_num in (progress.get("completedLessons", []) or [])
    is_current = lesson_num == int(progress["currentLessonNumber"])
    is_unlocked = is_completed or is_current
    
    user_steps = {"learn": False, "practice": False, "quiz": False, "review": False}
    if is_completed:
        user_steps = {"learn": True, "practice": True, "quiz": True, "review": True}
    elif is_current and progress.get("steps"):
        s = progress["steps"]
        user_steps = {
            "learn": bool(s.get("learn")),
            "practice": bool(s.get("practice")),
            "quiz": bool(s.get("quiz")),
            "review": bool(s.get("review"))
        }
        
    # Reconstruct lesson dictionary representation with added progress fields
    res = dict(lesson)
    res["id"] = f"lesson_{lesson_num}"
    res["userSteps"] = user_steps
    res["isCompleted"] = is_completed
    res["isCurrent"] = is_current
    res["isUnlocked"] = is_unlocked
    
    return res

@router.post("/complete")
async def legacy_complete_lesson(body: CompleteLessonRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    lesson_id = body.lessonId
    parts = lesson_id.split("_")
    try:
        lesson_num = int(parts[1]) if len(parts) > 1 else int(lesson_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lesson ID format")
        
    user_id = current_user["_id"]
    progress = await db.find_user_progress(user_id)
    if not progress:
        progress = await db.create_user_progress({
            "userId": user_id,
            "currentLessonNumber": 1,
            "completedLessons": [],
            "steps": {"learn": False, "practice": False, "quiz": False, "review": False},
            "lastCompletedAt": None
        })
        
    completed_lessons = progress.get("completedLessons", []) or []
    rewards_earned = []
    
    if lesson_num not in completed_lessons:
        completed_lessons.append(lesson_num)
        last_completed = datetime.datetime.utcnow().isoformat() + "Z"
        current_lesson_num = progress["currentLessonNumber"]
        if current_lesson_num == lesson_num:
            current_lesson_num += 1
            
        await db.update_user_progress(user_id, {
            "$set": {
                "completedLessons": completed_lessons,
                "lastCompletedAt": last_completed,
                "currentLessonNumber": current_lesson_num
            }
        })
        progress["completedLessons"] = completed_lessons
        progress["lastCompletedAt"] = last_completed
        progress["currentLessonNumber"] = current_lesson_num
        
        # Award rewards
        rewards = await award_lesson_and_module_rewards(current_user, lesson_num, completed_lessons)
        if rewards:
            rewards_earned.extend(rewards)
            
    return {
        "message": "Lesson completed successfully",
        "progress": progress,
        "rewardsEarned": rewards_earned
    }
