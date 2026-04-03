import React, { useState, useEffect } from 'react'
import { Search, Phone, Mail, BookOpen, Users, Eye, X, User, Calendar, GraduationCap } from 'lucide-react'
import { hocSinhAPI } from '@/api/hocSinhApi' 
import { toast } from 'sonner'
import DataPagination from '@/components/ui/DataPagination' // Import component phân trang của Admin

export default function DanhSachHocSinh({ user }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // State phân trang Frontend
  const [pagination, setPagination] = useState({ page: 1 })
  const [pageSize, setPageSize] = useState(10) // Thêm state quản lý số item/trang giống Admin
  
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
    setPagination({ page: 1 }) // Reset về trang 1 khi tìm kiếm
  }

  // Xử lý đổi trang
  const handlePageChange = (newPage) => {
    setPagination({ page: newPage })
  }

  // Xử lý đổi số lượng hiển thị (Page Size)
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setPagination({ page: 1 }) // Reset về trang 1 khi đổi size
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

  // Helper để định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
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

  // Tính toán phân trang với pageSize mới
  const totalItems = filteredStudents.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const currentStudents = filteredStudents.slice(
    (pagination.page - 1) * pageSize,
    pagination.page * pageSize
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 mt-4">Đang tải danh sách học sinh...</p>
      </div>
    )
  }

  return (
    <div className="pb-12 relative">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Danh sách Học Sinh</h2>
            <p className="text-gray-500 text-sm mt-1">Danh sách học sinh đang theo học các lớp bạn giảng dạy</p>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm tên HS, lớp, khối, tên Phụ huynh, SĐT, Email..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:outline-none text-sm text-gray-900"
              />
            </div>
            <div className="hidden md:block h-10 w-px bg-gray-200" />
            <div className="px-5 py-2.5 text-sm text-gray-500 flex items-center gap-2 bg-white/50">
              <Users size={16} className="text-blue-600" /> Tổng: <span className="font-bold text-gray-900">{totalItems}</span> kết quả
            </div>
          </div>
        </div>

        {/* Bảng Dữ liệu */}
        {currentStudents.length === 0 ? (
          <div className="p-16 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">Không có dữ liệu học sinh</p>
            <p className="text-gray-400 text-sm mt-2">Không tìm thấy học sinh nào khớp với từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-b border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Học Sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lớp Đang Theo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phụ Huynh</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentStudents.map((hs, index) => (
                  <tr key={hs.hoc_sinh_id} className="hover:bg-blue-50/40 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-500">
                        {(pagination.page - 1) * pageSize + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`${getAvatarColor(hs.hoc_sinh_id)} text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                          {getAvatarInitials(hs.ho_ten)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{hs.ho_ten}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Khối: {hs.khoi_lop}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {hs.cac_lop_dang_hoc ? (
                          hs.cac_lop_dang_hoc.split(', ').map((lop, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                              {lop}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">Chưa rõ</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{hs.phu_huynh_ten || <span className="text-gray-400 italic">Chưa cập nhật</span>}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={10}/> {hs.phu_huynh_sdt || '---'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => setDetailModal({ open: true, data: hs })}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================
            COMPONENT PHÂN TRANG CỦA ADMIN 
        ============================================= */}
        <DataPagination
          page={pagination.page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="học sinh"
        />
      </div>

      {/* MODAL CHI TIẾT HỌC SINH */}
      {detailModal.open && detailModal.data && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-blue-800 text-white p-5 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`${getAvatarColor(detailModal.data.hoc_sinh_id)} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white/30 shadow-sm shrink-0`}>
                  {getAvatarInitials(detailModal.data.ho_ten)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{detailModal.data.ho_ten}</h3>
                  <p className="text-blue-200 text-sm mt-0.5">Mã HS: #{detailModal.data.hoc_sinh_id} • Khối: {detailModal.data.khoi_lop || 'N/A'}</p>
                </div>
              </div>
              <button 
                onClick={() => setDetailModal({ open: false, data: null })}
                className="text-white/80 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto bg-white">
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} className="text-blue-600"/> Thông tin Cá nhân
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-gray-500 mb-1">Ngày sinh</p>
                    <p className="font-semibold text-gray-900">{formatDate(detailModal.data.ngay_sinh)}</p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                    <p className="text-gray-500 mb-1">Lớp đang theo học</p>
                    <p className="font-semibold text-blue-800 line-clamp-2">
                      {detailModal.data.cac_lop_dang_hoc || 'Chưa có lớp'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-emerald-600"/> Liên hệ Phụ huynh
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-gray-500 mb-1">Họ tên Phụ huynh</p>
                    <p className="font-semibold text-gray-900">{detailModal.data.phu_huynh_ten || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-gray-500 mb-1">Số điện thoại</p>
                    <p className="font-semibold text-gray-900">{detailModal.data.phu_huynh_sdt || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:col-span-2">
                    <p className="text-gray-500 mb-1">Email liên hệ</p>
                    <p className="font-semibold text-gray-900 break-all">{detailModal.data.phu_huynh_email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setDetailModal({ open: false, data: null })} 
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}