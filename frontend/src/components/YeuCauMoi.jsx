import React, { useState, useEffect } from "react";
import { Briefcase, DollarSign, Clock, GraduationCap, CheckCircle, XCircle, Info, Calendar } from "lucide-react";
import { yeuCauAPI } from "@/api/yeucauApi"; 
import { toast } from "sonner";

export default function YeuCauMoi({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal Xác nhận
  const [confirmModal, setConfirmModal] = useState({ open: false, type: "", data: null });

  useEffect(() => {
    if (user && user.id) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await yeuCauAPI.getYeuCauMoi(user.id);
      if (res.status === "success") {
        setRequests(res.data || []);
      }
    } catch (error) {
      toast.error("Lỗi khi tải yêu cầu mới: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0đ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const handleResponse = async (id, statusType) => {
    try {
      const payload = {
        trang_thai: statusType,
        nguoi_xu_ly_id: user.id,
        ghi_chu_xu_ly: statusType === "da_duyet" ? "Gia sư đã chấp nhận nhận lớp." : "Gia sư đã từ chối nhận lớp."
      };
      
      const res = await yeuCauAPI.updateStatus(id, payload);
      if (res.status === "success") {
        toast.success(statusType === "da_duyet" ? "Nhận lớp thành công! Lớp đã được thêm vào danh sách của bạn." : "Đã từ chối yêu cầu.");
        setConfirmModal({ open: false, type: "", data: null });
        fetchRequests(); // Tải lại danh sách
      }
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-full pb-12">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Briefcase className="text-blue-600" size={28} /> Yêu cầu Nhận lớp
        </h2>
        <p className="text-gray-500 mt-2">Danh sách các lớp học Trung tâm đề xuất cho bạn. Vui lòng phản hồi sớm!</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-blue-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Chưa có yêu cầu mới</h3>
          <p className="text-gray-500 mt-2">Hiện tại không có lời mời nhận lớp nào. Bạn có thể kiểm tra lại sau nhé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div key={req.yeu_cau_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative">
              {/* Badge Mới */}
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm z-10 animate-pulse">
                NEW
              </div>

              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0 mt-1">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{req.tieu_de}</h3>
                    <p className="text-sm font-medium text-blue-700 mt-1">{req.ten_lop || `Lớp #${req.lop_hoc_id}`}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar size={12}/> Đã gửi: {new Date(req.ngay_tao).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2"><Info size={14}/> Lời nhắn từ Admin:</p>
                  <p className="text-sm text-gray-800 font-medium italic">"{req.noi_dung}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600 shrink-0"><DollarSign size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Thu nhập (dự kiến)</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {req.loai_chi_tra === 'theo_buoi' ? formatCurrency(req.gia_moi_buoi) + '/buổi' : formatCurrency(req.gia_toan_khoa) + '/khóa'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 shrink-0"><Clock size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Thời lượng</p>
                      <p className="font-bold text-gray-900 text-sm">{req.so_buoi_hoc} buổi</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => setConfirmModal({ open: true, type: "tu_choi", data: req })}
                  className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 transition"
                >
                  <XCircle size={18} /> Từ chối
                </button>
                <button 
                  onClick={() => setConfirmModal({ open: true, type: "da_duyet", data: req })}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle size={18} /> Nhận lớp này
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'da_duyet' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
              {confirmModal.type === 'da_duyet' ? <CheckCircle size={32} /> : <XCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {confirmModal.type === 'da_duyet' ? 'Xác nhận Nhận lớp?' : 'Từ chối Nhận lớp?'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {confirmModal.type === 'da_duyet' 
                ? 'Lớp học này sẽ được thêm vào danh sách quản lý của bạn.' 
                : 'Bạn sẽ bỏ qua lớp học này, hệ thống sẽ thông báo lại cho Admin.'}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ open: false, type: "", data: null })}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleResponse(confirmModal.data.yeu_cau_id, confirmModal.type)}
                className={`flex-1 py-2.5 text-white font-bold rounded-xl transition shadow-md ${confirmModal.type === 'da_duyet' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}