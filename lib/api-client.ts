import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_URL } from '@/constants/api';
import lessonsData from '@/data/lessons.json';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_PORT = '5000';

function getExpoDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    (Constants as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] || null;
}

function isValidCandidate(url: string): boolean {
  if (__DEV__) return true;
  // In production/preview builds, exclude local loopbacks as mobile devices cannot reach them
  const lowerUrl = url.toLowerCase();
  return !lowerUrl.includes('localhost') && !lowerUrl.includes('127.0.0.1') && !lowerUrl.includes('10.0.2.2');
}

let baseUrlResolved = false;
let resolvePromise: Promise<string> | null = null;

// Safe promiseAny helper (ES6 compatible, fallback)
async function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let rejectedCount = 0;
    const errors: any[] = [];
    if (promises.length === 0) {
      reject(new Error('No promises provided'));
      return;
    }
    promises.forEach((p, idx) => {
      Promise.resolve(p).then(
        (val) => resolve(val),
        (err) => {
          errors[idx] = err;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new Error('All promises rejected'));
          }
        }
      );
    });
  });
}

let lastDiscoveryAttempt = 0;

async function discoverBaseUrl(): Promise<string> {
  const candidates: string[] = [];

  // 1. Try Expo/Metro Host
  const expoHost = getExpoDevHost();
  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    candidates.push(`http://${expoHost}:${API_PORT}/api`);
  }

  // 2. Try process.env IP variables
  if (process.env.EXPO_PUBLIC_API_HOST) {
    candidates.push(`http://${process.env.EXPO_PUBLIC_API_HOST}:${API_PORT}/api`);
  }
  if (process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
    candidates.push(`http://${process.env.REACT_NATIVE_PACKAGER_HOSTNAME}:${API_PORT}/api`);
  }

  // 3. Try default API_URL
  if (API_URL) candidates.push(API_URL);

  // 4. Try standard loopbacks
  candidates.push('http://192.168.18.101:5000/api');
  candidates.push('http://localhost:5000/api');
  candidates.push('http://127.0.0.1:5000/api');
  candidates.push('http://10.0.2.2:5000/api');

  // De-duplicate and filter out invalid loopbacks in production
  const uniqueCandidates = Array.from(new Set(candidates)).filter(isValidCandidate);

  // Probe all candidates in parallel with 4000ms timeout
  const probes = uniqueCandidates.map(async (url) => {
    try {
      const healthUrl = url.replace(/\/api\/?$/, '/health');
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

      const checkInstance = axios.create({ timeout: 4000 });
      const res = await checkInstance.get(healthUrl, controller ? { signal: controller.signal } : {}).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
      if (res.status === 200) {
        return url;
      }
    } catch (e) {
      // Ignore
    }
    throw new Error(`Unreachable: ${url}`);
  });

  try {
    const workingUrl = await Promise.race([
      promiseAny(probes),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Discovery timeout')), 4500))
    ]);
    isOfflineFallbackMode = false;
    return workingUrl;
  } catch (e) {
    isOfflineFallbackMode = true;
    return API_URL;
  }
}

export let isOfflineFallbackMode = false;

function getMockResponse(url: string | undefined, requestData: any): any {
  const path = url || '';
  
  let body = requestData;
  if (typeof requestData === 'string') {
    try {
      body = JSON.parse(requestData);
    } catch {
      body = {};
    }
  } else if (!requestData) {
    body = {};
  }
  
  if (path.endsWith('/auth/signup')) {
    return {
      success: false,
      message: 'App is offline. Cannot create an account. Please check your server connection.'
    };
  }
  
  if (path.endsWith('/auth/login')) {
    return {
      success: false,
      message: 'App is offline. Cannot verify credentials. Please check your server connection.'
    };
  }
  
  if (path.endsWith('/user/upload-image')) {
    return {
      success: true,
      secure_url: body.base64Data || ''
    };
  }
  
  if (path.endsWith('/user/profile')) {
    return {
      success: true
    };
  }
  
  if (path.endsWith('/chat')) {
    return {
      reply: `[Offline Mode] Aapka backend reachable nahi tha, isliye hum offline mode me chal rahe hain. Aapne kaha: "${body.message || ''}"`
    };
  }
  
  if (path.endsWith('/chat/evaluate-speech')) {
    return {
      pronunciationScore: 88,
      grammarScore: 92,
      vocabularyScore: 85,
      mnemonicScore: 90,
      overallProgress: 89,
      levelLabel: 'Intermediate',
      feedback: `[Offline Mode] Backend connection na hone ki wajah se ye mock evaluation hai. Aapne pronounce kiya: "${body.spoken || ''}"`,
      tip: 'Apne accents aur flow ko improve karne ke liye audio ko dobara sunein.',
      match: true
    };
  }
  
  if (path.endsWith('/auth/forgot-password')) {
    return {
      success: true,
      message: 'Password reset link sent to your email address.',
      token: 'debug-token-12345',
      resetUrl: 'http://localhost:8081/reset-password?token=debug-token-12345'
    };
  }
  
  if (path.endsWith('/auth/reset-password')) {
    return {
      success: true,
      message: 'Password updated successfully.'
    };
  }

  if (path.endsWith('/lessons/visible')) {
    return lessonsData.lessons || [];
  }

  if (path.includes('/wt-coins/details') || path.includes('/wt-coins')) {
    return {
      success: true,
      currentBalance: 50,
      totalEarned: 0,
      totalRedeemed: 0,
      recentTransactions: [
        {
          _id: 'tx_signup_bonus',
          rewardType: 'Signup Bonus',
          coinsEarned: 50,
          date: new Date().toISOString()
        }
      ]
    };
  }
  
  return {};
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically swap baseURL
apiClient.interceptors.request.use(async (config) => {
  if (!baseUrlResolved) {
    if (!resolvePromise) {
      resolvePromise = discoverBaseUrl().then((url) => {
        apiClient.defaults.baseURL = url;
        baseUrlResolved = true;
        return url;
      }).finally(() => {
        resolvePromise = null;
      });
    }
    const workingUrl = await resolvePromise;
    config.baseURL = workingUrl;
  }

  // Automatically attach Authorization: Bearer <token> header if a token exists in SecureStore
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn('[API] Failed to attach SecureStore userToken in interceptor:', err);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to intercept mock errors and resolve them as successful responses
apiClient.interceptors.response.use(
  async (response) => {
    // If response contains rewardsEarned, store them in AsyncStorage as pending_rewards
    if (response.data && response.data.rewardsEarned && response.data.rewardsEarned.length > 0) {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const existingStr = await AsyncStorage.getItem('pending_rewards');
        let existing = existingStr ? JSON.parse(existingStr) : [];
        if (!Array.isArray(existing)) existing = [];
        
        // Prevent duplicate rewards
        const updated = [...existing];
        response.data.rewardsEarned.forEach((newItem: any) => {
          const isDup = updated.some((item: any) => 
            item.type === newItem.type && 
            item.amount === newItem.amount && 
            item.currentBalance === newItem.currentBalance
          );
          if (!isDup) {
            updated.push(newItem);
          }
        });
        
        await AsyncStorage.setItem('pending_rewards', JSON.stringify(updated));
        console.log('Saved pending rewards from API:', response.data.rewardsEarned);
      } catch (err) {
        console.error('Error saving pending rewards:', err);
      }
    }
    return response;
  },
  async (error) => {
    // If the request failed because the server is unreachable (Network Error)
    if (isNetworkError(error)) {
      const urlPath = error.config?.url || '';
      const attemptedUrl = `${error.config?.baseURL || ''}${urlPath}`;
      console.warn(`[API] Network error: backend unreachable. Failed to connect to ${attemptedUrl}. Message: ${error.message || 'No response from server.'}`);
      
      // Auto-trigger URL re-discovery in background if we hit a network error,
      // in case the backend server IP changed.
      const now = Date.now();
      if (now - lastDiscoveryAttempt > 10000) {
        lastDiscoveryAttempt = now;
        discoverBaseUrl().then((url) => {
          apiClient.defaults.baseURL = url;
          console.log(`[API] Re-discovered working baseURL in background: ${url}`);
        }).catch(() => {});
      }

      // CRITICAL: Do NOT return mock responses for auth and sync routes.
      // Propagate the network error so the user gets detailed feedback.
      const isAuthRoute = urlPath.includes('/auth/');
      const isSyncRoute = urlPath.endsWith('/user/sync');
      
      if (isAuthRoute || isSyncRoute) {
        const enhancedError = new Error(`Connection failed to ${attemptedUrl}. Details: ${error.message || 'Network Error'}`);
        Object.defineProperty(enhancedError, 'isNetworkError', { value: true, enumerable: true });
        Object.defineProperty(enhancedError, 'config', { value: error.config, enumerable: true });
        return Promise.reject(enhancedError);
      }

      const mockData = getMockResponse(error.config?.url, error.config?.data);
      return Promise.resolve({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    if (axios.isAxiosError(error)) {
      const urlPath = error.config?.url || '';
      const isLoginOrSignup = urlPath.includes('/auth/login') || urlPath.includes('/auth/signup');
      if (error.response?.status === 401 && !isLoginOrSignup) {
        console.warn('[API] 401 Unauthorized response received. Clearing local session...');
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const { router } = require('expo-router');
          
          // Clear keys asynchronously
          SecureStore.deleteItemAsync('userToken');
          SecureStore.deleteItemAsync('userName');
          SecureStore.deleteItemAsync('userAvatar');
          SecureStore.deleteItemAsync('userEmail');
          AsyncStorage.clear().catch(() => {});
          
          router.replace('/sign-in');
        } catch (err) {
          console.error('Error during auto-logout on 401:', err);
        }
      }
    }

    return Promise.reject(error);
  }
);

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

export function authConfig(token: string, config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const expoHost = getExpoDevHost();
    const candidateUrls = [
      apiClient.defaults.baseURL,
      API_URL,
      expoHost ? `http://${expoHost}:${API_PORT}/api` : null,
      'http://192.168.18.101:5000/api',
      'http://127.0.0.1:5000/api',
      'http://localhost:5000/api'
    ].filter(Boolean).filter((url) => isValidCandidate(url as string)) as string[];

    for (const activeUrl of candidateUrls) {
      try {
        const healthUrl = activeUrl.replace(/\/api\/?$/, '/health');
        const response = await axios.get(healthUrl, { timeout: 3000 });
        if (response.status === 200) {
          apiClient.defaults.baseURL = activeUrl;
          isOfflineFallbackMode = false;
          return true;
        }
      } catch {}
    }
    return false;
  } catch {
    return false;
  }
}

export function logApiError(context: string, error: unknown) {
  if (!__DEV__) {
    return;
  }

  if (isNetworkError(error)) {
    console.warn(`[API] ${context}: backend unreachable at ${API_URL}`);
    return;
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  const msg = String((axiosError.response?.data as any)?.message || '');

  if (status === 401 || msg.includes('authorization denied') || msg.includes('User not found')) {
    // Quietly ignore 401 unauthorized / stale user token error logs
    return;
  }

  console.warn(`[API] ${context}:`, axiosError.response?.data ?? axiosError.message);
}

export async function getVisibleLessonsWithFallback(userToken: string | null) {
  if (userToken) {
    try {
      const res = await apiClient.get('/lessons/visible', authConfig(userToken));
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((l: any, idx: number) => {
          const num = Number(l.lessonNumber || l.lessonId || l.id || (idx + 1));
          return {
            id: String(num),
            lessonId: num,
            phase: num <= 5 ? 'beginner' : num <= 10 ? 'intermediate' : 'advanced',
            dayNumber: num,
            title: l.title || `Lesson ${num}`,
            description: l.description || '',
            status: l.status === 'next_locked' ? 'locked' : (l.status || (num === 1 ? 'active' : 'locked')),
            progressPercentage: l.progressPercentage !== undefined ? l.progressPercentage : (l.status === 'completed' ? 100 : 0),
            isUnlocked: l.isUnlocked !== undefined ? l.isUnlocked : (l.status === 'active' || l.status === 'completed' || (!l.status && num === 1)),
            timeRemaining: l.timeRemaining || null,
          };
        });
      }
    } catch (err) {
      if (!isNetworkError(err)) {
        logApiError('getVisibleLessons', err);
      }
    }
  }

  // Fallback to local static json data
  return (lessonsData.lessons || []).map((l: any, idx: number) => {
    const num = Number(l.lessonId || l.id || (idx + 1));
    return {
      id: String(num),
      lessonId: num,
      phase: l.phase || (num <= 5 ? 'beginner' : num <= 10 ? 'intermediate' : 'advanced'),
      dayNumber: l.dayNumber || num,
      title: l.title || `Lesson ${num}`,
      description: l.description || '',
      status: num === 1 ? 'active' : 'locked',
      progressPercentage: 0,
      isUnlocked: num === 1,
      timeRemaining: null,
    };
  });
}

export async function getLessonWithFallback(lessonId: string, userToken: string | null) {
  const activeId = lessonId || '1';
  const allLessons = lessonsData.lessons || [];
  const staticLesson = allLessons.find(l => String(l.id) === String(activeId) || String(l.lessonId) === String(activeId)) || allLessons[0];

  if (userToken) {
    try {
      const res = await apiClient.get(`/lessons/${activeId}`, authConfig(userToken));
      if (res.data) {
        const rawData = res.data;
        const dbLesson = rawData.lesson || rawData.data || rawData;
        const num = Number(dbLesson.lessonNumber || dbLesson.lessonId || staticLesson?.lessonId || activeId || 1);
        
        const title = dbLesson.title || staticLesson?.title || `Lesson ${num}`;
        const description = dbLesson.description || staticLesson?.description || '';
        
        const rawLearn = (dbLesson.learn && dbLesson.learn.length > 0) 
          ? dbLesson.learn 
          : (staticLesson?.steps?.learn || []);

        const learn = rawLearn.map((l: any, idx: number) => ({
          id: l.id || l._id || `l_${idx}`,
          word: l.word || '',
          meaning: l.meaning || l.urduMeaning || '',
          example: l.example || l.exampleSentence || '',
          audioUrl: l.audioUrl || ''
        }));

        const rawPractice = (dbLesson.practice && (Array.isArray(dbLesson.practice) ? dbLesson.practice.length > 0 : Object.keys(dbLesson.practice).length > 0))
          ? dbLesson.practice
          : staticLesson?.steps?.practice;

        const practice = Array.isArray(rawPractice) ? rawPractice : [
          {
            subStepId: 1,
            type: 'listen_repeat',
            title: 'Listen & Repeat',
            subtitle: 'Listen to the audio and repeat to improve your pronunciation.',
            phrase: dbLesson.practice?.listenAndRepeat?.[0] || staticLesson?.steps?.practice?.[0]?.phrase || 'Hello! How are you today?'
          },
          {
            subStepId: 2,
            type: 'fill_blanks',
            title: 'Fill in the Blanks',
            subtitle: 'Complete the sentences with the correct words.',
            sentence: dbLesson.practice?.fillInTheBlanks?.[0]?.question || staticLesson?.steps?.practice?.[1]?.sentence || 'Good ___, everyone!',
            correctAnswer: dbLesson.practice?.fillInTheBlanks?.[0]?.correctAnswer || staticLesson?.steps?.practice?.[1]?.correctAnswer || 'morning'
          },
          {
            subStepId: 3,
            type: 'speak_yourself',
            title: 'Speak Yourself',
            subtitle: 'Practice speaking and record your voice.',
            aiPrompt: dbLesson.practice?.speakYourself?.[0] || staticLesson?.steps?.practice?.[2]?.aiPrompt || 'Introduce yourself.'
          }
        ];

        const rawQuiz = (dbLesson.quiz && dbLesson.quiz.length > 0)
          ? dbLesson.quiz
          : (staticLesson?.steps?.quiz || []);

        const quiz = rawQuiz.map((q: any, idx: number) => {
          const correctIdx = q.correctOptionIndex ?? (q.options?.indexOf(q.correctAnswer) ?? 0);
          return {
            qId: q.qId || q._id || idx,
            question: q.question || '',
            options: q.options || [],
            correctOptionIndex: correctIdx !== -1 ? correctIdx : 0
          };
        });

        return {
          id: String(num),
          lessonId: num,
          phase: num <= 5 ? 'beginner' : num <= 10 ? 'intermediate' : 'advanced',
          dayNumber: num,
          title,
          description,
          userSteps: dbLesson.userSteps || rawData.userSteps || { learn: false, practice: false, quiz: false, review: false },
          isCompleted: !!(dbLesson.isCompleted ?? rawData.isCompleted),
          isCurrent: !!(dbLesson.isCurrent ?? rawData.isCurrent),
          isUnlocked: !!(dbLesson.isUnlocked ?? rawData.isUnlocked),
          steps: {
            learn,
            practice,
            quiz,
            review: dbLesson.steps?.review || staticLesson?.steps?.review || {
              summary: `You have completed Lesson ${num}! You can now confidently use the phrases and vocabulary learned.`
            }
          }
        };
      }
    } catch (err) {
      if (!isNetworkError(err)) {
        logApiError(`getLesson(${activeId})`, err);
      }
    }
  }

  // Fallback to local static json data
  return staticLesson;
}
