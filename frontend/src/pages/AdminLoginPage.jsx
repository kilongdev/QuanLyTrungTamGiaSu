import { Navigate } from 'react-router-dom'
import Login from '../components/Login'

export default function AdminLoginPage({ user, onAuthSuccess }) {
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Login
        mode="admin"
        onLoginSuccess={onAuthSuccess}
      />
    </div>
  )
}