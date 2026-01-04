import axios, { AxiosError } from 'axios';
import { ApiError, ErrorResponseData } from './errors';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponseData>) => {
    if (!error.response) {
      return Promise.reject(ApiError.networkError());
    }

    const { status, data } = error.response;

    if (status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/';
    }

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
