import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/features/auth';
import { ApiError, ErrorResponseData } from './errors';

const createClient = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorResponseData>) => {
      if (!error.response) {
        return Promise.reject(ApiError.networkError());
      }

      const { status, data } = error.response;

      if (data?.code && data?.message) {
        const apiError = ApiError.fromResponse(status, data);

        if (status === 422) {
          alert(data.message);
        }

        return Promise.reject(apiError);
      }

      return Promise.reject(ApiError.unknownError());
    },
  );

  return instance;
};

/** API 클라이언트 (토큰 있으면 자동 첨부) */
export const client = createClient();

// 토큰 있으면 Authorization 헤더 추가
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 응답 시 로그아웃 처리
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponseData>) => {
    if (error.response?.status === 401) {
      const token = sessionStorage.getItem('token');
      if (token) {
        // 토큰이 있었는데 401이면 만료된 것 → 로그아웃
        useAuthStore.getState().logout();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);
