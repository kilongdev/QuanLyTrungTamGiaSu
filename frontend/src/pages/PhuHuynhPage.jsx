import React from "react";
import {
  BookOpen,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const PhuHuynhPage = () => {
  return (
    <div className="">
      {/* <section className="relative flex flex-col justify-center items-center my-7 lg:max-w-6xl mx-auto">
        <div className=" hidden lg:block absolute -z-10">
          <img
            src="https://giasuongmattroi.com/static/images/bg-text-2.svg"
            alt=""
          />
        </div>
        <div className="flex flex-col items-center px-5 justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Dành Cho Phụ Huynh
          </h1>

          <p className="text-lg opacity-90 max-w-3xl mx-auto mb-8">
            Tìm hiểu về gia sư, lợi ích của việc học gia sư và cách lựa chọn gia
            sư phù hợp giúp con bạn học tập hiệu quả hơn.
          </p>
        </div>
      </section> */}

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20 border-r-1 border-l-1 border-dashed border-gray-300">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <img
            src="https://images.unsplash.com/photo-1588072432836-e10032774350"
            className="rounded-xl shadow-lg"
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
              độ giảng dạy phù hợp với khả năng của từng học sinh.
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
              <h3 className="font-semibold text-lg mb-2">
                Cá nhân hóa việc học
              </h3>
              <p className="text-gray-600">
                Nội dung học được điều chỉnh phù hợp với năng lực học sinh.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
              <Star className="text-yellow-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg mb-2">Cải thiện điểm số</h3>
              <p className="text-gray-600">
                Học sinh được củng cố kiến thức và luyện tập nhiều hơn.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
              <Users className="text-blue-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg mb-2">Tăng sự tự tin</h3>
              <p className="text-gray-600">
                Khi hiểu bài tốt hơn, học sinh sẽ tự tin trong học tập.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white p-10 rounded-xl shadow">
          <h2 className="text-3xl font-bold mb-6 text-red-500">
            Những Thách Thức Khi Tìm Gia Sư
          </h2>

          <ul className="space-y-4 text-gray-600">
            <li className="flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              Khó tìm gia sư phù hợp với trình độ học sinh.
            </li>

            <li className="flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              Chất lượng gia sư không đồng đều.
            </li>

            <li className="flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              Khó theo dõi tiến độ học tập của học sinh.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-purple-600">
            Quy Trình Tìm Gia Sư
          </h2>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-2xl font-bold text-purple-600 mb-2">1</div>
              <p className="text-gray-600">Đăng ký yêu cầu tìm gia sư</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-2xl font-bold text-purple-600 mb-2">2</div>
              <p className="text-gray-600">Trung tâm chọn gia sư phù hợp</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
              <p className="text-gray-600">Gia sư liên hệ phụ huynh</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-2xl font-bold text-purple-600 mb-2">4</div>
              <p className="text-gray-600">Bắt đầu học thử</p>
            </div>
          </div>
        </section>

        {/* REVIEW */}
        {/* <section>
          <h2 className="text-3xl font-bold text-center mb-12">
            Phụ Huynh Nói Gì
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-600 mb-4">
                Gia sư dạy rất tận tâm, con tôi tiến bộ rõ rệt chỉ sau 2 tháng.
              </p>
              <h4 className="font-semibold">Chị Lan</h4>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-600 mb-4">
                Trung tâm hỗ trợ rất nhanh, gia sư phù hợp với con tôi.
              </p>
              <h4 className="font-semibold">Anh Minh</h4>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-600 mb-4">
                Con tôi từ học yếu toán đã đạt điểm khá sau học kỳ.
              </p>
              <h4 className="font-semibold">Chị Hương</h4>
            </div>
          </div>
        </section> */}

        <section className="bg-white p-10 rounded-xl shadow">
          <h2 className="text-3xl font-bold mb-6 text-blue-600 flex gap-2">
            <HelpCircle className="text-blue-600" size={32} />
            Câu Hỏi Thường Gặp
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">
                Gia sư có thể dạy tại nhà không?
              </h3>
              <p className="text-gray-600">
                Có, gia sư có thể dạy tại nhà học sinh hoặc dạy online.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Nếu không phù hợp có đổi gia sư được không?
              </h3>
              <p className="text-gray-600">
                Trung tâm sẽ hỗ trợ đổi gia sư nếu phụ huynh yêu cầu.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 text-white rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Tìm Gia Sư Phù Hợp Cho Con Bạn
          </h2>

          <p className="mb-6 opacity-90">
            Đăng ký ngay để trung tâm giúp bạn tìm gia sư phù hợp nhất.
          </p>

          <button className="bg-white text-blue-600 px-5 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2 mx-auto mt-3">
            <Link to={"/dang-ky-hoc-thu"} className="relative z-10 flex gap-2">
              <MessageCircle size={20} />
              Đăng Ký Tìm Gia Sư
            </Link>
          </button>
        </section>
      </div>
    </div>
  );
};

export default PhuHuynhPage;
