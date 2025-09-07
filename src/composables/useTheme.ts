import { ref, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('dark')

export const useTheme = () => {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    updateHTMLClass()
    localStorage.setItem('theme', theme.value)
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    updateHTMLClass()
    localStorage.setItem('theme', theme.value)
  }

  const updateHTMLClass = () => {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      theme.value = savedTheme
    } else {
      // Default to dark theme for the modern design
      theme.value = 'dark'
    }
    updateHTMLClass()
  }

  onMounted(() => {
    initTheme()
  })

  return {
    theme: theme,
    toggleTheme,
    setTheme,
    initTheme
  }
}