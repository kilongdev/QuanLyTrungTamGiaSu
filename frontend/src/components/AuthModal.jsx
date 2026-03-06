import { useState, useEffect } from 'react'
import Login from './Login'
import Register from './Register'

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultTab = 'login' }) {
  const [isLogin, setIsLogin] = useState(defaultTab === 'login')

  // Cập nhật khi defaultTab thay đổi
  useEffect(() => {
    setIsLogin(defaultTab === 'login')
  }, [defaultTab, isOpen])

  if (!isOpen) return null

  const handleAuthSuccess = (data) => {
    onAuthSuccess?.(data)
    onClose?.()
  }

  return (
    <>
      {isLogin ? (
        <Login
          onSwitchToRegister={() => setIsLogin(false)}
          onLoginSuccess={handleAuthSuccess}
          onClose={onClose}
        />
      ) : (
        <Register
          onSwitchToLogin={() => setIsLogin(true)}
          onRegisterSuccess={handleAuthSuccess}
          onClose={onClose}
        />
      )}
    </>
  )
}
