import { useState, useEffect } from 'react';
import { BookOpen, Calendar as CalendarIcon, Users, DollarSign, Clock, MapPin, GraduationCap, X, Search } from 'lucide-react';
import { lopHocAPI } from '@/api/lophocApi';
import { toast } from 'sonner';

export default function LopDangDay({ user }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // STATE MỚI: Lưu trữ từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchMyClasses();
    }
  }, [user]);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const res = await lopHocAPI.getByGiaSu(user.id);
      if (res.status === 'success') {
        setClasses(res.data || []);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách lớp: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'dang_hoc':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Đang dạy</span>;
      case 'sap_mo':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Sắp khai giảng</span>;
      case 'da_ket_thuc':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">Đã kết thúc</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // LỌC DANH SÁCH LỚP DỰA TRÊN TỪ KHÓA TÌM KIẾM (Đã nâng cấp)
  const filteredClasses = classes.filter((cls) => {
    const searchLower = searchTerm.toLowerCase();
    
    // 1. Lấy đúng cái tên đang hiển thị trên UI (bao gồm cả trường hợp tên ghép)
    const tenLopHienThi = (cls.ten_lop || `${cls.ten_mon_hoc} - Lớp ${cls.khoi_lop}`).toLowerCase();
    
    // 2. Lấy thêm các thông tin phụ để tìm kiếm cho rộng
    const tenMon = (cls.ten_mon_hoc || '').toLowerCase();
    const khoiLop = (cls.khoi_lop ? String(cls.khoi_lop) : '').toLowerCase();

    // 3. Trả về true nếu từ khóa nằm trong BẤT KỲ thông tin nào ở trên
    return tenLopHienThi.includes(searchLower) || 
           tenMon.includes(searchLower) || 
           khoiLop === searchLower; // Gõ đúng số "6" cũng ra
  });

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-full pb-12">
      {/* Header & Thanh tìm kiếm */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="text-blue-600" size={28} /> Danh sách Lớp phụ trách
          </h2>
          <p className="text-gray-500 mt-2">Theo dõi và quản lý thông tin các lớp học của bạn</p>
        </div>
        
        {/* THANH TÌM KIẾM MỚI */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên lớp, môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-colors outline-none"
          />
        </div>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Không tìm thấy lớp học nào</h3>
          <p className="text-gray-500 mt-2">Thử thay đổi từ khóa tìm kiếm hoặc hiện tại bạn chưa được phân công lớp nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.lop_hoc_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100 flex justify-between items-start gap-4">
                <div>
                  {/* SỬA LỖI: Thêm fallback dự phòng nếu ten_lop bị rỗng */}
                  <h3 className="text-lg font-bold text-blue-900 leading-tight mb-1">
                    {cls.ten_lop || `${cls.ten_mon_hoc} - Lớp ${cls.khoi_lop}`}
                  </h3>
                  <p className="text-blue-600 text-sm font-medium flex items-center gap-1">
                    <GraduationCap size={16} /> Môn: {cls.ten_mon_hoc} | Khối: {cls.khoi_lop}
                  </p>
                </div>
                <div>{getStatusBadge(cls.trang_thai)}</div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><DollarSign size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Học phí</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {cls.loai_chi_tra === 'theo_buoi' ? formatCurrency(cls.gia_moi_buoi) + '/buổi' : formatCurrency(cls.gia_toan_khoa) + '/khóa'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Users size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Sĩ số</p>
                      <p className="font-bold text-gray-900 text-sm">{cls.so_luong_hien_tai} / {cls.so_luong_toi_da} học sinh</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 col-span-2">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600"><Clock size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Lịch dự kiến</p>
                      <p className="font-bold text-gray-900 text-sm">{cls.lich_hoc_du_kien || 'Chưa xếp lịch'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end mt-auto">
                 <button 
                   onClick={() => setSelectedClass(cls)}
                   className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm hover:text-blue-600 hover:border-blue-400"
                 >
                   Xem chi tiết lớp
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL XEM CHI TIẾT LỚP (Giữ nguyên như cũ) */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {/* Cập nhật luôn fallback cho tiêu đề Modal */}
                  {selectedClass.ten_lop || `${selectedClass.ten_mon_hoc} - Lớp ${selectedClass.khoi_lop}`}
                </h3>
                <div className="flex items-center gap-3 text-blue-100 text-sm">
                  <span className="flex items-center gap-1"><GraduationCap size={16}/> {selectedClass.ten_mon_hoc}</span>
                  <span>•</span>
                  <span>Khối {selectedClass.khoi_lop}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClass(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột 1: Thông tin khóa học */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><BookOpen size={18} className="text-blue-500"/> Thông tin chung</h4>
                  
                  <div>
                    <p className="text-sm text-gray-500">Mã lớp</p>
                    <p className="font-semibold text-gray-900">#{selectedClass.lop_hoc_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <div className="mt-1">{getStatusBadge(selectedClass.trang_thai)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-semibold text-gray-900">{selectedClass.ngay_tao ? new Date(selectedClass.ngay_tao).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số buổi học</p>
                    <p className="font-semibold text-gray-900">{selectedClass.so_buoi_hoc} buổi</p>
                  </div>
                </div>

                {/* Cột 2: Thông tin tài chính & Lịch */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><DollarSign size={18} className="text-green-500"/> Tài chính & Lịch</h4>
                  
                  <div>
                    <p className="text-sm text-gray-500">Học phí (Thu phụ huynh)</p>
                    <p className="font-bold text-blue-600">
                      {selectedClass.loai_chi_tra === 'theo_buoi' ? formatCurrency(selectedClass.gia_moi_buoi) + '/buổi' : formatCurrency(selectedClass.gia_toan_khoa) + '/khóa'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hình thức thanh toán</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClass.chu_ky_thanh_toan === 'theo_thang' ? 'Thanh toán theo tháng' : 'Thanh toán toàn khóa'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sĩ số</p>
                    <p className="font-semibold text-gray-900">{selectedClass.so_luong_hien_tai} / {selectedClass.so_luong_toi_da} học sinh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lịch học chi tiết</p>
                    <p className="font-semibold text-gray-900 bg-gray-50 p-2 rounded border mt-1">
                      {selectedClass.lich_hoc_du_kien || 'Chưa có lịch cụ thể'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t flex justify-end">
              <button 
                onClick={() => setSelectedClass(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}