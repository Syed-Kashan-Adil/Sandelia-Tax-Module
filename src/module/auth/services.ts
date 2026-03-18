import axiosInstance from '@/api/axiosInstance'

import type { SignInRequest, SignInResponse } from './types'

export const signIn = async (endpoint: string, data: SignInRequest): Promise<string> => {
  const response = await axiosInstance.post<SignInResponse>(endpoint, data)
  return response.data.data
}
