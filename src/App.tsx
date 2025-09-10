import React, { useEffect } from 'react'
import AppRouter from './router'

const App: React.FC = () => {
  useEffect(() => {
    // Apply dark theme by default
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="dark">
      <AppRouter />
    </div>
  )
}

export default App