import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import signInSchema from '../schema'
import { signIn } from '../services'
import type { SignInRequest } from '../types'

export const useSignIn = (endpoint: string) => {
  const form = useForm<SignInRequest>({
    mode: 'onSubmit',
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: SignInRequest): Promise<string> => {
      return signIn(endpoint, data)
    },
  })

  return {
    signInForm: form,
    signInMutation: mutation,
  }
}
