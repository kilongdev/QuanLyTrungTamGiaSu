import { useState, useEffect } from 'react';
import { GraduationCap, Users, Briefcase, BookOpen, ArrowRight, TrendingUp, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { hocSinhAPI } from '@/api/hocSinhApi';
import { phuHuynhAPI } from '@/api/phuHuynhApi';
import { giaSuAPI } from '@/api/giaSuApi';
import { lopHocAPI } from '@/api/lophocApi';
import { monHocAPI } from '@/api/monhocApi';

function StatCard({ icon, label, value, color, loading, subtext }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow h-[140px] p-5 flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          {loading ? (
            <div className="mt-3 h-7 w-20 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-full flex-shrink-0 ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          {icon}
        </div>
      </div>
      {subtext && !loading && <p className="text-xs text-gray-400 mt-auto">{subtext}</p>}
    </div>
  );
}

// Dữ liệu mẫu cho biểu đồ - có thể được thay thế bằng dữ liệu thực từ backend
const SAMPLE_REVENUE_DATA = [
  { month: 'T1', revenue: 2400, students: 24 },
  { month: 'T2', revenue: 1398, students: 18 },
  { month: 'T3', revenue: 9800, students: 35 },
  { month: 'T4', revenue: 3908, students: 28 },
  { month: 'T5', revenue: 4800, students: 32 },
  { month: 'T6', revenue: 3800, students: 30 },
];

const SAMPLE_SUBJECTS_DATA = [
  { name: 'Toán', value: 45, color: '#3B82F6' },
  { name: 'Tiếng Anh', value: 38, color: '#10B981' },
  { name: 'Lý', value: 25, color: '#F59E0B' },
  { name: 'Hóa', value: 20, color: '#8B5CF6' },
  { name: 'Văn', value: 15, color: '#EF4444' },
];

const SAMPLE_CLASS_DISTRIBUTION = [
  { grade: 'Lớp 6', total: 12, active: 10 },
  { grade: 'Lớp 7', total: 15, active: 13 },
  { grade: 'Lớp 8', total: 18, active: 16 },
  { grade: 'Lớp 9', total: 22, active: 20 },
  { grade: 'Lớp 10', total: 20, active: 18 },
  { grade: 'Lớp 11', total: 18, active: 15 },
];

export default function DashboardOverview({ onNavigate }) {
  const [stats, setStats] = useState({
    students: 0,
    parents: 0,
    tutors: 0,
    classes: 0,
    activeClasses: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [monHocs, setMonHocs] = useState([]);
  const [giaSus, setGiaSus] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [studentRes, parentRes, tutorRes, classRes, monHocRes] = await Promise.all([
          hocSinhAPI.getAll({ limit: 1 }),
          phuHuynhAPI.getAll({ limit: 1 }),
          giaSuAPI.getAll(),
          lopHocAPI.getAll(),
          monHocAPI.getAll(),
        ]);

        const allClasses = classRes.data || [];
        const activeClasses = allClasses.filter(c => c.trang_thai === 'dang_hoc');

        setStats({
          students: studentRes.pagination.total,
          parents: parentRes.pagination.total,
          tutors: tutorRes.data.length,
          classes: allClasses.length,
          activeClasses: activeClasses.length,
          totalRevenue: 28000, // Đơn vị: nghìn đồng - thay đổi theo dữ liệu thực tế
        });

        setMonHocs(monHocRes.data || []);
        setGiaSus(tutorRes.data || []);
        setOngoingClasses(activeClasses.slice(0, 5)); // Chỉ hiển thị 5 lớp đầu tiên

      } catch (error) {
        console.error("Không thể tải dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getMonHocName = (monHocId) => {
    const monHoc = monHocs.find(m => m.mon_hoc_id == monHocId);
    return monHoc ? monHoc.ten_mon_hoc : 'N/A';
  };

  const getGiaSuName = (giaSuId) => {
    const giaSu = giaSus.find(g => g.gia_su_id == giaSuId);
    return giaSu ? giaSu.ho_ten : 'Chưa có';
  };

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>
          <p className="text-gray-500 text-sm mt-1">Các chỉ số quan trọng và thống kê hoạt động của trung tâm</p>
        </div>

        {/* Main Statistics Cards */}
        <div className="p-5 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard 
              label="Tổng Học sinh" 
              value={stats.students} 
              icon={<GraduationCap size={24} className="text-blue-500" />} 
              color="border-blue-500" 
              loading={loading}
              subtext="Kích hoạt"
            />
            <StatCard 
              label="Tổng Phụ huynh" 
              value={stats.parents} 
              icon={<Users size={24} className="text-green-500" />} 
              color="border-green-500" 
              loading={loading}
              subtext="Tham gia"
            />
            <StatCard 
              label="Tổng Gia sư" 
              value={stats.tutors} 
              icon={<Briefcase size={24} className="text-purple-500" />} 
              color="border-purple-500" 
              loading={loading}
              subtext="Hoạt động"
            />
            <StatCard 
              label="Tổng Lớp" 
              value={stats.classes} 
              icon={<BookOpen size={24} className="text-orange-500" />} 
              color="border-orange-500" 
              loading={loading}
              subtext="Tất cả"
            />
            <StatCard 
              label="Lớp đang hoạt động" 
              value={stats.activeClasses} 
              icon={<TrendingUp size={24} className="text-red-500" />} 
              color="border-red-500" 
              loading={loading}
              subtext="Hiện tại"
            />
            <StatCard 
              label="Doanh thu" 
              value={`${(stats.totalRevenue / 1000).toFixed(0)}k`} 
              icon={<Award size={24} className="text-yellow-500" />} 
              color="border-yellow-500" 
              loading={loading}
              subtext="Tháng này"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="p-5 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* Revenue Trend Chart */}
            <div>
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  Xu hướng doanh thu & học sinh
                </h3>
                <p className="text-gray-500 text-sm">6 tháng gần đây</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={SAMPLE_REVENUE_DATA} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => value}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                    name="Doanh thu (x 100k)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                    name="Số học sinh"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Subjects Distribution Pie Chart */}
            <div>
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-600" />
                  Phân bố theo môn học
                </h3>
                <p className="text-gray-500 text-sm">Tổng số lớp học</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={SAMPLE_SUBJECTS_DATA}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {SAMPLE_SUBJECTS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} lớp`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Classes by Grade Chart - Full Width */}
          <div className="pt-6 border-t border-gray-200">
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <GraduationCap size={20} className="text-orange-600" />
                Phân bố lớp theo khối
              </h3>
              <p className="text-gray-500 text-sm">Tổng vs Lớp đang hoạt động</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={SAMPLE_CLASS_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="grade" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="total" fill="#3B82F6" name="Tổng lớp" radius={[8, 8, 0, 0]} />
                <Bar dataKey="active" fill="#10B981" name="Lớp đang hoạt động" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-gray-400 mt-4">💡 Dữ liệu mẫu - sẽ cập nhật tự động khi kết nối backend</p>
        </div>

        {/* Ongoing Classes List */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Lớp đang hoạt động gần đây
            </h3>
            <button 
              onClick={() => onNavigate && onNavigate('lophoc')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Đang tải danh sách lớp...</p>
          ) : ongoingClasses.length > 0 ? (
            <div className="space-y-3">
              {ongoingClasses.map(lop => (
                <div key={lop.lop_hoc_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {getMonHocName(lop.mon_hoc_id).charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Lớp {lop.khoi_lop} - {getMonHocName(lop.mon_hoc_id)}</p>
                    <p className="text-gray-500 text-sm">👨‍🏫 {getGiaSuName(lop.gia_su_id)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">ID: {lop.lop_hoc_id}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Không có lớp nào đang hoạt động.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}