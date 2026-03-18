import axios from 'axios'

import { useAuthStore } from '../module/auth/store'

const axiosInstance = axios.create({
  baseURL: import.meta.env['VITE_BACKEND_URL'],
})

// Request Interceptor: Attach token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle success and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Check application-level status codes in response body
    const { data } = response

    // Check for status codes in response body (some APIs return 200 with error status)
    if (data?.status !== undefined && data.status >= 400) {
      const message = data.message
      return Promise.reject(new Error(message))
    }

    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.response?.data?.error

    const { logout } = useAuthStore.getState()

    if (status === 401) {
      logout()
      // TODO: Redirect to login page instead of reloading the page
      window.location.reload()
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    if (message) {
      return Promise.reject(new Error(message))
    }

    return Promise.reject(new Error('Something went wrong'))
  }
)

export default axiosInstance
