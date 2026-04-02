import { useState, useEffect } from "react";
import { Wallet, CreditCard, Clock, CheckCircle, AlertCircle, ChevronRight, User, Loader2 } from "lucide-react";
import { phuHuynhAPI } from "../api/phuHuynhApi";
import { cn } from "@/lib/utils";

export default function HocPhiPhuHuynh() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tuitionData, setTuitionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await phuHuynhAPI.getMyStudents();
      setStudents(res.data || []);
      if (res.data && res.data.length > 0) {
        handleSelectStudent(res.data[0]);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách học sinh:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      // Gọi API chi tiết học sinh của phụ huynh để lấy lịch sử học phí
      // Gọi API chi tiết con (đã bao gồm hoc_phi_lich_su như bạn đã xác nhận)
      const res = await phuHuynhAPI.getChildDetails(student.hoc_sinh_id);
      
      // Dữ liệu trả về từ PhuHuynhController::getChildDetails nằm trong res.data
      setTuitionData(res.data?.hoc_phi_lich_su || []);
    } catch (error) {
      console.error("Lỗi lấy học phí:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "da_thanh_toan":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cho_xac_nhan":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "qua_han":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    if (status === "da_thanh_toan") return "Đã thanh toán";
    if (status === "cho_xac_nhan") return "Chờ xác nhận";
    if (status === "qua_han") return "Quá hạn";
    return "Chưa thanh toán";
  };

  const summary = tuitionData.reduce((acc, hp) => {
    const amount = Number(hp.so_tien);
    if (hp.trang_thai_thanh_toan !== 'da_thanh_toan') {
        acc.unpaid += amount;
        acc.unpaidCount += 1;
    } else {
        acc.paid += amount;
        acc.paidCount += 1;
    }
    return acc;
  }, { unpaid: 0, paid: 0, unpaidCount: 0, paidCount: 0 });

  // Component Card cho mỗi khoản phí
  function FeeCard({ fee }) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 animate-in fade-in-50">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          {/* Left side: Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-lg text-gray-900">{fee.ten_lop}</h4>
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusStyle(fee.trang_thai_thanh_toan))}>
                {getStatusText(fee.trang_thai_thanh_toan)}
              </span>
            </div>
            <p className="text-sm text-gray-500">{fee.ten_mon_hoc}</p>
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              Hạn đóng: {fee.ngay_den_han ? new Date(fee.ngay_den_han).toLocaleDateString("vi-VN") : "---"}
            </div>
          </div>
          {/* Right side: Amount and Action */}
          <div className="flex-shrink-0 text-right sm:ml-4">
            <p className="font-bold text-red-600 text-2xl">{Number(fee.so_tien).toLocaleString("vi-VN")} đ</p>
            {fee.trang_thai_thanh_toan !== "da_thanh_toan" && (
              <button className="mt-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2 px-4 transition-colors shadow-md shadow-blue-100">
                Thanh toán
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-md">
            <Wallet className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Học phí
            </h1>
            <p className="text-gray-600 mt-1">Theo dõi và thanh toán học phí cho các con của bạn.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Danh sách con */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-gray-700 px-1">Danh sách con</h3>
          {students.map((hs) => (
            <button
              key={hs.hoc_sinh_id}
              onClick={() => handleSelectStudent(hs)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                selectedStudent?.hoc_sinh_id === hs.hoc_sinh_id
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                  : "bg-white border-gray-100 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", selectedStudent?.hoc_sinh_id === hs.hoc_sinh_id ? "bg-blue-500" : "bg-gray-100")}>
                  <User size={18} />
                </div>
                <span className="font-medium text-sm">{hs.ho_ten}</span>
              </div>
              <ChevronRight size={16} opacity={0.5} />
            </button>
          ))}
        </div>

        {/* Nội dung học phí */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-xl">
              Học phí của bé: <span className="text-blue-600">{selectedStudent?.ho_ten || "..."}</span>
            </h3>
          </div>

          {/* Summary Cards */}
          { !loading && tuitionData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50">
              <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
                  <p className="text-sm font-medium text-red-800">Tổng tiền cần thanh toán</p>
                  <p className="text-3xl font-bold text-red-700 mt-1">{summary.unpaid.toLocaleString('vi-VN')} đ</p>
                  <p className="text-xs text-red-600 mt-1">{summary.unpaidCount} khoản chưa đóng</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
                  <p className="text-sm font-medium text-emerald-800">Tổng tiền đã thanh toán</p>
                  <p className="text-3xl font-bold text-emerald-700 mt-1">{summary.paid.toLocaleString('vi-VN')} đ</p>
                  <p className="text-xs text-emerald-600 mt-1">{summary.paidCount} khoản đã đóng</p>
              </div>
            </div>
          )}

          {/* Fee List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-lg pt-2">Chi tiết các khoản phí</h4>
            {loading ? (
              <div className="p-10 text-center text-gray-400 bg-white rounded-2xl shadow-sm border flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                Đang tải dữ liệu...
              </div>
            ) : tuitionData.length === 0 ? (
              <div className="p-10 text-center space-y-3 bg-white rounded-2xl shadow-sm border min-h-[200px] flex flex-col items-center justify-center">
                <CreditCard size={48} className="mx-auto text-gray-200" />
                <p className="text-gray-500">Bé hiện chưa có thông tin học phí.</p>
              </div>
            ) : (
              tuitionData.map((hp) => (
                <FeeCard key={hp.hoc_phi_id} fee={hp} />
              ))
            )}
          </div>

          {/* Gợi ý chuyển khoản */}
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <AlertCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Hướng dẫn thanh toán</h4>
              <p className="text-sm text-blue-700 mt-1">
                Phụ huynh vui lòng chuyển khoản qua ngân hàng với nội dung:
                <span className="font-bold bg-blue-100 px-2 py-0.5 rounded mx-1">
                  {selectedStudent ? `HP${selectedStudent.hoc_sinh_id} ${selectedStudent.ho_ten.toUpperCase()}` : "[MaHS] [TenHocSinh]"}
                </span>. 
                Sau khi chuyển khoản, hệ thống sẽ tự động cập nhật trạng thái sau khi Admin xác nhận.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}