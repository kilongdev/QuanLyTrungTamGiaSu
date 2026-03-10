import { useState, useEffect } from 'react'
import { lopHocAPI } from '../api/lophocApi'
import { monHocAPI } from '../api/monhocApi'
import { giaSuAPI } from '../api/giaSuApi'
import { Plus, Settings, X, Search, Trash2, Edit2 } from 'lucide-react'

export default function LopHocManagement() {
  const [lopHocs, setLopHocs] = useState([])
  const [monHocs, setMonHocs] = useState([])
  const [giaSus, setGiaSus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(null)
  const [formData, setFormData] = useState({
    mon_hoc_id: '',
    gia_su_id: '',
    khoi_lop: '',
    gia_toan_khoa: '',
    so_buoi_hoc: '',
    gia_moi_buoi: '',
    so_luong_toi_da: '1',
    loai_chi_tra: 'phan_tram',
    gia_tri_chi_tra: '',
    trang_thai: 'sap_mo'
  })

  useEffect(() => {
    fetchLopHocs()
    fetchMonHocs()
    fetchGiaSus()
  }, [])

  const fetchLopHocs = async () => {
    try {
      setLoading(true)
      const response = await lopHocAPI.getAll()
      setLopHocs(response.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách lớp học:', error)
      alert(error.message || 'Không thể tải danh sách lớp học')
    } finally {
      setLoading(false)
    }
  }

  const fetchMonHocs = async () => {
    try {
      const response = await monHocAPI.getAll()
      setMonHocs(response.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách môn học:', error)
    }
  }

  const fetchGiaSus = async () => {
    try {
      const response = await giaSuAPI.getAll()
      setGiaSus(response.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách gia sư:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.mon_hoc_id) {
      alert('Vui lòng chọn môn học')
      return
    }

    try {
      if (editingId) {
        await lopHocAPI.update(editingId, formData)
        alert('Cập nhật lớp học thành công!')
      } else {
        await lopHocAPI.create(formData)
        alert('Thêm lớp học thành công!')
      }
      
      setShowModal(false)
      resetForm()
      fetchLopHocs()
    } catch (error) {
      console.error('Lỗi khi lưu lớp học:', error)
      alert(error.message || 'Có lỗi xảy ra khi lưu lớp học')
    }
  }

  const handleEdit = (lopHoc) => {
    setEditingId(lopHoc.lop_hoc_id)
    setFormData({
      mon_hoc_id: lopHoc.mon_hoc_id || '',
      gia_su_id: lopHoc.gia_su_id || '',
      khoi_lop: lopHoc.khoi_lop || '',
      gia_toan_khoa: lopHoc.gia_toan_khoa || '',
      so_buoi_hoc: lopHoc.so_buoi_hoc || '',
      gia_moi_buoi: lopHoc.gia_moi_buoi || '',
      so_luong_toi_da: lopHoc.so_luong_toi_da || '1',
      loai_chi_tra: lopHoc.loai_chi_tra || 'phan_tram',
      gia_tri_chi_tra: lopHoc.gia_tri_chi_tra || '',
      trang_thai: lopHoc.trang_thai || 'sap_mo'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      return
    }

    try {
      await lopHocAPI.delete(id)
      alert('Xóa lớp học thành công!')
      fetchLopHocs()
    } catch (error) {
      console.error('Lỗi khi xóa lớp học:', error)
      alert(error.message || 'Không thể xóa lớp học này')
    }
  }

  const resetForm = () => {
    setFormData({
      mon_hoc_id: '',
      gia_su_id: '',
      khoi_lop: '',
      gia_toan_khoa: '',
      so_buoi_hoc: '',
      loai_chi_tra: 'phan_tram',
      gia_tri_chi_tra: '',
      gia_moi_buoi: '',
      so_luong_toi_da: '1',
      trang_thai: 'sap_mo'
    })
    setEditingId(null)
  }

  const handleOpenModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getMonHocName = (monHocId) => {
    const monHoc = monHocs.find(m => m.mon_hoc_id == monHocId)
    return monHoc ? monHoc.ten_mon_hoc : 'N/A'
  }

  const getGiaSuName = (giaSuId) => {
    const giaSu = giaSus.find(g => g.gia_su_id == giaSuId)
    return giaSu ? giaSu.ho_ten : 'N/A'
  }

  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      'sap_mo': 'Sắp mở',
      'dang_hoc': 'Đang học',
      'ket_thuc': 'Kết thúc',
      'dong': 'Đóng'
    }
    return labels[trangThai] || trangThai
  }

  const getTrangThaiColor = (trangThai) => {
    const colors = {
      'sap_mo': 'bg-blue-100 text-blue-700',
      'dang_hoc': 'bg-green-100 text-green-700',
      'ket_thuc': 'bg-yellow-100 text-yellow-700',
      'dong': 'bg-red-100 text-red-700'
    }
    return colors[trangThai] || 'bg-gray-100 text-gray-700'
  }

  const filteredLopHocs = lopHocs.filter(lh => 
    lh.khoi_lop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getMonHocName(lh.mon_hoc_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    lh.lop_hoc_id?.toString().includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý lớp học</h2>
          <p className="text-sm text-gray-500">Tổng số: {lopHocs.length} lớp học</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm lớp học
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm theo khối lớp, môn học hoặc ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Card Grid */}
      {filteredLopHocs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'Không tìm thấy lớp học nào' : 'Chưa có lớp học nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLopHocs.map((lopHoc) => (
            <div key={lopHoc.lop_hoc_id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow relative group">
              {/* Settings Button */}
              <div className="absolute top-2 right-2">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSettings(showSettings === lopHoc.lop_hoc_id ? null : lopHoc.lop_hoc_id)
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Cài đặt"
                  >
                    <Settings size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {showSettings === lopHoc.lop_hoc_id && (
                    <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                      <button
                        onClick={() => {
                          handleEdit(lopHoc)
                          setShowSettings(null)
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100"
                      >
                        <Edit2 size={12} />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(lopHoc.lop_hoc_id)
                          setShowSettings(null)
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={12} />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-3">
                {/* Title - Khối lớp */}
                <h3 className="font-semibold text-gray-800 text-base mb-1 pr-6 line-clamp-2">
                  Lớp {lopHoc.khoi_lop || 'N/A'} - {getMonHocName(lopHoc.mon_hoc_id)}
                </h3>

                {/* Giáo viên */}
                {lopHoc.gia_su_id && (
                  <div className="text-sm text-gray-600 mb-1">
                    GV: {getGiaSuName(lopHoc.gia_su_id)}
                  </div>
                )}

                {/* Grid Info */}
                <div className="space-y-1 mb-2">
                  {/* Số buổi học */}
                  {lopHoc.so_buoi_hoc && (
                    <div className="text-sm text-gray-600">
                      {lopHoc.so_buoi_hoc} buổi/khóa
                    </div>
                  )}

                  {/* Học phí */}
                  {lopHoc.gia_toan_khoa && (
                    <div className="font-semibold text-gray-900 text-sm">
                      {parseInt(lopHoc.gia_toan_khoa).toLocaleString('vi-VN')}đ/khóa
                    </div>
                  )}

                  {/* Giá mỗi buổi */}
                  {lopHoc.gia_moi_buoi && (
                    <div className="text-sm text-gray-600">
                      {parseInt(lopHoc.gia_moi_buoi).toLocaleString('vi-VN')}đ/buổi
                    </div>
                  )}

                  {/* Sĩ số */}
                  {lopHoc.so_luong_toi_da && (
                    <div className="text-sm text-gray-600">
                      Tối đa {lopHoc.so_luong_toi_da} học sinh
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex justify-center pt-2 border-t border-gray-100">
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTrangThaiColor(lopHoc.trang_thai)}`}>
                    {getTrangThaiLabel(lopHoc.trang_thai)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.mon_hoc_id}
                  onChange={(e) => setFormData({ ...formData, mon_hoc_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Chọn môn học --</option>
                  {monHocs.map((mh) => (
                    <option key={mh.mon_hoc_id} value={mh.mon_hoc_id}>
                      {mh.ten_mon_hoc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khối lớp
                </label>
                <input
                  type="text"
                  value={formData.khoi_lop}
                  onChange={(e) => setFormData({ ...formData, khoi_lop: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: 6, 7, 8, 9..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giáo viên (Gia sư)
                </label>
                <select
                  value={formData.gia_su_id}
                  onChange={(e) => setFormData({ ...formData, gia_su_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn giáo viên --</option>
                  {giaSus.map((gs) => (
                    <option key={gs.gia_su_id} value={gs.gia_su_id}>
                      {gs.ho_ten}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Học phí toàn khóa (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.gia_toan_khoa}
                  onChange={(e) => setFormData({ ...formData, gia_toan_khoa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3000000"
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số buổi học
                  </label>
                  <input
                    type="number"
                    value={formData.so_buoi_hoc}
                    onChange={(e) => setFormData({ ...formData, so_buoi_hoc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="20"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá mỗi buổi (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.gia_moi_buoi}
                    onChange={(e) => setFormData({ ...formData, gia_moi_buoi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="150000"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sĩ số tối đa
                </label>
                <input
                  type="number"
                  value={formData.so_luong_toi_da}
                  onChange={(e) => setFormData({ ...formData, so_luong_toi_da: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                  min="1"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">Chia phí gia sư</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại chi trả
                    </label>
                    <select
                      value={formData.loai_chi_tra}
                      onChange={(e) => setFormData({ ...formData, loai_chi_tra: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="phan_tram">Phần trăm (%)</option>
                      <option value="tien_cu_the">Tiền cụ thể</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị {formData.loai_chi_tra === 'phan_tram' ? '(%)' : '(VNĐ)'}
                    </label>
                    <input
                      type="number"
                      value={formData.gia_tri_chi_tra}
                      onChange={(e) => setFormData({ ...formData, gia_tri_chi_tra: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={formData.loai_chi_tra === 'phan_tram' ? '70' : '1500000'}
                      min="0"
                      step={formData.loai_chi_tra === 'phan_tram' ? '1' : '1000'}
                      max={formData.loai_chi_tra === 'phan_tram' ? '100' : undefined}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.trang_thai}
                  onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sap_mo">Sắp mở</option>
                  <option value="dang_hoc">Đang học</option>
                  <option value="ket_thuc">Kết thúc</option>
                  <option value="dong">Đóng</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
