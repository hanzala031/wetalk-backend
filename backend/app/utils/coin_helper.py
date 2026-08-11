import math
from typing import List, Dict, Any, Optional
from app.db import db

async def award_coins(user: Dict[str, Any], reward_type: str, coins_earned: int, metadata: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
    try:
        user_id = user["_id"]
        current_wt_coins = user.get("wtCoins", 0) or 0
        new_balance = current_wt_coins + coins_earned
        
        # Save to DB
        await db.update_user(user_id, {"$set": {"wtCoins": new_balance}})
        user["wtCoins"] = new_balance
        
        tx_data = {
            "userId": user_id,
            "rewardType": reward_type,
            "coinsEarned": coins_earned,
            "metadata": metadata or {},
        }
        await db.create_coin_transaction(tx_data)
        
        print(f"WT Coins Awarded to User {user_id}: +{coins_earned} ({reward_type})")
        return {
            "type": reward_type,
            "amount": coins_earned,
            "currentBalance": new_balance
        }
    except Exception as e:
        print(f"Error awarding coins: {e}")
        return None

async def award_signup_reward(user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    try:
        user_id = user["_id"]
        existing = await db.find_coin_transaction(user_id, "Signup Bonus")
        if existing:
            return None
            
        current_wt_coins = user.get("wtCoins", 0) or 0
        new_balance = current_wt_coins
        if not current_wt_coins:
            new_balance = 50
            await db.update_user(user_id, {"$set": {"wtCoins": 50}})
            user["wtCoins"] = 50
            
        tx_data = {
            "userId": user_id,
            "rewardType": "Signup Bonus",
            "coinsEarned": 50,
        }
        await db.create_coin_transaction(tx_data)
        
        return {
            "type": "Signup Bonus",
            "amount": 50,
            "currentBalance": new_balance or 50
        }
    except Exception as e:
        print(f"Error awarding signup reward: {e}")
        return None

async def award_lesson_and_module_rewards(user: Dict[str, Any], lesson_number: int, completed_lessons_list: List[int]) -> List[Dict[str, Any]]:
    rewards_earned = []
    user_id = user["_id"]
    lesson_num = int(lesson_number)
    
    try:
        # 1. Lesson reward
        existing_lesson_reward = await db.find_coin_transaction(
            user_id, 
            "Lesson Completed", 
            {"lessonNumber": lesson_num}
        )
        
        if not existing_lesson_reward:
            current_wt_coins = user.get("wtCoins", 0) or 0
            new_balance = current_wt_coins + 5
            await db.update_user(user_id, {"$set": {"wtCoins": new_balance}})
            user["wtCoins"] = new_balance
            
            await db.create_coin_transaction({
                "userId": user_id,
                "rewardType": "Lesson Completed",
                "coinsEarned": 5,
                "metadata": {"lessonNumber": lesson_num}
            })
            
            rewards_earned.append({
                "type": "Lesson Completed",
                "amount": 5,
                "currentBalance": new_balance
            })
            
        # 2. Module reward (modules of 5 lessons)
        module_number = math.ceil(lesson_num / 5)
        start_lesson = (module_number - 1) * 5 + 1
        
        has_completed_all_in_module = True
        for i in range(5):
            if (start_lesson + i) not in completed_lessons_list:
                has_completed_all_in_module = False
                break
                
        if has_completed_all_in_module:
            modules_claimed = user.get("modulesClaimed", []) or []
            if module_number not in modules_claimed:
                modules_claimed.append(module_number)
                current_wt_coins = user.get("wtCoins", 0) or 0
                new_balance = current_wt_coins + 25
                
                await db.update_user(user_id, {"$set": {
                    "modulesClaimed": modules_claimed,
                    "wtCoins": new_balance
                }})
                user["modulesClaimed"] = modules_claimed
                user["wtCoins"] = new_balance
                
                await db.create_coin_transaction({
                    "userId": user_id,
                    "rewardType": "Module Completed",
                    "coinsEarned": 25,
                    "metadata": {"moduleNumber": module_number}
                })
                
                rewards_earned.append({
                    "type": "Module Completed",
                    "amount": 25,
                    "currentBalance": new_balance
                })
    except Exception as e:
        print(f"Error awarding lesson and module rewards: {e}")
        
    return rewards_earned

async def award_streak_reward(user: Dict[str, Any], current_streak: int) -> Optional[Dict[str, Any]]:
    if current_streak <= 0 or current_streak % 7 != 0:
        return None
        
    user_id = user["_id"]
    try:
        streak_milestones = user.get("streakMilestonesClaimed", []) or []
        if current_streak not in streak_milestones:
            streak_milestones.append(current_streak)
            current_wt_coins = user.get("wtCoins", 0) or 0
            new_balance = current_wt_coins + 10
            
            await db.update_user(user_id, {
                "$set": {
                    "streakMilestonesClaimed": streak_milestones,
                    "wtCoins": new_balance
                }
            })
            user["streakMilestonesClaimed"] = streak_milestones
            user["wtCoins"] = new_balance
            
            await db.create_coin_transaction({
                "userId": user_id,
                "rewardType": "7-Day Streak",
                "coinsEarned": 10,
                "metadata": {"streakMilestone": current_streak}
            })
            
            return {
                "type": "7-Day Streak",
                "amount": 10,
                "currentBalance": new_balance
            }
    except Exception as e:
        print(f"Error awarding streak reward: {e}")
        
    return None
