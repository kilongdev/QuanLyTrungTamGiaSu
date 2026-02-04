import { useState } from 'react'
import Login from './Login'
import Register from './Register'

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)

  const handleAuthSuccess = (data) => {
    console.log('Auth success:', data)
    onAuthSuccess?.(data)
  }

  return (
    <>
      {isLogin ? (
        <Login
          onSwitchToRegister={() => setIsLogin(false)}
          onLoginSuccess={handleAuthSuccess}
        />
      ) : (
        <Register
          onSwitchToLogin={() => setIsLogin(true)}
          onRegisterSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}
