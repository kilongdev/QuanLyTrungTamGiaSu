import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      message: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    try {
      console.log("form data: ", data);
      await new Promise((r) => setTimeout(r, 1000));
      reset();
      toast.success("Gửi thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi gửi thông tin!");
    }
  };
  return (
    <section className="relative w-full p-3 bg-gradient-to-br from-[#275192] to-[#9cacd5]">
      <div className="relative py-5 grid items-center gap-4 lg:gap-10 xl:gap-[62px] md:grid-cols-1 lg:grid-cols-2 justify-self-center px-5 md:px-0 z-10 ">
        <div className="relative flex justify-center">
          <div className="relative w-full max-w-[430px]">
            <div className="absolute inset-0 bg-red-300 max-w-[450px] pt-[76%] -z-10 -skew-y-7 skew-x-9 " />

            <div
              className="sm:max-w-full w-full max-w-[430px] lg:h-[329px] pt-[76%] bg-no-repeat bg-contain bg-center z-20"
              style={{
                backgroundImage:
                  "url(https://giasuongmattroi.com/wp-content/uploads/2023/02/gsomt-image-02.jpg)",
              }}
            />
          </div>
        </div>

        <div className="px-1 flex flex-col">
          <div className=" text-white p-3 md:p-8">
            <h3 className="font-corinthia text-6xl text-center lg:text-left">
              Liên hệ
            </h3>
            <h2 className="font-bold text-[32px] md:text-[40px] text-center lg:text-left">
              Tư vấn miễn phí
            </h2>
            <p className="text-white text-16 lg:max-w-[558px] lg:mb-7 text-center lg:text-left">
              Bạn cần tìm gia sư, muốn được học thử và cần tư vấn thêm. Hãy để
              lại thông tin cho chúng tôi để được liên hệ lại và tư vấn MIỄN
              PHÍ.
            </p>

            <form
              className="mt-2 space-y-4"
              method="post"
              onSubmit={handleSubmit(onSubmit)}
            >
              <>
                <div className="grid grid-cols-2 gap-1 md:gap-5 ">
                  <div className="col-span-2 lg:col-span-1">
                    <Input
                      {...register("name", {
                        required: "Vui lòng nhập tên",
                      })}
                      size={40}
                      type="text"
                      className="rounded-full mt-4 bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 "
                      placeholder="Tên bạn *"
                    />
                    {errors.name && (
                      <div className="text-red-600 mt-2">
                        <p>{errors.name.message}</p>
                      </div>
                    )}
                  </div>
                  <div className=" col-span-2 lg:col-span-1">
                    <Input
                      {...register("phone", {
                        required: "Vui lòng nhập số điện thoại",
                        pattern: {
                          value: /^(0\d{9}|\+84\d{9})$/,
                          message: "Số điện thoại không hợp lệ",
                        },
                      })}
                      size={40}
                      type="text"
                      className="rounded-full mt-4 bg-white shadow-inner text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400"
                      placeholder="Số điện thoại *"
                    />
                    {errors.phone && (
                      <div className="mt-2 text-red-600">
                        <p>{errors.phone.message}</p>
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full border placeholder:text-grey-400 rounded-2xl px-4 pt-5 mt-3 italic font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 resize-none transition"
                  placeholder="Nội dung cần tư vấn"
                ></textarea>
              </>
              {/* submit */}

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="ghost"
                className="relative w-fit mx-auto my-2 flex items-center overflow-hidden h-11 rounded-[999px] bg-red-600 text-white border border-red-600 shadow-accent-foreground before:absolute before:inset-0 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-300 before:z-0
            hover:before:scale-x-100 hover:text-red-600 hover:border-white shadow-[2px_2px_0_rgba(239,68,68,0.9)] disabled:opacity-60 disabled:cursor-not-allowed  "
              >
                <span className="relative z-10">
                  {isSubmitting ? "Đang gửi..." : "Gửi thông tin"}
                </span>
                <ArrowRight className="relative z-10" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
