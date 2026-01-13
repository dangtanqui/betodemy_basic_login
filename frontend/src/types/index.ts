export interface User {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  joinedAt: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  fullName: string
  email: string
  password: string
}
