import {
  getAiTutorSessions,
  getCompletedLessonsCount,
  getQuizPerfectCount,
  getTotalWordsLearned,
  ProgressData,
} from '@/lib/progress-utils';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  iconType: 'ionicons' | 'material';
  color: string;
  bgColor: string;
  checkEarned: (progressData: ProgressData | null | undefined, streakCount: number) => boolean;
  getProgress: (progressData: ProgressData | null | undefined, streakCount: number) => { current: number; total: number };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    iconName: 'handshake',
    iconType: 'material',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    checkEarned: (data) => getCompletedLessonsCount(data) >= 1,
    getProgress: (data) => ({ current: Math.min(getCompletedLessonsCount(data), 1), total: 1 }),
  },
  {
    id: 'consistent-learner',
    name: 'Consistent Learner',
    description: 'Maintain a 3 day streak',
    iconName: 'fire',
    iconType: 'material',
    color: '#F97316',
    bgColor: '#FFF7ED',
    checkEarned: (_, streak) => streak >= 3,
    getProgress: (_, streak) => ({ current: Math.min(streak, 3), total: 3 }),
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete 5 lessons',
    iconName: 'book',
    iconType: 'ionicons',
    color: '#10B981',
    bgColor: '#ECFDF5',
    checkEarned: (data) => getCompletedLessonsCount(data) >= 5,
    getProgress: (data) => ({ current: Math.min(getCompletedLessonsCount(data), 5), total: 5 }),
  },
  {
    id: 'goal-getter',
    name: 'Goal Getter',
    description: 'Complete 10 lessons',
    iconName: 'target',
    iconType: 'material',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    checkEarned: (data) => getCompletedLessonsCount(data) >= 10,
    getProgress: (data) => ({ current: Math.min(getCompletedLessonsCount(data), 10), total: 10 }),
  },
  {
    id: 'word-master',
    name: 'Word Master',
    description: 'Learn 50 new words',
    iconName: 'text',
    iconType: 'ionicons',
    color: '#A78BFA',
    bgColor: '#FAF5FF',
    checkEarned: (data) => getTotalWordsLearned(data) >= 50,
    getProgress: (data) => ({ current: Math.min(getTotalWordsLearned(data), 50), total: 50 }),
  },
  {
    id: 'top-performer',
    name: 'Top Performer',
    description: 'Complete 3 quizzes',
    iconName: 'trophy',
    iconType: 'ionicons',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    checkEarned: (data) => getQuizPerfectCount(data) >= 3,
    getProgress: (data) => ({ current: Math.min(getQuizPerfectCount(data), 3), total: 3 }),
  },
  {
    id: 'helpful-learner',
    name: 'Helpful Learner',
    description: 'Use AI Tutor 5 times',
    iconName: 'heart',
    iconType: 'ionicons',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    checkEarned: (data) => getAiTutorSessions(data) >= 5,
    getProgress: (data) => ({ current: Math.min(getAiTutorSessions(data), 5), total: 5 }),
  },
  {
    id: 'seven-day-streak',
    name: '7-Day Streak',
    description: 'Maintain a 7 day streak',
    iconName: 'calendar',
    iconType: 'ionicons',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    checkEarned: (_, streak) => streak >= 7,
    getProgress: (_, streak) => ({ current: Math.min(streak, 7), total: 7 }),
  },
];

export function buildBadges(progressData: ProgressData | null | undefined, streakCount: number) {
  return BADGE_DEFINITIONS.map((badge) => {
    const isEarned = badge.checkEarned(progressData, streakCount);
    const progress = badge.getProgress(progressData, streakCount);
    return {
      ...badge,
      isEarned,
      progressCurrent: progress.current,
      progressTotal: progress.total,
    };
  });
}

export function getEarnedBadges(progressData: ProgressData | null | undefined, streakCount: number) {
  return buildBadges(progressData, streakCount).filter((badge) => badge.isEarned);
}
