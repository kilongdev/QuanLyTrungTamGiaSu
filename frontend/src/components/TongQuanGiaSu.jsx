import { useState, useEffect } from 'react';
import { giaSuAPI } from '@/api/giaSuApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function TongQuanGiaSu({ user, onNavigate }) {
  const [data, setData] = useState({
    total_lop: 0,
    total_hoc_sinh: 0,
    avg_rating: 0,
    total_yeu_cau_moi: 0,
    thu_nhap_thang_nay: 0,
    thu_nhap_cho: 0,
    lich_hom_nay: [],
    thu_nhap_chart: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const giaSuId = user?.id || user?.gia_su_id;
      if (!giaSuId) return; 
      
      try {
        setLoading(true);
        const response = await giaSuAPI.getDashboard(giaSuId);
        if (response.status === 'success') {
          setData(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Format tiền tệ chuẩn VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  // Rút gọn tiền cho biểu đồ (VD: 2.000.000 -> 2M)
  const formatCompact = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value;
  };

  // Xử lý dữ liệu biểu đồ: Đảo ngược mảng để tháng cũ đứng trước, tháng mới đứng sau
  const chartData = (data.thu_nhap_chart || [])
    .map(item => ({
      name: `T${item.thang}/${item.nam.toString().slice(-2)}`, // Hiển thị: T10/24
      total: Number(item.total)
    }))
    .reverse(); 

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. KHỐI THỐNG KÊ NHANH (Bấm được) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="📚" 
          iconBg="bg-blue-100 text-blue-600" 
          value={data.total_lop} 
          label="Lớp đang dạy" 
          actionText="Xem danh sách"
          onClick={() => onNavigate('classes')}
        />
        <StatCard 
          icon="👨‍🎓" 
          iconBg="bg-green-100 text-green-600" 
          value={data.total_hoc_sinh} 
          label="Tổng học sinh" 
          actionText="Quản lý học sinh"
          onClick={() => onNavigate('students')}
        />
        <StatCard 
          icon="💰" 
          iconBg="bg-purple-100 text-purple-600" 
          value={formatCurrency(data.thu_nhap_cho)} 
          label="Đang chờ thanh toán" 
          actionText="Chi tiết thu nhập"
          onClick={() => onNavigate('income')}
        />
        <StatCard 
          icon="⭐" 
          iconBg="bg-yellow-100 text-yellow-600" 
          value={Number(data.avg_rating).toFixed(1)} 
          label="Đánh giá trung bình" 
          actionText="Xem hồ sơ"
          onClick={() => onNavigate('profile')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 2. BIỂU ĐỒ THU NHẬP (Chiếm 2/3 không gian trên màn hình lớn) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 xl:col-span-2 border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Xu hướng thu nhập
              </h3>
              <p className="text-gray-500 text-sm">Thống kê 6 tháng gần nhất đã thanh toán</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Tháng này</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(data.thu_nhap_thang_nay)}</p>
            </div>
          </div>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={formatCompact} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [formatCurrency(value), 'Thu nhập']}
                />
                <Bar dataKey="total" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-400">Chưa có đủ dữ liệu thu nhập để vẽ biểu đồ.</p>
            </div>
          )}
        </div>

        {/* 3. LỊCH DẠY HÔM NAY (Chiếm 1/3 không gian) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">📅 Lịch dạy hôm nay</h3>
            <button 
              onClick={() => onNavigate('schedule')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Xem tất cả
            </button>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {data.lich_hom_nay && data.lich_hom_nay.length > 0 ? (
              data.lich_hom_nay.map((lich, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-1.5 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">
                      {lich.gio_bat_dau.slice(0, 5)} - {lich.gio_ket_thuc.slice(0, 5)}
                    </p>
                    <p className="text-sm font-medium text-blue-600 mt-0.5">{lich.ten_mon_hoc}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      👤 {lich.ten_hoc_sinh}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">☕</div>
                <p className="text-gray-500 font-medium">Hôm nay trống lịch.</p>
                <p className="text-xs text-gray-400 mt-1">Dành thời gian nghỉ ngơi nhé!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. YÊU CẦU MỚI (Banner nằm dưới cùng) */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-sm p-5 border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-xl">
            📩
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Yêu cầu nhận lớp mới</h3>
            <p className="text-gray-600 text-sm mt-0.5">
              Bạn đang có <span className="font-bold text-red-500 text-base">{data.total_yeu_cau_moi}</span> yêu cầu chờ xem xét.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('requests')}
          className="px-6 py-2.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors font-semibold whitespace-nowrap shadow-sm"
        >
          Xử lý ngay →
        </button>
      </div>
    </div>
  );
}

// UI Component cho Thẻ thống kê
function StatCard({ icon, iconBg, value, label, actionText, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group border border-gray-100 hover:border-blue-200"
    >
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-gray-500 text-sm mb-3">{label}</p>
      
      {actionText && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-500 group-hover:text-blue-700 transition-colors">
          <span>{actionText}</span>
          <span>→</span>
        </div>
      )}
    </div>
  )
}