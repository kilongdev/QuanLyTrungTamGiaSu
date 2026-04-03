import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { giaSuAPI } from '@/api/giaSuApi';
import { monHocAPI } from '@/api/monhocApi';
import { giaSuMonHocAPI } from '@/api/giasumonhocApi';
import { toast } from 'sonner'; // THÊM DÒNG NÀY ĐỂ GỌI THƯ VIỆN THÔNG BÁO

export default function HoSoGiaSu({ user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [existingLinks, setExistingLinks] = useState([]);
  const [formData, setFormData] = useState({
    ho_ten: '', email: '', so_dien_thoai: '', dia_chi: '', 
    ngay_sinh: '', gioi_tinh: '', bang_cap: '', kinh_nghiem: '', 
    gioi_thieu: '', so_tai_khoan_ngan_hang: '', ten_ngan_hang: '', mat_khau: ''
  });

  useEffect(() => {
    if (user && user.id) fetchMyProfile();
  }, [user]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await monHocAPI.getAll();
        setSubjects(res?.data || []);
      } catch {
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, []);

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
          so_tai_khoan_ngan_hang: res.data.so_tai_khoan_ngan_hang || '',
          ten_ngan_hang: res.data.ten_ngan_hang || '',
          mat_khau: ''
        });

        const tutorSubjects = Array.isArray(res.data.mon_hoc) ? res.data.mon_hoc : [];
        setSelectedSubjectIds(tutorSubjects.map((item) => String(item.mon_hoc_id)));

        const linkRes = await giaSuMonHocAPI.getAll({ gia_su_id: user.id, limit: 1000 });
        setExistingLinks(linkRes?.data || []);
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
      const password = String(formData.mat_khau || '').trim();
      if (password && !/^(?=.*[A-Za-z])(?=.*\d).{6,100}$/.test(password)) {
        toast.error('Mật khẩu tối thiểu 6 ký tự và phải có cả chữ lẫn số.');
        setSaving(false);
        return;
      }

      const payload = { ...formData };
      if (!password) {
        delete payload.mat_khau;
      }

      const res = await giaSuAPI.update(user.id, payload);
      if (res.status === 'success') {
        const selectedSet = new Set(selectedSubjectIds.map((item) => String(item)));
        const existing = Array.isArray(existingLinks) ? existingLinks : [];

        const toDelete = existing.filter((link) => !selectedSet.has(String(link.mon_hoc_id)));
        const existingSubjectSet = new Set(existing.map((link) => String(link.mon_hoc_id)));
        const toCreate = selectedSubjectIds
          .map((item) => String(item))
          .filter((subjectId) => !existingSubjectSet.has(subjectId));

        await Promise.all(toDelete.map((link) => giaSuMonHocAPI.delete(link.gia_su_mon_hoc_id)));
        await Promise.all(toCreate.map((subjectId) => giaSuMonHocAPI.create({
          gia_su_id: user.id,
          mon_hoc_id: Number(subjectId),
        })));

        const linkRes = await giaSuMonHocAPI.getAll({ gia_su_id: user.id, limit: 1000 });
        setExistingLinks(linkRes?.data || []);
        // SỬA ALERT THÀNH TOAST SUCCESS
        toast.success("Cập nhật hồ sơ thành công!");
        setShowPassword(false);
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
                <label className={labelClass}>Mật khẩu mới (tùy chọn)</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="mat_khau" value={formData.mat_khau || ''} onChange={handleChange} placeholder="Để trống nếu không đổi mật khẩu" className={`${inputClass} pr-10`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                <label className={labelClass}>Môn có thể dạy (chọn nhiều)</label>
                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-1">
                  {subjects.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa tải được danh sách môn học</p>
                  ) : (
                    subjects.map((subject) => {
                      const checked = selectedSubjectIds.includes(String(subject.mon_hoc_id));
                      return (
                        <label key={subject.mon_hoc_id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const id = String(subject.mon_hoc_id);
                              if (e.target.checked) {
                                setSelectedSubjectIds((prev) => [...prev, id]);
                              } else {
                                setSelectedSubjectIds((prev) => prev.filter((item) => item !== id));
                              }
                            }}
                          />
                          <span className="text-sm text-gray-800">{subject.ten_mon_hoc}</span>
                        </label>
                      );
                    })
                  )}
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <label className={labelClass}>Số tài khoản</label>
                <input type="text" name="so_tai_khoan_ngan_hang" value={formData.so_tai_khoan_ngan_hang} onChange={handleChange} placeholder="VD: 190366..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ngân hàng</label>
                <input type="text" name="ten_ngan_hang" value={formData.ten_ngan_hang || ''} onChange={handleChange} placeholder="VD: Techcombank" className={inputClass} />
              </div>
              <p className="md:col-span-2 text-sm text-gray-600 font-medium mt-2">Trung tâm sẽ định kỳ thanh toán lương qua tài khoản này.</p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}