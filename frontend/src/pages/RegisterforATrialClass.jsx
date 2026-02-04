import ContactForm from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const RegisterforATrialClass = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    try {
      console.log("data: ", data);
      await new Promise((r) => setTimeout(r, 1000));
      reset();
      toast.success("Gửi thành công!");
    } catch (error) {
      console.error(errors);
      toast.error("Lỗi khi gửi thông tin");
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

            <div className="flex flex-col gap-2">
              <label htmlFor="" className="font-semibold">
                Tỉnh/thành *
              </label>
              {/* <Input
                {...register("city", {
                  required: "Vui lòng nhập tỉnh/thành",
                })}
                placeholder="Tỉnh/thành *"
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              /> */}
              <select
                name="province"
                id="province"
                {...register("province", {
                  required: "Vui lòng chọn tỉnh/thành",
                })}
                className="rounded-full bg-white shadow-inner text-black px-4 py-2
               focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-blue-400 focus-visible:border-blue-400"
                defaultValue=""
              >
                <option value="" disabled>
                  -- Chọn tỉnh --
                </option>
                <option value="hcm">TP.HCM</option>
                <option value="hn">Hà Nội</option>
              </select>
              {errors.province && (
                <div className="mt-2 text-red-600">
                  <p>{errors.province.message}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="" className="font-semibold">
                Địa chỉ
              </label>
              <Input
                placeholder="Vd: 275 An Dương Vương, Quận 5"
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
            </div>
          </div>

          {/* Thông tin khóa học bạn muốn học thử */}
          <div className="my-5">
            <h3 className="font-bold text-3xl">
              Thông tin khóa học bạn muốn học thử
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="" className="font-semibold">
                Môn học *
              </label>
              <Input
                placeholder="Môn học *"
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="" className="font-semibold">
                Nội dung *
              </label>
              <Input
                placeholder="Nội dung *"
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="" className="font-semibold">
                Học phí dự kiến (VNĐ/buổi)
              </label>
              <Input
                placeholder="Vd: 200.200"
                className="rounded-full bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="" className="font-semibold">
                Số học viên
              </label>
              <Input
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
                type="date"
                className="rounded-full bg-white shadow-inner text-black h-11 px-4 focus-visible:ring-2 focus-visible:ring-blue-400 appearance-none"
              />
              {/* <Calendar /> */}
            </div>

            <div className="flex gap-5">
              <label htmlFor="" className="font-semibold">
                Hình thức học *{" "}
              </label>
              <div className="flex gap-2">
                <input id="home" type="radio" name="studyType" value="home" />
                <label htmlFor="home">Tại nhà</label>
              </div>
              <div className="flex gap-2">
                <input
                  id="online"
                  type="radio"
                  name="studyType"
                  value="Trực tuyến"
                />
                <label htmlFor="online">Trực tuyến</label>
              </div>
            </div>

            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="" className="font-semibold">
                Nội dung chi tiết muốn học và lưu ý cho gia sư
              </label>
              <textarea
                placeholder="Vd: Ôn luyện tiếng Anh trên lớp, luyện khả năng giao tiếp, phản xạ tự nhiên. Bé trai 8 tuổi cần người dạy học và chơi cùng buổi sáng và chiều. Bé ngủ trưa 1 tiếng. Gia sư ăn trưa với gia đình..."
                className=" p-3 overflow-y-auto rounded-full resize-none bg-white shadow-inner border text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
            </div>
          </div>
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
