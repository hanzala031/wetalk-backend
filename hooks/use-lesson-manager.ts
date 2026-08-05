import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLessonManager = () => {
  const [unlockedLessons, setUnlockedLessons] = useState<string[]>(['prof_1']);
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedData = await AsyncStorage.getItem('lesson_progress');
      if (savedData) {
        const { unlocked, level } = JSON.parse(savedData);
        setUnlockedLessons(unlocked);
        setUserLevel(level);
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    } finally {
      setLoading(false);
    }
  };

  const isLessonLocked = async (lessonId: string) => {
    if (lessonId === 'prof_1') return false; // First lesson always unlocked
    
    // Check if it's in unlocked list
    if (!unlockedLessons.includes(lessonId)) return true;

    // Check 24h lock
    const unlockTime = await AsyncStorage.getItem(`unlock_time_${lessonId}`);
    if (!unlockTime) return false; // If no timestamp, assume it's legacy unlocked

    const now = new Date().getTime();
    const lockDuration = 24 * 60 * 60 * 1000; // 24 Hours
    const timeLeft = lockDuration - (now - parseInt(unlockTime));
    
    return timeLeft > 0;
  };

  const completeLesson = async (lesson: any) => {
    const lessonNumber = parseInt(lesson.id.split('_')[1]);
    const nextLessonId = `prof_${lessonNumber + 1}`;
    const now = new Date().getTime();
    
    // Unlock next lesson with a timestamp
    const updatedUnlocked = Array.from(new Set([...unlockedLessons, nextLessonId]));
    
    try {
      await AsyncStorage.setItem(`unlock_time_${nextLessonId}`, now.toString());
      await AsyncStorage.setItem('lesson_progress', JSON.stringify({ 
        unlocked: updatedUnlocked, 
        level: lesson.level_complete ? userLevel + 1 : userLevel 
      }));
      
      setUnlockedLessons(updatedUnlocked);
      if (lesson.level_complete) {
        setUserLevel(prev => prev + 1);
      }
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  };

  return { isLessonLocked, completeLesson, userLevel, unlockedLessons, loading };
};
