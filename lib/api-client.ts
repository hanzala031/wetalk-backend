import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_URL } from '@/constants/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const healthUrl = API_URL.replace(/\/api\/?$/, '/health');
    const response = await axios.get(healthUrl, { timeout: 5000 });
    return response.status === 200;
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
  console.warn(`[API] ${context}:`, axiosError.response?.data ?? axiosError.message);
}
