import { QueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error: unknown) => {
        const message = (error as Error).message || 'Something went wrong'

        toast.error(message)
      },
    },
  },
})
