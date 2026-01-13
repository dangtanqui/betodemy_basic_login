import { api } from './api'
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', credentials)
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', credentials)
  },

  async getProfile(): Promise<User> {
    return api.get<User>('/users/me', true)
  },

  async uploadAvatar(file: File): Promise<User> {
    return api.uploadFile<User>('/users/avatar', file)
  },

  async loginWithGoogle(accessToken: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/google', { accessToken })
  },
}
