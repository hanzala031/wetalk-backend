import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, List
from app.dependencies import get_current_user
from app.db import db
from app.utils.coin_helper import award_streak_reward
from app.models.streak import AddXpRequest

router = APIRouter(prefix="/api/streak", tags=["streak"])

def format_date_string(dt: datetime.datetime) -> str:
    return dt.date().isoformat()

def get_calendar_day_difference(dt1: datetime.datetime, dt2: datetime.datetime) -> int:
    d1 = dt1.date()
    d2 = dt2.date()
    return (d1 - d2).days

def get_start_of_week(dt: datetime.datetime) -> datetime.datetime:
    # In Python, Monday is 0, Sunday is 6
    day_idx = dt.weekday()
    monday = dt - datetime.timedelta(days=day_idx)
    # Set to midnight
    return datetime.datetime(monday.year, monday.month, monday.day, 0, 0, 0)

def generate_weekly_progress(start_date: datetime.datetime) -> List[Dict[str, Any]]:
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    progress = []
    for i in range(7):
        d = start_date + datetime.timedelta(days=i)
        progress.append({
            "dayName": days[i],
            "dateString": format_date_string(d),
            "goalAchieved": False
        })
    return progress

def sync_streak_state(streak: Dict[str, Any], last_updated_iso: str = None) -> Dict[str, Any]:
    streak["dailyXpTarget"] = 50
    
    now = datetime.datetime.utcnow()
    today_str = format_date_string(now)
    
    # 1. Sync Weekly Progress - reset if new week
    monday = get_start_of_week(now)
    monday_str = format_date_string(monday)
    
    weekly = streak.get("weeklyProgress", []) or []
    if not weekly or len(weekly) < 7 or weekly[0].get("dateString") != monday_str:
        streak["weeklyProgress"] = generate_weekly_progress(monday)
        
    # 2. Reset daily XP earned if new day
    last_update_str = None
    if last_updated_iso:
        try:
            last_update_str = last_updated_iso.split("T")[0]
        except Exception:
            pass
            
    if last_update_str and last_update_str != today_str:
        streak["todayXpEarned"] = 0
        
        # Reset streak if missed more than 1 day
        last_active_str = streak.get("lastActiveDate")
        if last_active_str:
            try:
                last_active = datetime.datetime.fromisoformat(last_active_str.replace("Z", "+00:00")).replace(tzinfo=None)
                diff = get_calendar_day_difference(now, last_active)
                if diff > 1:
                    streak["currentStreak"] = 0
            except Exception as e:
                print(f"Error checking last active date: {e}")
                
    # 3. Mark achieved today if lastActiveDate is today
    last_active_str = streak.get("lastActiveDate")
    if last_active_str:
        try:
            last_active_date_str = last_active_str.split("T")[0]
            if last_active_date_str == today_str:
                for day in streak.get("weeklyProgress", []):
                    if day.get("dateString") == today_str:
                        day["goalAchieved"] = True
                        break
        except Exception:
            pass
            
    return streak

def rebuild_streak_from_progress(streak: Dict[str, Any], progress_data: Dict[str, Any]):
    if not progress_data:
        return
        
    streak["dailyXpTarget"] = 50
    
    # 1. Gather all completion dates
    completion_dates = set()
    for k, v in progress_data.items():
        if k.startswith("completion_date_") and v:
            completion_dates.add(v.strip())
            
    # 2. Mark weekly progress
    for day in streak.get("weeklyProgress", []):
        if day.get("dateString") in completion_dates:
            day["goalAchieved"] = True
            
    # 3. Reconstruct streak count
    if not completion_dates:
        streak["currentStreak"] = 0
        streak["lastActiveDate"] = None
        return
        
    sorted_dates = sorted(list(completion_dates), reverse=True)
    
    now = datetime.datetime.utcnow()
    today_str = format_date_string(now)
    yesterday_str = (now - datetime.timedelta(days=1)).date().isoformat()
    
    latest_date_str = sorted_dates[0]
    if latest_date_str in (today_str, yesterday_str):
        current_streak = 1
        date_idx = 1
        prev_date = datetime.date.fromisoformat(latest_date_str)
        
        while date_idx < len(sorted_dates):
            next_date = datetime.date.fromisoformat(sorted_dates[date_idx])
            diff = (prev_date - next_date).days
            
            if diff == 1:
                current_streak += 1
                prev_date = next_date
                date_idx += 1
            elif diff == 0:
                # Same day duplicate
                date_idx += 1
            else:
                break
                
        streak["currentStreak"] = current_streak
        # Add Z to match mongo datetime representation
        streak["lastActiveDate"] = datetime.datetime.combine(
            datetime.date.fromisoformat(latest_date_str), 
            datetime.time(12, 0)
        ).isoformat() + "Z"
    else:
        # Missed days
        streak["currentStreak"] = 0
        streak["lastActiveDate"] = datetime.datetime.combine(
            datetime.date.fromisoformat(latest_date_str), 
            datetime.time(12, 0)
        ).isoformat() + "Z"

@router.get("/status")
async def get_streak_status(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    streak = await db.find_user_streak(user_id)
    
    if not streak:
        # Create new user streak
        streak = await db.create_user_streak({
            "userId": user_id,
            "currentStreak": 0,
            "dailyXpTarget": 50,
            "todayXpEarned": 0,
            "lastActiveDate": None,
            "weeklyProgress": []
        })
        
    sync_streak_state(streak, last_updated_iso=streak.get("updatedAt"))
    
    # Auto repair
    if current_user.get("progressData"):
        rebuild_streak_from_progress(streak, current_user["progressData"])
        
    # Save back
    await db.update_user_streak(user_id, {
        "$set": {
            "currentStreak": streak["currentStreak"],
            "dailyXpTarget": streak["dailyXpTarget"],
            "todayXpEarned": streak["todayXpEarned"],
            "lastActiveDate": streak.get("lastActiveDate"),
            "weeklyProgress": streak["weeklyProgress"]
        }
    })
    
    return {
        "success": True,
        "data": {
            "currentStreak": streak["currentStreak"],
            "dailyXpTarget": streak["dailyXpTarget"],
            "todayXpEarned": streak["todayXpEarned"],
            "lastActiveDate": streak.get("lastActiveDate"),
            "weeklyProgress": streak["weeklyProgress"]
        }
    }

@router.post("/add-xp")
async def add_xp(body: AddXpRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["_id"]
    xp_amount = body.xpAmount
    
    if xp_amount < 0:
        raise HTTPException(status_code=400, detail={"success": False, "message": "Valid non-negative xpAmount is required"})
        
    streak = await db.find_user_streak(user_id)
    if not streak:
        streak = await db.create_user_streak({
            "userId": user_id,
            "currentStreak": 0,
            "dailyXpTarget": 50,
            "todayXpEarned": 0,
            "lastActiveDate": None,
            "weeklyProgress": []
        })
        
    sync_streak_state(streak, last_updated_iso=streak.get("updatedAt"))
    
    now = datetime.datetime.utcnow()
    today_str = format_date_string(now)
    
    streak["todayXpEarned"] += xp_amount
    goal_hit_today = False
    
    # Check if target is met
    if streak["todayXpEarned"] >= streak["dailyXpTarget"]:
        last_active_str = streak.get("lastActiveDate")
        last_active_date = None
        if last_active_str:
            try:
                last_active_date = last_active_str.split("T")[0]
            except Exception:
                pass
                
        if last_active_date != today_str:
            streak["currentStreak"] += 1
            streak["lastActiveDate"] = now.isoformat() + "Z"
            
            for day in streak.get("weeklyProgress", []):
                if day.get("dateString") == today_str:
                    day["goalAchieved"] = True
                    break
            goal_hit_today = True
            
    # Rebuild from progressData history
    if current_user.get("progressData"):
        saved_streak = streak["currentStreak"]
        saved_last_active = streak.get("lastActiveDate")
        saved_today_xp = streak["todayXpEarned"]
        
        rebuild_streak_from_progress(streak, current_user["progressData"])
        
        if saved_streak > streak["currentStreak"]:
            streak["currentStreak"] = saved_streak
            streak["lastActiveDate"] = saved_last_active
            
        streak["todayXpEarned"] = saved_today_xp
        
        if goal_hit_today:
            for day in streak.get("weeklyProgress", []):
                if day.get("dateString") == today_str:
                    day["goalAchieved"] = True
            streak["lastActiveDate"] = saved_last_active

    rewards_earned = []
    if streak["currentStreak"] > 0 and streak["currentStreak"] % 7 == 0:
        streak_reward = await award_streak_reward(current_user, streak["currentStreak"])
        if streak_reward:
            rewards_earned.append(streak_reward)
            
    # Update total XP and level in users collection
    try:
        new_xp = (current_user.get("xp", 0) or 0) + xp_amount
        new_level = (new_xp // 1000) + 1
        await db.update_user(user_id, {
            "$set": {
                "xp": new_xp,
                "level": new_level
            }
        })
        current_user["xp"] = new_xp
        current_user["level"] = new_level
    except Exception as e:
        print(f"Error updating total user XP/level in add_xp: {e}")

    # Save back
    await db.update_user_streak(user_id, {
        "$set": {
            "currentStreak": streak["currentStreak"],
            "dailyXpTarget": streak["dailyXpTarget"],
            "todayXpEarned": streak["todayXpEarned"],
            "lastActiveDate": streak.get("lastActiveDate"),
            "weeklyProgress": streak["weeklyProgress"]
        }
    })
    
    return {
        "success": True,
        "data": {
            "currentStreak": streak["currentStreak"],
            "dailyXpTarget": streak["dailyXpTarget"],
            "todayXpEarned": streak["todayXpEarned"],
            "lastActiveDate": streak.get("lastActiveDate"),
            "weeklyProgress": streak["weeklyProgress"]
        },
        "goalHitToday": goal_hit_today,
        "rewardsEarned": rewards_earned
    }
