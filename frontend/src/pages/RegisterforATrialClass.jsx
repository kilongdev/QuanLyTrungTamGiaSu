import ContactForm from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { lopHocAPI } from "@/api/lophocApi";
import { monHocAPI } from "@/api/monhocApi";
import { yeuCauAPI } from "@/api/yeucauApi";

const RegisterforATrialClass = () => {
  const [searchParams] = useSearchParams();
  const [classData, setClassData] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [gradesBySubject, setGradesBySubject] = useState({});
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [gradeOptions, setGradeOptions] = useState([]);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ mode: "onBlur" });

  // lấy lớp học theo id
  useEffect(() => {
    const source = searchParams.get("source");
    const classId = searchParams.get("MSL");
    if (source === "available" && classId) {
      const fetchClassData = async () => {
        try {
          const res = await lopHocAPI.getById(classId);
          setClassData(res.data || res);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin lớp học:", error);
        }
      };
      fetchClassData();
    }
  }, [searchParams]);

  // lấy dữ liệu môn học + lớp học, dropdown khối lớp phù thuộc
  useEffect(() => {
    const loadData = async () => {
      try {
        const [subRes, classRes] = await Promise.all([
          monHocAPI.getAll(),
          lopHocAPI.getAll(),
        ]);
        const subs = subRes.data || [];
        const classes = classRes.data || classRes || [];
        console.log("subRes: ", subRes);
        console.log("classRes: ", classRes);
        setSubjects(subs);
        const map = {};
        classes.forEach((c) => {
          if (c.mon_hoc_id) {
            map[c.mon_hoc_id] = map[c.mon_hoc_id] || new Set();
            if (c.khoi_lop) map[c.mon_hoc_id].add(c.khoi_lop);
          }
          // console.log("map[c.mon_hoc_id]", map[c.mon_hoc_id]);
        });
        const obj = {};
        for (const key in map) {
          obj[key] = Array.from(map[key]);
        }
        // console.log("map", map);
        // console.log("obj", obj);

        setGradesBySubject(obj);
      } catch (err) {
        console.error("Lỗi khi lấy môn/ lớp học:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSubject && gradesBySubject[selectedSubject]) {
      setGradeOptions(gradesBySubject[selectedSubject]);
    } else {
      setGradeOptions([]);
    }
    setSelectedGrade("");
  }, [selectedSubject, gradesBySubject]);

  const onSubmit = async (data) => {
    try {
      const submitData = {
        ho_ten: data.name,
        so_dien_thoai: data.phone,
        email: data.email,
        hinh_thuc_hoc: data.studyType,
        noi_dung_chi_tiet: data.note || "",
      };

      if (classData) {
        submitData.lop_hoc_id = classData.lop_hoc_id;
        // submitData.mon_hoc_id = classData.mon_hoc_id;
        // submitData.khoi_lop = classData.khoi_lop;
        // submitData.hoc_phi_du_kien = classData.gia_moi_buoi;
        // submitData.so_hoc_vien = classData.so_luong_hien_tai;
        // submitData.so_buoi_tuan = classData.so_buoi_hoc;
        // submitData.ngay_du_kien = data.startDate || null;
      } else {
        submitData.mon_hoc_id = selectedSubject;
        submitData.khoi_lop = selectedGrade;
        submitData.hoc_phi_du_kien = data.expectedFee
          ? parseFloat(data.expectedFee.replace(/[^\d]/g, ""))
          : null;
        submitData.so_hoc_vien = data.number ? parseInt(data.number) : null;
        submitData.so_buoi_tuan = data.sessionsPerWeek
          ? parseInt(data.sessionsPerWeek)
          : null;
        submitData.ngay_du_kien = data.startDate || null;
        submitData.lop_hoc_id = null;
      }

      console.log("Dữ liệu gửi lên server:", submitData);

      const response = await yeuCauAPI.createGuest(submitData);

      if (response.status === "success") {
        reset();
        toast.success(
          response.message ||
            "Đăng ký học thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
        );
        navigate("/");
      } else {
        throw new Error(response.message || "Có lỗi xảy ra khi đăng ký");
      }
    } catch (error) {
      console.error("Lỗi khi gửi thông tin:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi gửi thông tin";
      toast.error(errorMessage);
    }
  };
  return (
    <div className="w-full mb-4">
      <section className="relative w-full my-3 p-3">
        <div className="relative grid items-center gap-6 lg:gap-10 xl:gap-[62px] md:grid-cols-1 lg:grid-cols-2 justify-self-center px-5 md:px-0 z-10 ">
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-[630px]">
              <div className="absolute inset-0 bg-blue-200 lg:max-w-[476px] pt-[65%] lg:pt-[75%] -z-10 -skew-y-7 skew-x-9 " />

              <div
                className="bg-center bg-no-repeat bg-cover pt-[65%] lg:pt-[75%] z-2 border-[10px] border-white lg:max-w-[476px] "
                style={{
                  backgroundImage:
                    "url(https://giasuongmattroi.com//wp-content/uploads/2023/01/hoc_thu.jpg)",
                }}
              />
            </div>
          </div>
          <div className=" hidden lg:block absolute -z-20">
            <img
              src="https://giasuongmattroi.com/static/images/bg-text-2.svg"
              alt=""
            />
          </div>
          <div className="px-1 flex flex-col gap-5">
            <div className="flex flex-col">
              <h2 className="font-bold text-4xl  text-blue-900 mb-2">
                ĐĂNG KÝ HỌC THỬ
              </h2>
              <p>Hãy gọi ngay đến hotline để được tư vấn và đăng ký</p>
              <p> học thử và nhận báo giá theo yêu cầu của bạn.</p>
            </div>
            <div className="text-2xl text-red-500">
              <a href="tel:0326022511">032 602 2511</a>
              {" - "}
              <a href="tel:0813454248">081 345 4248</a>
            </div>
          </div>
        </div>
      </section>
      <div className=" w-full p-5 lg:p-0 max-w-4xl mx-auto flex flex-col relative z-20">
        <h3 className="text-center text-[20px] mt-3">
          Hoặc bạn có thể để lại thông tin và nội dung yêu cầu. Chúng tôi sẽ ghi
          danh và gửi thông báo cùng báo giá đến bạn trong thời gian sớm nhất.
        </h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Thông tin cá nhân */}
          <div className="my-5">
            <h3 className="font-bold text-3xl">Thông tin của bạn</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="" className="font-semibold">
                Họ tên *
              </label>
              <Input
                {...register("name", {
                  required: "Vui lòng nhập tên",
                })}
                placeholder="Họ tên *"
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
              {errors.name && (
                <div className="text-red-600 mt-2">
                  <p>{errors.name.message}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="" className="font-semibold">
                Số điện thoại *
              </label>
              <Input
                {...register("phone", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: /^(0\d{9}|\+84\d{9})$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
                placeholder="Số điện thoại *"
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
              {errors.phone && (
                <div className="mt-2 text-red-600">
                  <p>{errors.phone.message}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="" className="font-semibold">
                Email *
              </label>
              <Input
                type="email"
                placeholder="email"
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Email không hợp lệ",
                  },
                })}
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
              {errors.email && (
                <div className="mt-2 text-red-600">
                  <p>{errors.email.message}</p>
                </div>
              )}
            </div>

            {/* <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="" className="font-semibold">
                Địa chỉ
              </label>
              <Input
                placeholder="Vd: 275 An Dương Vương, Quận 5"
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
            </div> */}
          </div>

          {/* Thông tin khóa học bạn muốn học thử */}
          <div className="my-5">
            <h3 className="font-bold text-3xl">
              Thông tin khóa học bạn muốn học thử
            </h3>
          </div>
          {classData ? (
            <div className="bg-gray-50 p-5 rounded-lg">
              <ul className="space-y-2 text-[15px] list-disc marker:text-blue-600">
                <li>
                  <b>Mã lớp:</b> {classData.lop_hoc_id}
                </li>
                <li>
                  <b>Gia sư:</b> {classData.ten_gia_su || "Chưa có"}
                  {" - "}
                  {classData.bang_cap}
                </li>
                <li>
                  <b>Môn học:</b> {classData.ten_mon_hoc}
                </li>
                <li>
                  <b>Khối lớp:</b> {classData.khoi_lop}
                </li>
                <li>
                  <b>Số buổi học:</b> {classData.so_buoi_hoc}
                </li>

                <li>
                  <b>Số lượng tối đa:</b> {classData.so_luong_toi_da}
                </li>
                <li>
                  <b>Số lượng hiện tại:</b> {classData.so_luong_hien_tai}
                </li>
                <li>
                  <b>Học phí mỗi buổi:</b>{" "}
                  {Number(classData.gia_moi_buoi).toLocaleString("vi-VN")} đ
                </li>
                <li>
                  <b>Học phí toàn khoá:</b>{" "}
                  {Number(classData.gia_toan_khoa).toLocaleString("vi-VN")} đ
                </li>
                {/* <li>
                  <b>Trạng thái:</b> {classData.trang_thai}
                </li> */}
              </ul>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="" className="font-semibold">
                  Môn học *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="rounded-full bg-white shadow-inner text-black px-4 py-2
               focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-blue-400 focus-visible:border-blue-400"
                >
                  <option value="" disabled>
                    -- chọn môn học --
                  </option>
                  {subjects.map((s) => (
                    <option key={s.mon_hoc_id} value={s.mon_hoc_id}>
                      {s.ten_mon_hoc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="" className="font-semibold">
                  Khối lớp *
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  disabled={!selectedSubject || gradeOptions.length === 0}
                  className="rounded-full bg-white shadow-inner text-black px-4 py-2
               focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-blue-400 focus-visible:border-blue-400"
                >
                  <option value="" disabled>
                    {selectedSubject
                      ? gradeOptions.length
                        ? "-- Chọn khối lớp --"
                        : "Không có kết quả"
                      : "Chọn môn trước"}
                  </option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="" className="font-semibold">
                  Học phí dự kiến (VNĐ/buổi)
                </label>
                <Input
                  {...register("expectedFee")}
                  placeholder="Vd: 200.000"
                  className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="" className="font-semibold">
                  Số học viên
                </label>
                <Input
                  {...register("number", {
                    required: classData ? false : "Vui lòng nhập số",
                    pattern: {
                      value: /^\d+$/,
                      message: "Vui lòng nhập số hợp lệ",
                    },
                  })}
                  placeholder="Vd: 2"
                  className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="sessionsPerWeek" className="font-semibold">
                    Số buổi/tuần
                  </label>

                  <select
                    {...register("sessionsPerWeek")}
                    id="sessionsPerWeek"
                    name="sessionsPerWeek"
                    className="rounded-full bg-white shadow-inner text-black px-4 py-2
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-blue-400 focus-visible:border-blue-400"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- Chọn số buổi --
                    </option>
                    <option value="1">1 buổi/tuần</option>
                    <option value="2">2 buổi/tuần</option>
                    <option value="3">3 buổi/tuần</option>
                    <option value="4">4 buổi/tuần</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Ngày dự kiến</label>
                <Input
                  {...register("startDate")}
                  type="date"
                  className="rounded-full bg-white shadow-inner text-black h-11 px-4 focus-visible:ring-2 focus-visible:ring-blue-400 appearance-none"
                />
              </div>

              <div className="flex gap-5">
                <label htmlFor="" className="font-semibold">
                  Hình thức học *{" "}
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("studyType", { required: true })}
                    id="home"
                    type="radio"
                    name="studyType"
                    value="home"
                  />
                  <label htmlFor="home">Tại nhà</label>
                </div>
                <div className="flex gap-2">
                  <input
                    {...register("studyType", { required: true })}
                    id="online"
                    type="radio"
                    name="studyType"
                    value="online"
                  />
                  <label htmlFor="online">Trực tuyến</label>
                </div>
              </div>

              <div className="flex flex-col gap-2 col-span-2">
                <label htmlFor="" className="font-semibold">
                  Nội dung chi tiết muốn học và lưu ý cho gia sư
                </label>
                <textarea
                  {...register("note")}
                  placeholder="Vd: Ôn luyện tiếng Anh trên lớp, luyện khả năng giao tiếp, phản xạ tự nhiên. Bé trai 8 tuổi cần người dạy học và chơi cùng buổi sáng và chiều. Bé ngủ trưa 1 tiếng. Gia sư ăn trưa với gia đình..."
                  className=" p-3 overflow-y-auto rounded-full resize-none bg-white shadow-inner border text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
                />
              </div>
            </div>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="ghost"
            className="relative w-fit mx-auto my-2 flex items-center overflow-hidden h-11 rounded-[999px] bg-red-600 text-white border border-red-600 shadow-accent-foreground before:absolute before:inset-0 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-300 before:z-0
                      hover:before:scale-x-100 hover:text-red-600 hover:border-white shadow-[2px_2px_0_rgba(239,68,68,0.9)] disabled:opacity-60 disabled:cursor-not-allowed  "
          >
            <span className="relative z-10">
              {isSubmitting ? "Đang gửi..." : "Đăng ký ngay"}
            </span>
            <ArrowRight className="relative z-10" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterforATrialClass;
