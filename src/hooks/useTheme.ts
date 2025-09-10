import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark'

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('dark')

  const updateHTMLClass = useCallback((newTheme: Theme) => {
    const html = document.documentElement
    if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setThemeState(newTheme)
    updateHTMLClass(newTheme)
    localStorage.setItem('theme', newTheme)
  }, [theme, updateHTMLClass])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    updateHTMLClass(newTheme)
    localStorage.setItem('theme', newTheme)
  }, [updateHTMLClass])

  const initTheme = useCallback(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const initialTheme = savedTheme || 'dark'
    setThemeState(initialTheme)
    updateHTMLClass(initialTheme)
  }, [updateHTMLClass])

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return {
    theme,
    toggleTheme,
    setTheme,
    initTheme
  }
}