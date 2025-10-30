import axios, { type AxiosInstance } from 'axios';
import { AuthService } from './auth';

// ==================== Interfaces ====================

export interface TermsAndConditions {
  id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTermsDto {
  title: string;
  content: string;
  version?: string;
}

export interface UpdateTermsDto {
  title?: string;
  content?: string;
  version?: string;
  isActive?: boolean;
}

export interface AdminTermsResponse {
  success: boolean;
  message: string;
  data?: TermsAndConditions;
}

export interface AllTermsResponse {
  success: boolean;
  data: TermsAndConditions[];
  total: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface UpdateFaqDto {
  question?: string;
  answer?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

export interface AdminFaqResponse {
  success: boolean;
  message: string;
  data?: FaqItem;
}

export interface AllFaqsResponse {
  success: boolean;
  data: FaqItem[];
  total: number;
}

export interface ContactUsSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  response: string | null;
  userId: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  respondedBy: string | null;
  respondedAt: string | null;
}

export interface UpdateContactUsDto {
  status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  response?: string;
}

export interface AdminContactUsResponse {
  success: boolean;
  message: string;
  data?: ContactUsSubmission;
}

export interface AdminContactUsListResponse {
  success: boolean;
  data: ContactUsSubmission[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface GetContactUsParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

// ==================== Admin Basic API Service ====================

class AdminBasicAPI {
  private client: AxiosInstance;

  private getToken = () => {
    const authService = AuthService.getInstance();
    return authService.getToken();
  };

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL!,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ==================== Terms and Conditions ====================

  /**
   * Create new Terms and Conditions
   * @param data Terms data
   * @returns Created terms
   */
  async createTerms(data: CreateTermsDto): Promise<AdminTermsResponse> {
    const response = await this.client.post<AdminTermsResponse>(
      '/api/v1/admin/basic/terms',
      data
    );
    return response.data;
  }

  /**
   * Get all Terms and Conditions (including inactive)
   * @returns All terms
   */
  async getAllTerms(): Promise<AllTermsResponse> {
    const response = await this.client.get<AllTermsResponse>('/api/v1/admin/basic/terms');
    return response.data;
  }

  /**
   * Update Terms and Conditions
   * @param id Terms ID
   * @param data Update data
   * @returns Updated terms
   */
  async updateTerms(id: string, data: UpdateTermsDto): Promise<AdminTermsResponse> {
    const response = await this.client.put<AdminTermsResponse>(
      `/api/v1/admin/basic/terms/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete Terms and Conditions
   * @param id Terms ID
   * @returns Delete response
   */
  async deleteTerms(id: string): Promise<AdminTermsResponse> {
    const response = await this.client.delete<AdminTermsResponse>(
      `/api/v1/admin/basic/terms/${id}`
    );
    return response.data;
  }

  // ==================== FAQs ====================

  /**
   * Create new FAQ
   * @param data FAQ data
   * @returns Created FAQ
   */
  async createFaq(data: CreateFaqDto): Promise<AdminFaqResponse> {
    const response = await this.client.post<AdminFaqResponse>(
      '/api/v1/admin/basic/faqs',
      data
    );
    return response.data;
  }

  /**
   * Get all FAQs (including inactive)
   * @returns All FAQs
   */
  async getAllFaqs(): Promise<AllFaqsResponse> {
    const response = await this.client.get<AllFaqsResponse>('/api/v1/admin/basic/faqs');
    return response.data;
  }

  /**
   * Update FAQ
   * @param id FAQ ID
   * @param data Update data
   * @returns Updated FAQ
   */
  async updateFaq(id: string, data: UpdateFaqDto): Promise<AdminFaqResponse> {
    const response = await this.client.put<AdminFaqResponse>(
      `/api/v1/admin/basic/faqs/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete FAQ
   * @param id FAQ ID
   * @returns Delete response
   */
  async deleteFaq(id: string): Promise<AdminFaqResponse> {
    const response = await this.client.delete<AdminFaqResponse>(
      `/api/v1/admin/basic/faqs/${id}`
    );
    return response.data;
  }

  // ==================== Contact Us ====================

  /**
   * Get all Contact Us submissions with pagination
   * @param params Query parameters
   * @returns Paginated submissions
   */
  async getContactUsSubmissions(params?: GetContactUsParams): Promise<AdminContactUsListResponse> {
    const response = await this.client.get<AdminContactUsListResponse>(
      '/api/v1/admin/basic/contact-us',
      { params }
    );
    return response.data;
  }

  /**
   * Update Contact Us submission
   * @param id Submission ID
   * @param data Update data
   * @returns Updated submission
   */
  async updateContactUsSubmission(
    id: string,
    data: UpdateContactUsDto
  ): Promise<AdminContactUsResponse> {
    const response = await this.client.put<AdminContactUsResponse>(
      `/api/v1/admin/basic/contact-us/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete Contact Us submission
   * @param id Submission ID
   * @returns Delete response
   */
  async deleteContactUsSubmission(id: string): Promise<AdminContactUsResponse> {
    const response = await this.client.delete<AdminContactUsResponse>(
      `/api/v1/admin/basic/contact-us/${id}`
    );
    return response.data;
  }
}

export const adminBasicApi = new AdminBasicAPI();
export default adminBasicApi;
