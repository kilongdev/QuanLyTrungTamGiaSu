import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
  const [animatedData, setAnimatedData] = useState(
    data.map((item) => ({ ...item, currentValue: 0 })),
  );

  useEffect(() => {
    // Xác định giá trị mục tiêu (target) bằng cách lấy số từ chuỗi "value"
    const targets = data.map((item) => {
      const numericValue = parseInt(item.value.replace(/[^0-9]/g, ""), 10) || 0;
      return numericValue;
    });

    const duration = 5000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const updated = data.map((item, index) => {
        const target = targets[index];
        const currentCount = Math.floor(target * progress);

        return {
          ...item,
          currentValue: currentCount,
        };
      });

      setAnimatedData(updated);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="w-full h-full">
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
              className="relative w-fit my-4 mx-auto flex items-center overflow-hidden h-11 rounded-[999px] bg-red-600 text-white border border-red-600 shadow-accent-foreground before:absolute before:inset-0 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-300 before:z-0 hover:before:scale-x-100 hover:text-red-600 hover:border-white shadow-[2px_2px_0_rgba(239,68,68,0.9)]"
            >
              <Link to={"/dang-ky-hoc-thu"} className="relative z-10">
                <span className="relative z-10">Đăng ký học ngay</span>
              </Link>
              <ArrowRight className="relative z-10" />
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full mx-auto">
        <div className="bg-red-700 w-full min-h-52 py-7 px-7">
          <div className="flex gap-6 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-4 lg:gap-7 xl:gap-[90px] lg:overflow-visible">
            {animatedData.map((item, i) => (
              <div
                key={i}
                className="w-full shrink-0 snap-center flex flex-col items-center justify-center text-center"
              >
                <div className="font-bold text-5xl lg:text-[55px] mb-2 text-white">
                  <span className="text-transparent [-webkit-text-stroke:2px_white]">
                    {item.currentValue.toLocaleString()}
                  </span>{" "}
                  +
                </div>

                <p className="font-semibold text-white text-lg lg:text-2xl mt-2">
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
