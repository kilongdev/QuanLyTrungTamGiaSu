import React from "react";
import {
  BookOpen,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  HelpCircle,
  Award,
  Clock,
  CornerDownRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const PhuHuynhPage = () => {
  return (
    <div className="">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20 border-x border-dashed border-gray-300">
        {/* GIỚI THIỆU */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <img
            src="https://images.unsplash.com/photo-1588072432836-e10032774350"
            className="rounded-xl shadow-lg"
            alt="gia su"
          />

          <div>
            <h2 className="text-3xl font-bold mb-4 text-blue-600">
              Gia Sư Là Gì?
            </h2>

            <p className="text-gray-600 mb-4">
              Gia sư là hình thức dạy kèm cá nhân giữa giáo viên và học sinh
              nhằm giúp học sinh hiểu bài sâu hơn, cải thiện điểm số và phát
              triển kỹ năng học tập.
            </p>

            <p className="text-gray-600">
              Với phương pháp học tập cá nhân hóa, gia sư có thể điều chỉnh tốc
              độ giảng dạy phù hợp với từng học sinh.
            </p>
          </div>
        </section>

        {/* LỢI ÍCH */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-green-600">
            Lợi Ích Khi Học Với Gia Sư
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
              <BookOpen className="text-green-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg mb-2">Cá nhân hóa</h3>
              <p className="text-gray-600">
                Nội dung học phù hợp với năng lực học sinh.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
              <Star className="text-yellow-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg mb-2">Cải thiện điểm số</h3>
              <p className="text-gray-600">
                Củng cố kiến thức và luyện tập hiệu quả.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
              <Users className="text-blue-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg mb-2">Tăng tự tin</h3>
              <p className="text-gray-600">
                Hiểu bài tốt giúp học sinh tự tin hơn.
              </p>
            </div>
          </div>
        </section>

        {/* ĐỐI TƯỢNG */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-indigo-600">
            Đối Tượng Phù Hợp
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <BookOpen className="text-red-500" size={40} />
              <h3 className="font-semibold mb-2 mt-4">Học sinh mất gốc</h3>
              <p className="text-gray-600">Cần củng cố lại kiến thức cơ bản.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <Award className="text-orange-500" size={40} />
              <h3 className="font-semibold mb-2 mt-4">Muốn nâng cao</h3>
              <p className="text-gray-600">Luyện thi, học nâng cao.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <Clock className="text-purple-600" size={40} />
              <h3 className="font-semibold mb-2 mt-4">Thiếu tập trung</h3>
              <p className="text-gray-600">
                Cần người kèm sát và tạo động lực.
              </p>
            </div>
          </div>
        </section>

        {/* THÁCH THỨC */}
        <section className="bg-white p-10 rounded-xl shadow">
          <h2 className="text-3xl font-bold mb-6 text-red-500">
            Thách Thức Khi Tìm Gia Sư
          </h2>

          <ul className="space-y-4 text-gray-600">
            <li className="flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              Khó tìm gia sư phù hợp
            </li>
            <li className="flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              Chất lượng không đồng đều
            </li>
            <li className="flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              Khó theo dõi tiến độ học
            </li>
          </ul>
        </section>

        {/* TIÊU CHÍ */}
        <section className="bg-gray-50 p-10 rounded-xl">
          <h2 className="text-3xl font-bold mb-6 text-orange-500">
            Tiêu Chí Chọn Gia Sư
          </h2>

          <ul className="space-y-3 text-gray-600">
            <li>✔️ Kiến thức vững</li>
            <li>✔️ Dạy dễ hiểu</li>
            <li>✔️ Có kinh nghiệm</li>
            <li>✔️ Tận tâm</li>
            <li>✔️ Phù hợp học sinh</li>
          </ul>
        </section>

        {/* CAM KẾT */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-600">
            Cam Kết Từ Trung Tâm
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow text-center ring-1 ring-green-300 hover:shadow-lg transition">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={36} />
              <h3 className="font-semibold">Gia sư chất lượng</h3>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center ring-1 ring-green-300 hover:shadow-lg transition">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={36} />
              <h3 className="font-semibold">Hỗ trợ nhanh</h3>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center ring-1 ring-green-300 hover:shadow-lg transition">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={36} />
              <h3 className="font-semibold">Đổi gia sư miễn phí</h3>
            </div>
          </div>
        </section>

        {/* QUY TRÌNH */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-purple-600">
            Quy Trình Tìm Gia Sư
          </h2>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            {["Đăng ký", "Chọn gia sư", "Liên hệ", "Học thử"].map((step, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow ring-1 ring-purple-300 hover:shadow-lg transition"
              >
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {i + 1}
                </div>
                <p className="text-gray-600">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white p-10 rounded-xl shadow ring-1 ring-blue-200 mb-10">
          <h2 className="text-3xl font-bold mb-6 text-blue-600 flex gap-2">
            <HelpCircle size={28} />
            Câu Hỏi Thường Gặp
          </h2>

          <div className="space-y-6 text-gray-600">
            {[
              {
                q: "Gia sư có thể dạy tại nhà không?",
                a: "Có, gia sư có thể dạy tại nhà hoặc dạy online tùy theo nhu cầu của phụ huynh.",
              },
              {
                q: "Nếu không phù hợp có thể đổi gia sư không?",
                a: "Có, trung tâm hỗ trợ đổi gia sư miễn phí nếu phụ huynh chưa hài lòng.",
              },
              {
                q: "Thời gian tìm gia sư mất bao lâu?",
                a: "Thông thường từ 1–3 ngày, tùy vào yêu cầu cụ thể của phụ huynh.",
              },
              {
                q: "Gia sư có kinh nghiệm không?",
                a: "Tất cả gia sư đều được kiểm tra kỹ về chuyên môn và kinh nghiệm trước khi nhận lớp.",
              },
              {
                q: "Có thể học online không?",
                a: "Có, chúng tôi cung cấp cả hình thức học online linh hoạt.",
              },
              {
                q: "Học phí được tính như thế nào?",
                a: "Học phí phụ thuộc vào lớp học, môn học và trình độ gia sư.",
              },
              {
                q: "Có thể theo dõi tiến độ học của con không?",
                a: "Phụ huynh sẽ được cập nhật thường xuyên về tình hình học tập của học sinh.",
              },
              {
                q: "Gia sư có hỗ trợ ngoài giờ không?",
                a: "Nhiều gia sư sẵn sàng hỗ trợ thêm qua tin nhắn hoặc online.",
              },
            ].map((item, i) => (
              <div key={i} className=" pb-2  px-2 rounded transition">
                <h3 className="font-semibold text-[20px] text-gray-800 mb-1">
                  <span>{i + 1}. </span>
                  {item.q}
                </h3>
                <p className="text-gray-600 text-lg flex items-center gap-2">
                  <CornerDownRight />
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Link
          to="/dang-ky-hoc-thu"
          className="bg-red-600 text-white px-5 py-3 rounded-[100px] font-semibold hover:bg-red-700 flex items-center gap-2 mx-auto w-fit"
        >
          <MessageCircle size={20} />
          Bắt đầu ngay
        </Link>
      </div>
    </div>
  );
};

export default PhuHuynhPage;
