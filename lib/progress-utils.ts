export type ProgressData = Record<string, string | undefined>;

export function parseJsonValue<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T;
  } catch {
    return fallback;
  }
}

export function getCompletedLessons(progressData: ProgressData | null | undefined): number[] {
  const arr = parseJsonValue<number[]>(progressData?.['completed_lessons'], []);
  return Array.isArray(arr) ? arr : [];
}

export function getCompletedLessonsCount(progressData: ProgressData | null | undefined): number {
  return getCompletedLessons(progressData).length;
}

export function getTotalWordsLearned(progressData: ProgressData | null | undefined): number {
  if (!progressData) return 0;
  return Object.keys(progressData).filter((key) => key.startsWith('completed_words_')).length;
}

export function getUserStats(progressData: ProgressData | null | undefined) {
  return parseJsonValue<{ xp?: number; coins?: number; gems?: number; streak?: number }>(
    progressData?.['user_stats'],
    {}
  );
}

export function getTotalXp(progressData: ProgressData | null | undefined): number {
  return getUserStats(progressData).xp || 0;
}

export function getQuizPerfectCount(progressData: ProgressData | null | undefined): number {
  if (!progressData) return 0;
  return Object.keys(progressData).filter((key) => key.startsWith('completed_quiz_')).length;
}

export function getAiTutorSessions(progressData: ProgressData | null | undefined): number {
  if (!progressData) return 0;
  return Object.keys(progressData).filter((key) => key.startsWith('completed_practice_')).length;
}

export function getLearningLevel(completedCount: number): string {
  if (completedCount >= 15) return 'Advanced Level';
  if (completedCount >= 10) return 'Upper Intermediate';
  if (completedCount >= 5) return 'Intermediate Level';
  if (completedCount >= 1) return 'Beginner Level';
  return 'Getting Started';
}

export function getWeeklyGoalProgress(
  progressData: ProgressData | null | undefined,
  weeklyTarget = 5
): { completed: number; target: number; percent: number } {
  const completed = getCompletedLessonsCount(progressData);
  const target = weeklyTarget;
  const percent = Math.min(Math.round((completed / target) * 100), 100);
  return { completed: Math.min(completed, target), target, percent };
}

export function formatProgressDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getCompletionDates(progressData: ProgressData | null | undefined): string[] {
  if (!progressData) return [];
  return Object.entries(progressData)
    .filter(([key]) => key.startsWith('completion_date_'))
    .map(([, value]) => value?.trim())
    .filter(Boolean) as string[];
}

export function getCertificates(progressData: ProgressData | null | undefined) {
  const completedCount = getCompletedLessonsCount(progressData);
  const certificates: { title: string; date: string; level: string }[] = [];

  if (completedCount >= 5) {
    certificates.push({
      title: 'Beginner Mastery',
      date: formatProgressDate(getLatestCompletionDate(progressData, 5)) || 'Recently',
      level: 'Beginner',
    });
  }
  if (completedCount >= 10) {
    certificates.push({
      title: 'Intermediate Mastery',
      date: formatProgressDate(getLatestCompletionDate(progressData, 10)) || 'Recently',
      level: 'Intermediate',
    });
  }
  if (completedCount >= 15) {
    certificates.push({
      title: 'Course Completion',
      date: formatProgressDate(getLatestCompletionDate(progressData, 15)) || 'Recently',
      level: 'Advanced',
    });
  }

  return certificates;
}

function getLatestCompletionDate(progressData: ProgressData | null | undefined, minLessons: number): string | undefined {
  const dates = getCompletionDates(progressData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  if (dates.length >= minLessons) {
    return dates[Math.min(minLessons - 1, dates.length - 1)];
  }
  return dates[dates.length - 1];
}

export const TOTAL_LESSONS = 15;
