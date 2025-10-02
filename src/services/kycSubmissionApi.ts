import axios, { type AxiosInstance } from 'axios'

export interface KycSubmission {
  id: string
  userId: string
  level: number
  status: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  idType: string
  idNumber: string
  idFrontImage: string
  idBackImage?: string
  selfieImage: string
  addressProof?: string
  utilityBill?: string
  expireDate?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  rejectReason?: string
  sentToKucoin: boolean
  sentAt?: string
  kucoinSubmissionId?: string
  checkedAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    phone?: string
    isEmailVerified?: boolean
    isPhoneVerified?: boolean
    isKycVerified?: boolean
  }
}

export interface PaginatedKycSubmissionsResponse {
  kycSubmissions: KycSubmission[]
  pagination: {
    currentPage: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface GetKycSubmissionsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  level?: string
}

export interface UpdateKycStatusParams {
  status: string
  reviewedBy?: string
  rejectionReason?: string
}

class KycSubmissionAPI {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async getKycSubmissions(params?: GetKycSubmissionsParams): Promise<PaginatedKycSubmissionsResponse> {
    const response = await this.client.get('/kyc-submissions', {
      params
    })

    return response.data
  }

  async getKycSubmissionById(id: string): Promise<KycSubmission> {
    const response = await this.client.get<KycSubmission>(`/kyc-submissions/${id}`)
    return response.data
  }

  async updateKycSubmissionStatus(id: string, updateData: UpdateKycStatusParams): Promise<{ id: string; status: string; message: string }> {
    const response = await this.client.patch(`/kyc-submissions/${id}/status`, updateData)
    return response.data
  }
}

export const kycSubmissionApi = new KycSubmissionAPI()
export default kycSubmissionApi