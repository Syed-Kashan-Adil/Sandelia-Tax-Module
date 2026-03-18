export const REACT_QUERY_KEYS = {
  USER: 'user',
} as const

export type ReactQueryKey = (typeof REACT_QUERY_KEYS)[keyof typeof REACT_QUERY_KEYS]
