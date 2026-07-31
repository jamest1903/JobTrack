import api from './client';
import type { AuthResponse, User } from '@/types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function storeSession(data: AuthResponse) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export async function login(params: LoginParams): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', params);
  storeSession(data);
  return data;
}

export async function register(params: RegisterParams): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', params);
  storeSession(data);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    clearSession();
  }
}
