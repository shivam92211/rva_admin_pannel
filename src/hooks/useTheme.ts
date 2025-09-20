import { useEffect } from 'react'

export const useTheme = () => {
  useEffect(() => {
    // Always apply dark theme
    document.documentElement.classList.add('dark')
  }, [])

  return {
    theme: 'dark' as const
  }
}