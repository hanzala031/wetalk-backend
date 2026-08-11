const WtCoinTransaction = require('../models/WtCoinTransaction');

/**
 * Award WT Coins to a user and log the transaction.
 * @param {Object} user - User document
 * @param {string} rewardType - Type of reward
 * @param {number} coinsEarned - Number of coins
 * @param {Object} metadata - Metadata for transaction
 * @returns {Object|null} The reward details if awarded, null otherwise
 */
async function awardCoins(user, rewardType, coinsEarned, metadata = {}) {
  try {
    user.wtCoins = (user.wtCoins || 0) + coinsEarned;
    await user.save();

    await WtCoinTransaction.create({
      userId: user._id,
      rewardType,
      coinsEarned,
      metadata,
      date: new Date()
    });

    console.log(`WT Coins Awarded to User ${user._id}: +${coinsEarned} (${rewardType})`);
    return {
      type: rewardType,
      amount: coinsEarned,
      currentBalance: user.wtCoins
    };
  } catch (error) {
    console.error('Error awarding coins:', error);
    return null;
  }
}

/**
 * Award Signup Reward if not already awarded.
 */
async function awardSignupReward(user) {
  try {
    const existing = await WtCoinTransaction.findOne({
      userId: user._id,
      rewardType: 'Signup Bonus'
    });

    if (existing) {
      return null;
    }

    if (user.wtCoins === undefined || user.wtCoins === 0) {
      user.wtCoins = 50;
    }

    await WtCoinTransaction.create({
      userId: user._id,
      rewardType: 'Signup Bonus',
      coinsEarned: 50,
      date: new Date()
    });

    await user.save();

    return {
      type: 'Signup Bonus',
      amount: 50,
      currentBalance: user.wtCoins
    };
  } catch (error) {
    console.error('Error awarding signup reward:', error);
    return null;
  }
}

/**
 * Award Lesson and Module Rewards.
 */
async function awardLessonAndModuleRewards(user, lessonNumber, completedLessonsList) {
  const rewardsEarned = [];

  try {
    // 1. Check Lesson Reward
    const existingLessonReward = await WtCoinTransaction.findOne({
      userId: user._id,
      rewardType: 'Lesson Completed',
      'metadata.lessonNumber': Number(lessonNumber)
    });

    if (!existingLessonReward) {
      user.wtCoins = (user.wtCoins || 0) + 5;
      
      await WtCoinTransaction.create({
        userId: user._id,
        rewardType: 'Lesson Completed',
        coinsEarned: 5,
        metadata: { lessonNumber: Number(lessonNumber) },
        date: new Date()
      });

      rewardsEarned.push({
        type: 'Lesson Completed',
        amount: 5,
        currentBalance: user.wtCoins
      });
    }

    // 2. Check Module Reward
    const moduleNumber = Math.ceil(Number(lessonNumber) / 5);
    const startLesson = (moduleNumber - 1) * 5 + 1;
    const endLesson = moduleNumber * 5;

    const hasCompletedAllInModule = Array.from({ length: 5 }, (_, i) => startLesson + i)
      .every(num => completedLessonsList.includes(num));

    if (hasCompletedAllInModule) {
      if (!user.modulesClaimed) {
        user.modulesClaimed = [];
      }
      
      if (!user.modulesClaimed.includes(moduleNumber)) {
        user.modulesClaimed.push(moduleNumber);
        user.markModified('modulesClaimed');
        user.wtCoins = (user.wtCoins || 0) + 25;

        await WtCoinTransaction.create({
          userId: user._id,
          rewardType: 'Module Completed',
          coinsEarned: 25,
          metadata: { moduleNumber },
          date: new Date()
        });

        rewardsEarned.push({
          type: 'Module Completed',
          amount: 25,
          currentBalance: user.wtCoins
        });
      }
    }

    await user.save();
  } catch (error) {
    console.error('Error awarding lesson and module rewards:', error);
  }

  return rewardsEarned;
}

/**
 * Award 7-Day Streak Reward.
 */
async function awardStreakReward(user, currentStreak) {
  if (currentStreak <= 0 || currentStreak % 7 !== 0) {
    return null;
  }

  try {
    if (!user.streakMilestonesClaimed) {
      user.streakMilestonesClaimed = [];
    }

    if (!user.streakMilestonesClaimed.includes(currentStreak)) {
      user.streakMilestonesClaimed.push(currentStreak);
      user.markModified('streakMilestonesClaimed');
      user.wtCoins = (user.wtCoins || 0) + 10;
      await user.save();

      await WtCoinTransaction.create({
        userId: user._id,
        rewardType: '7-Day Streak',
        coinsEarned: 10,
        metadata: { streakMilestone: currentStreak },
        date: new Date()
      });

      return {
        type: '7-Day Streak',
        amount: 10,
        currentBalance: user.wtCoins
      };
    }
  } catch (error) {
    console.error('Error awarding streak reward:', error);
  }
  return null;
}

module.exports = {
  awardCoins,
  awardSignupReward,
  awardLessonAndModuleRewards,
  awardStreakReward
};
