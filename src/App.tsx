import React, { useEffect } from 'react'
import AppRouter from './router'
import { AuthService } from './services/auth'

const App: React.FC = () => {
  useEffect(() => {
    // Apply dark theme by default
    document.documentElement.classList.add('dark')

    // Initialize auth service interceptors
    const authService = AuthService.getInstance()
    authService.setupAxiosInterceptors()
  }, [])

  return (
    <div className="dark">
      <AppRouter />
    </div>
  )
}

export default App