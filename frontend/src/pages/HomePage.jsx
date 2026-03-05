import Banner from "@/components/Banner";
import { Button } from "@/components/ui/button";
import { AnimatePresence, animations, motion, transform } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import AvailableClastList from "@/components/AvailableClassList";
import { getAvailableClasses, getFilterOptions } from "@/service/classService";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import RegisterForm from "@/components/ContactForm";
import { dataStudyProgram, descriptions } from "@/data/homepageData";

const Homepage = () => {
  const [active, setActive] = useState(0);
  const activeProgram = dataStudyProgram.find((item) => item.id === active);
  console.log(activeProgram);

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [options, setOptions] = useState([]);

  // scroll
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  // đánh giá của phụ huynh
  const totalDes = descriptions.length;
  console.log("totaldes: ", totalDes);

  const prev = () => {
    const prevIndex = currentIndex === 0 ? totalDes - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);

    itemRefs.current[prevIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });
  };

  const next = () => {
    const nextIndex = currentIndex === totalDes - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);

    itemRefs.current[nextIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });
  };

  useEffect(() => {
    Promise.all([getAvailableClasses(), getFilterOptions()])
      .then(([classRes, optionRes]) => {
        setClasses(classRes.data);
        setOptions(optionRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Banner />
      {/* Dịch vụ gia sư   */}

      <section className="relative flex flex-col justify-center items-center my-7 lg:max-w-6xl mx-auto">
        <div className=" hidden lg:block absolute -z-10">
          <img
            src="https://giasuongmattroi.com/static/images/bg-text-2.svg"
            alt=""
          />
        </div>
        <div className="flex flex-col items-center px-5 justify-center">
          <p className="font-corinthia text-5xl text-red-500">Các lớp học</p>
          <h2 className="font-semibold uppercase text-center text-4xl ">
            Chương trình học phù hợp
          </h2>
        </div>
        <div className="hidden lg:flex items-center justify-center gap-6 mt-5 cursor-pointer ">
          {dataStudyProgram.map((item) => (
            <div
              key={item.id}
              className={`flex overflow-visible items-center justify-center ${active === item.id ? "font-bold " : ""}`}
              onClick={() => setActive(item.id)}
            >
              <span className="text-2xl mr-3">{item.label}</span>
              <button className="rounded-full bg-blue-400 h-2.5 w-2.5 opacity-80"></button>
            </div>
          ))}
        </div>
        {/* options for mobile */}
        <div className="lg:hidden">
          <select
            value={active}
            className="w-full h-10 px-3 py-1 my-5 border border-input bg-transparent text-base rounded-2xl shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:ring-2"
            onChange={(e) => setActive(Number(e.target.value))}
          >
            {dataStudyProgram.map((item) => (
              <option value={item.id}>{item.label} </option>
            ))}
          </select>
        </div>

        <section className="relative w-full my-3 px-5">
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative grid items-center gap-4 md:grid-cols-1 lg:grid-cols-2 justify-self-center px-5 md:px-0 z-10"
              >
                {/* IMAGE */}
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex justify-center"
                >
                  <div className="relative w-full max-w-[430px]">
                    <div className="absolute inset-0 bg-blue-200 max-w-[450px] pt-[76%] -z-10 -skew-y-7 skew-x-9" />

                    <div
                      className="w-full max-w-[430px] lg:h-[329px] pt-[76%] bg-no-repeat bg-cover bg-center"
                      style={{ backgroundImage: `url(${activeProgram.img})` }}
                    />
                  </div>
                </motion.div>

                {/* TEXT */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="px-1 flex flex-col gap-4 my-7 text-[18px]"
                >
                  <h2 className="font-corinthia font-bold text-5xl text-red-900">
                    Gia sư {activeProgram.label}
                  </h2>

                  <p>{activeProgram.des.p1}</p>

                  <ul className="list-disc pl-5 space-y-1">
                    {activeProgram.des.lists.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  <p>{activeProgram.des.p2}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <Button
              variant="ghost"
              className="relative w-fit mx-auto my-5 flex items-center overflow-hidden h-11 rounded-[999px] bg-red-600 text-white border border-red-600 shadow-accent-foreground before:absolute before:inset-0 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-300 before:z-0
            hover:before:scale-x-100 hover:text-red-600 hover:border-white shadow-[2px_2px_0_rgba(239,68,68,0.9)]  "
            >
              <span className="relative z-10">Tìm hiểu thêm</span>
              <ArrowRight className="relative z-10" />
            </Button>
          </div>
        </section>
      </section>
      {/* Lớp hiện có cần tìm gia sư */}
      <AvailableClastList options={options} classList={classes.slice(0, 6)} />
      <Button
        variant="ghost"
        className="relative w-fit mx-auto my-7 flex items-center overflow-hidden h-11 rounded-[999px] bg-red-600 text-white border border-red-600 shadow-accent-foreground before:absolute before:inset-0 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-300 before:z-0
            hover:before:scale-x-100 hover:text-red-600 hover:border-white shadow-[2px_2px_0_rgba(239,68,68,0.9)]  "
      >
        <Link to={"/lop-hien-co"} className="relative z-10">
          Xem thêm
        </Link>
        <ArrowRight className="relative z-10" />
      </Button>

      {/* Đánh giá trung tâm */}
      <div className="flex flex-col justify-center items-center bg-amber-100/45 md:w-full">
        <div className="flex flex-col justify-center items-center max-w-[400px] md:max-w-6xl mx-auto md:px-5 py-5">
          <h3 className="font-corinthia font-medium text-4xl text-red-500">
            Phụ huynh nói gì về{" "}
          </h3>
          <h3 className="font-bold text-3xl">TRUNG TÂM CHÚNG TÔI</h3>

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="hidden md:block rounded-full p-2 bg-[#3333] text-white"
            >
              <ChevronLeft />
            </button>

            <div className="max-w-[350px] md:max-w-full mx-auto">
              <div
                ref={containerRef}
                className=" flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
              >
                {descriptions.map((item, index) => (
                  <div
                    key={index}
                    ref={(el) => (itemRefs.current[index] = el)}
                    className=" min-w-full snap-center flex flex-col gap-6 bg-white p-7 mt-4 shadow-xl  "
                  >
                    <div className="flex gap-6">
                      {/* avatar */}
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-14 h-14 rounded-full object-cover"
                      />

                      {/* meta */}
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="italic">{item.label}</p>
                      </div>
                    </div>

                    {/* description */}
                    <blockquote>"{item.des}"</blockquote>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={next}
              className="hidden md:block rounded-full p-2 bg-[#3333] text-white"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
      {/* form đăng ký */}
      <div>
        <RegisterForm />
      </div>
    </>
  );
};

export default Homepage;
