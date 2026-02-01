import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const data = [
  {
    value: "10 +",
    label: "năm kinh nghiệm giảng dạy tư vấn giáo dục",
  },
  {
    value: "5000 +",
    label: "gia sư trên khắp cả nước",
  },
  {
    value: "75000 +",
    label: "học viên đạt target",
  },
  {
    value: "100000 +",
    label: "buổi học thành công",
  },
];

const Banner = () => {
  const sliderRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    if (window.innerWidth >= 1024) return;
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % data.length;

      slider.scrollTo({
        left: indexRef.current * slider.clientWidth,
        behavior: "smooth",
      });
    }, 3000); // 3s

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="w-full h-full">
      {/* banner */}
      <section className="relative w-full my-3 p-3">
        <div className="relative grid items-center gap-4 lg:gap-10 xl:gap-[62px] md:grid-cols-1 lg:grid-cols-2 justify-self-center px-5 md:px-0 z-10 ">
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-[430px]">
              <div className="absolute inset-0 bg-blue-200 max-w-[450px] pt-[76%] -z-10 -skew-y-7 skew-x-9 " />

              <div
                className="sm:max-w-full w-full max-w-[430px] lg:h-[329px] pt-[76%] bg-no-repeat bg-contain bg-center z-20"
                style={{
                  backgroundImage:
                    "url(https://giasuongmattroi.com/wp-content/uploads/2023/12/gia-su-tai-trung-tam-gia-su-ong-mat-troi-1.png)",
                }}
              />
            </div>
          </div>

          <div className="px-1 flex flex-col">
            <div className="flex flex-col text-blue-900">
              <h2 className="font-corinthia font-bold text-4xl ">
                Trung tâm gia sư
              </h2>
              <h2 className=" font-bold xl:text-[64px] text-[32px] uppercase">
                Ông Mặt Trời
              </h2>
            </div>
            <p className="mt-2 mb-5 text-2xl font-normal uppercase">
              Giỏi chuyên môn - Giỏi nghiệp vụ sư phạm
              <br />
              Tận tâm - Kỹ lưỡng - Chuyên nghiệp - Đạo đức tốt
            </p>
            <Button
              variant="ghost"
              className="relative w-fit my-4 mx-auto flex items-center overflow-hidden h-11 rounded-[999px] bg-red-600 text-white border border-red-600 shadow-accent-foreground before:absolute before:inset-0 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-300 before:z-0
            hover:before:scale-x-100 hover:text-red-600 hover:border-white shadow-[2px_2px_0_rgba(239,68,68,0.9)]  "
            >
              <span className="relative z-10">Học thử miễn phí</span>
              <ArrowRight className="relative z-10" />
            </Button>
          </div>
        </div>
        {/* pagination */}
        {/* 
        <ul className="flex justify-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md">
          {[0, 1].map((i) => (
            <li key={i}>
              <Button
                type="button"
                variant="dot"
                size="dot"
                className="!bg-red-300"
                aria-label={`Slide ${i + 1}`}
              />
            </li>
          ))}
        </ul> */}
      </section>
      {/* introduce */}
      <section className="w-full mx-auto">
        <div className=" bg-red-700 w-full h-52 py-7 px-7">
          <div
            ref={sliderRef}
            className="flex gap-6 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-4 lg:gap-7 xl:gap-[90px] lg:overflow-visible lg:gap-[90px] lg:overflow-x-hidden"
          >
            {data.map((item, i) => (
              <div
                key={i}
                className="w-full shrink-0 snap-center flex flex-col items-center justify-center text-center lg:min-w-0"
              >
                <div className="font-semibold text-white text-6xl text-outline">
                  {item.value}
                </div>
                <p className="font-semibold text-white text-2xl">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Banner;
