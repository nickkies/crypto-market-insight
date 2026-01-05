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

/** 인증 불필요 API용 클라이언트 */
export const client = createClient();

/** 인증 필요 API용 클라이언트 */
export const authClient = createClient();

authClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    return Promise.reject(ApiError.authRequired());
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponseData>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);
