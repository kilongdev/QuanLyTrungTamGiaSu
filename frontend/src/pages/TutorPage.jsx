import React, { useEffect, useState } from "react";
import { giaSuAPI } from "@/api/giaSuApi";
import RegisterForm from "@/components/ContactForm";
import {
  Brain,
  Calendar,
  CheckCircle,
  GraduationCap,
  LineChart,
  ShieldCheck,
  User,
} from "lucide-react";

const Tutorpage = () => {
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await giaSuAPI.getAll();

        setTutors(res.data || []);
      } catch (error) {
        console.log("Lỗi khi lấy danh sách gia sư:", error);
      }
    };

    fetchTutors();
  }, []);
  const reasons = [
    {
      id: 1,
      icon: <User size={28} />,
      text: "Lộ trình học được tối ưu hóa phù hợp với từng học viên",
    },
    {
      id: 2,
      icon: <Calendar size={28} />,
      text: "Dễ dàng linh hoạt thời gian học nhưng vẫn đảm bảo đều đặn",
    },
    {
      id: 3,
      icon: <Brain size={28} />,
      text: "Giúp học sinh tập trung, không bị xao nhãng",
    },
    {
      id: 4,
      icon: <LineChart size={28} />,
      text: "Dễ dàng theo dõi tiến độ học tập",
    },
    {
      id: 5,
      icon: <CheckCircle size={28} />,
      text: "Cam kết đầu ra theo mục tiêu phụ huynh",
    },
  ];

  const motto = [
    "Bám sát chương trình cải cách mới của Bộ Giáo dục và đào tạo. ",
    "Kèm sát theo sổ báo bài, khối lượng bài giải tại nhà của từng học sinh.",
    "Lấy lại kiến thức cho học sinh yếu.",
    "Nâng cao kiến thức cho học sinh khá giỏi.",
    "Bồi dưỡng kiến thức cho các thí sinh chuẩn bị tham dự các cuộc thi : Học sinh giỏi các cấp, các chương trình học bổng do SGD TP HCM tổ chức.",
  ];

  const commitment = [
    " Hiệu quả – uy tín là tiêu chí hoạt động hàng đầu của trung tâm.",
    "Phối hợp với phụ huynh kiểm tra chất lượng của gia sư trong suốt quá trình học.",
    "Hủy ngay những hợp đồng gia sư giảng dạy thiếu nhân cách và tri thức. Thực hiện đổi ngay gia sư để đảm bảo việc học của học sinh.",
    "Tư vấn Giáo viên, sinh viên phù hợp với trình độ của học sinh (Phụ huynh và học sinh có quyền đề cử giáo viên thích hợp).",
    "Cam kết học sinh tiến bộ sau một tháng.",
    "Phụ huynh chỉ phải đóng phí khi hài lòng về gia sư giảng dạy.",
  ];

  return (
    <div className="">
      <div className="p-6 mx-auto max-w-7xl">
        <div className="relative grid items-center gap-4 lg:gap-10 xl:gap-[62px] md:grid-cols-1 lg:grid-cols-2 justify-self-center px-5 md:px-0 z-10 ">
          <h1 className="text-2xl font-bold mb-6 flex gap-8">
            <GraduationCap className="text-red-600" size={68} />
            <span> Dịch vụ gia sư</span>
          </h1>
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-[430px]">
              <div className="absolute inset-0 bg-blue-200 max-w-[450px] pt-[76%] -z-10 -skew-y-7 skew-x-9 " />

              <div
                className="sm:max-w-full w-full max-w-[430px] lg:h-[329px] pt-[76%] bg-no-repeat bg-contain bg-center z-20"
                style={{
                  backgroundImage:
                    "url(https://giasuongmattroi.com//wp-content/uploads/2023/01/gsomt-image-30.jpg)",
                }}
              />
            </div>
          </div>
        </div>

        <section className="py-20 text-center">
          <h3 className="text-red-500 font-corinthia text-8xl mb-2">
            5 lý do nên chọn
          </h3>

          <h1 className="text-4xl md:text-5xl font-bold">
            PHƯƠNG PHÁP HỌC VỚI GIA SƯ
          </h1>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-12">
            {reasons.map((item) => (
              <div key={item.id} className="flex items-center gap-6">
                <div className="w-24 h-24 min-w-[80px] shrink-0 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg">
                  {item.icon}
                </div>

                <div className="flex items-start gap-5">
                  <span className="text-red-500 text-4xl md:text-5xl font-bold">
                    {item.id}
                  </span>

                  <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border border-dashed border-[#ccc]" />

        <section className="py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            PHƯƠNG CHÂM DẠY KÈM
          </h1>
        </section>

        <section className="pb-9">
          <div className="relative grid items-center gap-4 lg:gap-10 xl:gap-[62px] md:grid-cols-1 lg:grid-cols-2 justify-self-center px-5 md:px-0 z-10 ">
            <ul className=" space-y-4">
              {motto.map((item) => (
                <li className="flex gap-3 items-start">
                  <CheckCircle
                    className="text-green-500 mt-1 shrink-0"
                    size={30}
                  />
                  <p className="text-gray-700">{item}</p>
                </li>
              ))}
            </ul>
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-[430px]">
                <div className="absolute inset-0 bg-blue-200 max-w-[450px] pt-[76%] -z-10 -skew-y-7 skew-x-9 " />

                <div
                  className="sm:max-w-full w-full max-w-[430px] lg:h-[329px] pt-[76%] bg-no-repeat bg-contain bg-center z-20"
                  style={{
                    backgroundImage:
                      "url(	https://giasuongmattroi.com//wp-content/uploads/2023/01/gsomt-image-27.png)",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="border border-dashed border-[#ccc]" />

        <section className="py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">CAM KẾT CHỨC LƯỢNG</h1>
        </section>

        <section className="pb-9">
          <div className="relative grid items-center gap-4 lg:gap-10 xl:gap-[62px] md:grid-cols-1 lg:grid-cols-2 justify-self-center px-5 md:px-0 z-10 ">
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-[430px]">
                <div className="absolute inset-0 bg-blue-200 max-w-[450px] pt-[76%] -z-10 -skew-y-7 skew-x-9 " />

                <div
                  className="sm:max-w-full w-full max-w-[430px] lg:h-[329px] pt-[76%] bg-no-repeat bg-contain bg-center z-20"
                  style={{
                    backgroundImage:
                      "url(https://giasuongmattroi.com//wp-content/uploads/2023/01/gsomt-image-26.png)",
                  }}
                />
              </div>
            </div>

            <ul className="space-y-4">
              {commitment.map((item) => (
                <li className="flex gap-3 items-start">
                  <ShieldCheck
                    className="text-red-500 mt-1 shrink-0"
                    size={30}
                  />
                  <p className="text-gray-700">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="border border-dashed border-[#ccc]" />
      </div>

      <RegisterForm className="pt-6" />
    </div>
  );
};

export default Tutorpage;
