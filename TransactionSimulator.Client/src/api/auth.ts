import client from './client';
import type { ApiResponse, AuthData } from '../types';

export const login = (email: string, password: string) =>
  client.post<ApiResponse<AuthData>>('/auth/login', { email, password });

export const register = (email: string, password: string, fullName: string) =>
  client.post<ApiResponse<string>>('/auth/register', { email, password, fullName });
