import axios, { type AxiosInstance } from 'axios'

export interface User {
  id: string
  uid?: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  phoneNumber?: string
  profilePicture?: string
  loginType?: string
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  isKycVerified?: boolean
  withdrawalWhitelist?: boolean
  kycLevel?: number
  isActive: boolean
  isFrozen?: boolean
  isGoogle2FAEnabled?: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedUsersResponse {
  users: User[]
  pagination: {
    currentPage: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  whitelist?: string
}

export interface RefreshToken {
  id: string
  isActive: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface DeviceLocation {
  lat: number
  lng: number
  city: string
  country: string
}

export interface Device {
  id: string
  ipAddress: string | null
  userAgent: string
  location: DeviceLocation | null
  timezone: string | null
  fingerprint: string
  refreshTokens: RefreshToken[]
  createdAt: string
  updatedAt: string
}

export interface UserDevicesResponse {
  userId: string
  devices: Device[]
}

class UserAPI {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async getUsers(params?: GetUsersParams): Promise<PaginatedUsersResponse> {
    const response = await this.client.get('/users', {
      params
    })

    const data = response.data

    // Map the API response to our expected format
    return {
      users: data.users.map((user: any) => ({
        ...user,
        phoneNumber: user.phone || user.phoneNumber
      })),
      pagination: {
        currentPage: data.pagination.currentPage,
        limit: data.pagination.limit,
        totalCount: data.pagination.totalCount,
        totalPages: data.pagination.totalPages,
        hasNextPage: data.pagination.hasNextPage,
        hasPrevPage: data.pagination.hasPrevPage
      }
    }
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`)
    return response.data
  }

  async toggleUserStatus(id: string): Promise<{ id: string; isActive: boolean; message: string }> {
    const response = await this.client.patch(`/users/${id}/toggle-status`)
    return response.data
  }

  async toggleWithdrawalWhitelist(id: string): Promise<{ id: string; withdrawalWhitelist: boolean; message: string }> {
    const response = await this.client.patch(`/users/${id}/toggle-whitelist`)
    return response.data
  }

  async getUserDevices(id: string): Promise<UserDevicesResponse> {
    const response = await this.client.get<UserDevicesResponse>(`/users/${id}/devices`)
    return response.data
  }
}

export const userApi = new UserAPI()
export default userApi