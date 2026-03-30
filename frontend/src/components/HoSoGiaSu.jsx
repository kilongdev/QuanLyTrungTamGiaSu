import { useState, useEffect } from 'react';
import { giaSuAPI } from '@/api/giaSuApi';
import { toast } from 'sonner'; // THÊM DÒNG NÀY ĐỂ GỌI THƯ VIỆN THÔNG BÁO

export default function HoSoGiaSu({ user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: '', email: '', so_dien_thoai: '', dia_chi: '', 
    ngay_sinh: '', gioi_tinh: '', bang_cap: '', kinh_nghiem: '', 
    gioi_thieu: '', so_tai_khoan_ngan_hang: ''
  });

  useEffect(() => {
    if (user && user.id) fetchMyProfile();
  }, [user]);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const res = await giaSuAPI.getById(user.id);
      if (res.status === 'success' && res.data) {
        setFormData({
          ho_ten: res.data.ho_ten || '',
          email: res.data.email || '',
          so_dien_thoai: res.data.so_dien_thoai || '',
          dia_chi: res.data.dia_chi || '',
          ngay_sinh: res.data.ngay_sinh ? res.data.ngay_sinh.substring(0, 10) : '',
          gioi_tinh: res.data.gioi_tinh || '',
          bang_cap: res.data.bang_cap || '',
          kinh_nghiem: res.data.kinh_nghiem || '',
          gioi_thieu: res.data.gioi_thieu || '',
          so_tai_khoan_ngan_hang: res.data.so_tai_khoan_ngan_hang || ''
        });
      }
    } catch (error) {
      // SỬA ALERT THÀNH TOAST ERROR
      toast.error("Lỗi khi tải thông tin: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await giaSuAPI.update(user.id, formData);
      if (res.status === 'success') {
        // SỬA ALERT THÀNH TOAST SUCCESS
        toast.success("Cập nhật hồ sơ thành công!");
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      // SỬA ALERT THÀNH TOAST ERROR
      toast.error("Lỗi khi lưu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getInitials = (name) => {
    if (!name) return 'GS';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) return <div className="p-10 text-center flex justify-center h-full items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium transition-all outline-none shadow-sm hover:border-gray-400";
  const labelClass = "block text-sm font-bold text-gray-800 mb-2";

  return (
    <div className="w-full pb-12">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden relative">
        
        {/* Banner Gradient Nhẹ Nhàng */}
        <div className="h-40 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100"></div>

        {/* Profile Header */}
        <div className="px-8 sm:px-12 relative -mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="flex items-end gap-6">
            {/* Avatar lồi */}
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-bold">
              {getInitials(formData.ho_ten)}
            </div>
            <div className="mb-2">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{formData.ho_ten || 'Tên Gia Sư'}</h2>
              <p className="text-gray-600 font-medium mt-1">{formData.email}</p>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={saving} 
            className="mb-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...</>
            ) : 'Lưu Hồ Sơ'}
          </button>
        </div>

        {/* Form Fields */}
        <div className="px-8 sm:px-12 pb-12 space-y-10">
          
          {/* Section 1 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <label className={labelClass}>Họ và tên</label>
                <input type="text" name="ho_ten" value={formData.ho_ten} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Email (Cố định)</label>
                <input type="email" value={formData.email} readOnly className={`${inputClass} bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200`} />
              </div>
              <div>
                <label className={labelClass}>Số điện thoại</label>
                <input type="tel" name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ngày sinh</label>
                <input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Giới tính</label>
                <select name="gioi_tinh" value={formData.gioi_tinh} onChange={handleChange} className={inputClass}>
                  <option value="">-- Chọn --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Địa chỉ</label>
                <input type="text" name="dia_chi" value={formData.dia_chi} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Năng lực giảng dạy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <label className={labelClass}>Bằng cấp hiện tại</label>
                <input type="text" name="bang_cap" value={formData.bang_cap} onChange={handleChange} placeholder="VD: Cử nhân ĐH Sư Phạm" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Kinh nghiệm</label>
                <input type="text" name="kinh_nghiem" value={formData.kinh_nghiem} onChange={handleChange} placeholder="VD: 3 năm dạy kèm" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Giới thiệu ngắn về bản thân</label>
                <textarea name="gioi_thieu" value={formData.gioi_thieu} onChange={handleChange} rows="4" className={`${inputClass} resize-none`} placeholder="Hãy viết vài dòng giới thiệu sự nhiệt tình và phương pháp dạy của bạn..."></textarea>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Thông tin nhận lương</h3>
            <div className="w-full md:w-1/2 pr-0 md:pr-5">
              <label className={labelClass}>Số tài khoản ngân hàng</label>
              <input type="text" name="so_tai_khoan_ngan_hang" value={formData.so_tai_khoan_ngan_hang} onChange={handleChange} placeholder="VD: 190366... - Techcombank - Nguyen Van A" className={inputClass} />
              <p className="text-sm text-gray-600 font-medium mt-2">Trung tâm sẽ định kỳ thanh toán lương qua tài khoản này.</p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}