import { useState, useEffect } from 'react';
import { BookOpen, Calendar as CalendarIcon, Users, DollarSign, Clock, GraduationCap, X, Search, FileText } from 'lucide-react';
import { lopHocAPI } from '@/api/lophocApi';
import { toast } from 'sonner';

export default function LopDangDay({ user }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeTab, setActiveTab] = useState('info'); 
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

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

  // Hàm gọi API lấy danh sách học sinh của lớp đó
  const fetchClassStudents = async (classId) => {
    try {
      setLoadingStudents(true);
      const res = await lopHocAPI.getStudentsByClass(classId);
      if (res.status === 'success') {
        setStudents(res.data || []);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách học sinh');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Hàm mở Modal và load dữ liệu
  const handleOpenClassDetails = (cls) => {
    setSelectedClass(cls);
    setActiveTab('info');
    fetchClassStudents(cls.lop_hoc_id);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    return new Date(dateStr).toLocaleDateString('vi-VN');
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

  const filteredClasses = classes.filter((cls) => {
    const searchLower = searchTerm.toLowerCase();
    const tenLopHienThi = (cls.ten_lop || `${cls.ten_mon_hoc} - Lớp ${cls.khoi_lop}`).toLowerCase();
    const tenMon = (cls.ten_mon_hoc || '').toLowerCase();
    const khoiLop = (cls.khoi_lop ? String(cls.khoi_lop) : '').toLowerCase();

    return tenLopHienThi.includes(searchLower) || 
           tenMon.includes(searchLower) || 
           khoiLop === searchLower; 
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
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-900 leading-tight mb-1">
                    {cls.ten_lop || `${cls.ten_mon_hoc} - Lớp ${cls.khoi_lop}`}
                  </h3>
                  <p className="text-blue-600 text-sm font-medium flex items-center gap-1">
                    <GraduationCap size={16} /> Môn: {cls.ten_mon_hoc} | Khối: {cls.khoi_lop}
                  </p>
                </div>
                <div>{getStatusBadge(cls.trang_thai)}</div>
              </div>

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
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Lịch học</p>
                      <p className="font-bold text-gray-900 text-sm">{cls.lich_hoc_du_kien || 'Chưa xếp lịch'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end mt-auto">
                 <button 
                   onClick={() => handleOpenClassDetails(cls)}
                   className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm hover:text-blue-600 hover:border-blue-400"
                 >
                   Xem chi tiết & Học sinh
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL XEM CHI TIẾT */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-2xl font-bold mb-1">
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

            {/* TAB ĐIỀU HƯỚNG */}
            <div className="flex border-b border-gray-200 bg-gray-50 shrink-0 px-6">
              <button 
                onClick={() => setActiveTab('info')} 
                className={`py-3 mr-6 font-semibold text-sm transition-colors ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Thông tin chung
              </button>
              <button 
                onClick={() => setActiveTab('students')} 
                className={`py-3 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === 'students' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Danh sách Học sinh 
                <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">{selectedClass.so_luong_hien_tai}</span>
              </button>
            </div>

            {/* Modal Body - NỘI DUNG THEO TAB */}
            <div className="p-6 overflow-y-auto">
              
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột 1 */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><BookOpen size={18} className="text-blue-500"/> Cơ bản</h4>
                    <div>
                      <p className="text-sm text-gray-500">Mã lớp</p>
                      <p className="font-semibold text-gray-900">#{selectedClass.lop_hoc_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <div className="mt-1">{getStatusBadge(selectedClass.trang_thai)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số buổi học</p>
                      <p className="font-semibold text-gray-900">{selectedClass.so_buoi_hoc} buổi</p>
                    </div>
                  </div>

                  {/* Cột 2 */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><CalendarIcon size={18} className="text-green-500"/> Lịch & Thời gian</h4>
                    <div>
                      <p className="text-sm text-gray-500">Lịch học chi tiết</p>
                      <p className="font-semibold text-gray-900 bg-gray-50 p-2 rounded border mt-1">
                        {selectedClass.lich_hoc_du_kien || 'Chưa có lịch cụ thể'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                        <p className="font-semibold text-gray-900">{formatDate(selectedClass.ngay_bat_dau)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày kết thúc</p>
                        <p className="font-semibold text-gray-900">{formatDate(selectedClass.ngay_ket_thuc)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div>
                  {loadingStudents ? (
                    <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <Users className="mx-auto text-gray-400 mb-2" size={32}/>
                      <p className="text-gray-500 font-medium">Lớp này chưa có học sinh nào.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                              {student.ho_ten ? student.ho_ten.charAt(0).toUpperCase() : 'H'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{student.ho_ten}</p>
                              <p className="text-xs text-gray-500">Mã HS: #{student.hoc_sinh_id}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full border border-green-100">Đang học</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t flex justify-end shrink-0">
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