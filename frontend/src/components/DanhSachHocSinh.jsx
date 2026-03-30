import React, { useState, useEffect } from 'react'
import { Search, Phone, Mail, BookOpen, Users, GraduationCap, Eye, X, User, Calendar } from 'lucide-react'
import { hocSinhAPI } from '@/api/hocSinhApi' 
import { toast } from 'sonner'

export default function DanhSachHocSinh({ user }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // State phân trang Frontend
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  
  // State cho Modal Chi Tiết
  const [detailModal, setDetailModal] = useState({ open: false, data: null })

  useEffect(() => {
    if (user && user.id) fetchStudents()
  }, [user])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await hocSinhAPI.getByGiaSu(user.id)
      if (res.status === 'success') {
        setStudents(res.data || [])
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách học sinh: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset về trang 1 khi tìm kiếm
  }

  // Xử lý đổi trang
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // Tạo avatar từ tên
  const getAvatarInitials = (name) => {
    if (!name) return 'HS'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Tạo màu avatar từ id
  const getAvatarColor = (id) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-cyan-500']
    return colors[id % colors.length]
  }

  // LỌC TÌM KIẾM ĐA NĂNG (OMNI-SEARCH)
  const filteredStudents = students.filter((hs) => {
    const term = search.toLowerCase()
    return (
      (hs.ho_ten || '').toLowerCase().includes(term) ||
      (hs.phu_huynh_ten || '').toLowerCase().includes(term) ||
      (hs.cac_lop_dang_hoc || '').toLowerCase().includes(term) ||
      (hs.khoi_lop?.toString() || '').toLowerCase().includes(term) ||
      (hs.phu_huynh_sdt || '').toLowerCase().includes(term) ||
      (hs.phu_huynh_email || '').toLowerCase().includes(term)
    )
  })

  const totalPages = Math.ceil(filteredStudents.length / pagination.limit) || 1
  const currentStudents = filteredStudents.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-500 mt-4">Đang tải danh sách học sinh...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-12 relative">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <GraduationCap className="text-blue-600" /> Danh sách Học sinh
        </h2>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-4 border border-blue-100">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="🔍 Tìm kiếm tên HS, lớp, khối, tên Phụ huynh, SĐT, Email..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900" 
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Tổng học sinh</p>
            <p className="text-3xl font-bold">{students.length}</p>
          </div>
          <Users size={40} className="opacity-20" />
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Trang hiện tại</p>
            <p className="text-3xl font-bold">{pagination.page}/{totalPages}</p>
          </div>
          <BookOpen size={40} className="opacity-20" />
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Kết quả tìm kiếm</p>
            <p className="text-3xl font-bold">{filteredStudents.length}</p>
          </div>
          <Search size={40} className="opacity-20" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {currentStudents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">📭 Không có dữ liệu học sinh</p>
            <p className="text-gray-400 text-sm mt-2">Không tìm thấy học sinh nào khớp với từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Học Sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lớp Đang Theo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phụ Huynh</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentStudents.map((hs, index) => (
                  <tr key={hs.hoc_sinh_id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`${getAvatarColor(hs.hoc_sinh_id)} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md shrink-0`}>
                          {getAvatarInitials(hs.ho_ten)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{hs.ho_ten}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">Khối: {hs.khoi_lop}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {hs.cac_lop_dang_hoc ? (
                          hs.cac_lop_dang_hoc.split(', ').map((lop, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                              {lop}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">Chưa rõ</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{hs.phu_huynh_ten || <span className="text-gray-400 italic">Chưa cập nhật</span>}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Phone size={12}/> {hs.phu_huynh_sdt || '---'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => setDetailModal({ open: true, data: hs })}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200 tooltip flex items-center gap-1.5 text-sm font-bold shadow-sm"
                          title="Xem thông tin chi tiết"
                        >
                          <Eye size={16} /> Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl shadow-md p-4 gap-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Trang {pagination.page}</span> / {totalPages} 
            <span className="ml-2 text-gray-500">({filteredStudents.length} kết quả)</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              ← Trước
            </button>
            <div className="flex items-center gap-2 px-3">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.page - 2) + i
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL CHI TIẾT HỌC SINH 
      ============================================= */}
      {detailModal.open && detailModal.data && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className={`${getAvatarColor(detailModal.data.hoc_sinh_id)} text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl border-2 border-white/50 shadow-md shrink-0`}>
                  {getAvatarInitials(detailModal.data.ho_ten)}
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight">{detailModal.data.ho_ten}</h3>
                  <p className="text-blue-100 text-sm mt-1">Mã HS: #{detailModal.data.hoc_sinh_id} • Khối {detailModal.data.khoi_lop}</p>
                </div>
              </div>
              <button 
                onClick={() => setDetailModal({ open: false, data: null })} 
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Cột 1: Thông tin Học Sinh */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-500"/> Thông tin Học sinh
                  </h4>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Calendar size={14}/> Ngày sinh</p>
                    <p className="font-bold text-gray-900">
                      {detailModal.data.ngay_sinh ? new Date(detailModal.data.ngay_sinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1"><BookOpen size={14}/> Lớp đang theo học</p>
                    <div className="flex flex-wrap gap-1.5">
                      {detailModal.data.cac_lop_dang_hoc ? (
                        detailModal.data.cac_lop_dang_hoc.split(', ').map((lop, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-2 py-1 rounded shadow-sm">
                            {lop}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 italic">Chưa có lớp</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột 2: Thông tin Phụ Huynh */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Users size={18} className="text-emerald-500"/> Thông tin Phụ huynh
                  </h4>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><User size={14}/> Họ và tên</p>
                    <p className="font-bold text-gray-900">{detailModal.data.phu_huynh_ten || 'Chưa cập nhật'}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Phone size={14}/> Số điện thoại</p>
                    <p className="font-bold text-gray-900">{detailModal.data.phu_huynh_sdt || 'Trống'}</p>
                  </div>

                  {/* Đã sửa lỗi hiển thị Email bị cắt khúc */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Mail size={14}/> Email liên hệ</p>
                    <p className="font-bold text-gray-900 break-all">{detailModal.data.phu_huynh_email || 'Trống'}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setDetailModal({ open: false, data: null })} 
                className="px-6 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 shadow-sm transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}