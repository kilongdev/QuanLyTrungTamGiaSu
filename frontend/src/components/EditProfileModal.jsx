import { useState, useEffect } from 'react'
import { X, Save, Eye, EyeOff } from 'lucide-react'
import adminAPI from '../api/adminApi'

export default function EditProfileModal({ user, onClose, initialTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  // Validation states
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    phone: ''
  })

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^0\d{9,10}$/ // Vietnamese phone: 0 + 9-10 digits

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return ''
    if (!emailRegex.test(email)) {
      return 'Email không hợp lệ (ví dụ: email@domain.com)'
    }
    return ''
  }

  const validatePhone = (phone) => {
    if (!phone) return '' // Phone is optional
    if (!phoneRegex.test(phone)) {
      return 'Số điện thoại không hợp lệ (ví dụ: 0123456789)'
    }
    return ''
  }

  // Check if profile form is valid
  const isProfileValid = () => {
    const emailError = validateEmail(profileData.email)
    return !emailError && profileData.name.trim().length > 0
  }

  // Fetch profile data when modal opens
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoadingProfile(true)
        const response = await adminAPI.getProfile()
        
        // Update profile data with fetched data from backend
        setProfileData({
          name: response.data?.ho_ten || user?.name || '',
          email: response.data?.email || user?.email || '',
          phone: response.data?.so_dien_thoai || user?.phone || '',
        })
      } catch (err) {
        console.error('Lỗi lấy thông tin profile:', err)
        // Fallback to user data from props if fetch fails
        setProfileData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
        })
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfileData()
  }, [])

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')

    // Validate field on change
    if (name === 'email') {
      setFieldErrors(prev => ({
        ...prev,
        email: validateEmail(value)
      }))
    } else if (name === 'phone') {
      setFieldErrors(prev => ({
        ...prev,
        phone: validatePhone(value)
      }))
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await adminAPI.updateProfile(profileData)

      setSuccess('Cập nhật thông tin thành công!')
      
      // Update user in localStorage
      const updatedUser = JSON.parse(localStorage.getItem('user'))
      updatedUser.name = profileData.name
      updatedUser.email = profileData.email
      updatedUser.phone = profileData.phone
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  // Password handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!passwordData.oldPassword) {
      setError('Vui lòng nhập mật khẩu cũ')
      return
    }

    if (!passwordData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới không khớp')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      await adminAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })

      setSuccess('Đổi mật khẩu thành công!')
      
      // Reset form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === 'profile' ? 'Sửa thông tin cá nhân' : 'Thay đổi mật khẩu'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('profile')
              setError('')
              setSuccess('')
            }}
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => {
              setActiveTab('password')
              setError('')
              setSuccess('')
            }}
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mật khẩu
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-4 space-y-3">
            {loadingProfile && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs text-center">
                Đang tải thông tin...
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Họ tên
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                disabled={loadingProfile}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled={loadingProfile}
                className={`w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  fieldErrors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="Ví dụ: 0123456789"
                disabled={loadingProfile}
                className={`w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  fieldErrors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                disabled={loading || loadingProfile || !isProfileValid()}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="p-4 space-y-3">
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mật khẩu cũ
              </label>
              <div className="relative">
                <input
                  type={showPasswords.oldPassword ? 'text' : 'password'}
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('oldPassword')}
                  className="absolute right-2.5 top-1.5 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.oldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute right-2.5 top-1.5 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-2.5 top-1.5 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
