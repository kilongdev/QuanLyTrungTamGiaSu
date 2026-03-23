import Banner from "@/components/Banner";
import { Button } from "@/components/ui/button";
import { AnimatePresence, animations, motion, transform } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import RegisterForm from "@/components/ContactForm";
import { dataStudyProgram, descriptions } from "@/data/homepageData";
import AvailableClastList from "@/components/AvailableClassList";
import { lopHocAPI } from "@/api/lophocApi";
import GiaSuTieuBieu from "@/components/GiaSuTieuBieu";
import { giaSuAPI } from "@/api/giaSuApi";

const Homepage = () => {
  const [active, setActive] = useState(0);
  const activeProgram = dataStudyProgram.find((item) => item.id === active);
  console.log(activeProgram);

  // const [startIndex, setStartIndex] = useState(0);
  const [descIndex, setDescIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);

  const getAvatarInitials = (name) => {
    if (!name || typeof name !== "string") return "";

    const words = name.trim().split(/\s+/);
    const lastWord = words[words.length - 1];

    return lastWord.charAt(0).toUpperCase();
  };
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [tutors, setTutors] = useState([]);

  // đánh giá của phụ huynh
  const totalDes = descriptions.length;

  const getActiveItem = (data, currentIndex) => {
    if (!data || data.length === 0) return null;
    // Đảm bảo index luôn nằm trong phạm vi mảng
    const safeIndex = Math.abs(currentIndex) % data.length;
    return data[safeIndex];
  };
  const handleNext = () => {
    setDescIndex((prev) => (prev + 1) % totalDes);
  };

  const handlePrev = () => {
    setDescIndex((prev) => (prev === 0 ? totalDes - 1 : prev - 1));
  };

  const activeItem = getActiveItem(descriptions, descIndex);
  if (!activeItem) return null;

  useEffect(() => {
    const getClasses = async () => {
      try {
        setLoading(true);

        const res = await lopHocAPI.getAll();
        setClasses(res.data);
      } catch (error) {
        console.error("Lấy danh sách lớp học thất bại!", error);
      } finally {
        setLoading(false);
      }
    };
    getClasses();
  }, []);
  useEffect(() => {
    const getTutor = async () => {
      try {
        const res = await giaSuAPI.getAll();

        setTutors(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin gia sư!", error);
      }
    };

    getTutor();
  }, []);
  console.log("tutors", tutors);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Banner />
      {/* Dịch vụ gia sư   */}
      <section className="relative flex flex-col justify-center items-center my-7 lg:max-w-6xl mx-auto">
        {/* <div className=" hidden lg:block absolute -z-10">
          <img
            src="https://giasuongmattroi.com/static/images/bg-text-2.svg"
            alt=""
          />
        </div> */}
        <div className="flex flex-col items-center px-5 justify-center">
          <p className="font-corinthia text-5xl text-red-500">Các lớp học</p>
          <h2 className="font-semibold uppercase text-center text-4xl ">
            Chương trình học phù hợp
          </h2>
        </div>
        {/* <div className="hidden lg:flex items-center justify-center gap-6 mt-5 cursor-pointer ">
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
        </div> */}
        {/* options for mobile */}
        {/* <div className="lg:hidden">
          <select
            value={active}
            className="w-full h-10 px-3 py-1 my-5 border border-input bg-transparent text-base rounded-2xl shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:ring-2"
            onChange={(e) => setActive(Number(e.target.value))}
          >
            {dataStudyProgram.map((item) => (
              <option value={item.id}>{item.label} </option>
            ))}
          </select>
        </div> */}

        {/* <section className="relative w-full my-3 px-5">
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
        </section> */}
      </section>
      {/* Lớp hiện có cần tìm gia sư */}
      <AvailableClastList classList={classes.slice(0, 6)} />
      {classes.length !== 0 && (
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
      )}
      {/* Gia sư tiêu biểu */}
      <section className="relative flex flex-col justify-center items-center my-7 lg:max-w-6xl mx-auto">
        <div className=" hidden lg:block absolute -z-10">
          <img
            src="https://giasuongmattroi.com/static/images/bg-text-2.svg"
            alt=""
          />
        </div>
        <div className="flex flex-col items-center px-5 justify-center">
          <GiaSuTieuBieu tutor={tutors?.slice(0, 6) || []} />
        </div>
      </section>
      {/* Đánh giá trung tâm */}
      <div className="flex flex-col justify-center items-center bg-amber-100/45 w-full py-10">
        <div className="flex flex-col justify-center items-center max-w-[400px] md:max-w-6xl mx-auto md:px-5 py-5">
          <div className="text-center mb-12">
            <h3 className="font-corinthia text-5xl text-red-500">
              Phụ huynh nói gì về
            </h3>
            <h2 className="font-bold text-3xl uppercase tracking-wide">
              Trung tâm chúng tôi
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handlePrev}
              className="hidden md:block p-4 bg-white rounded-full shadow-lg hover:bg-gray-50 active:scale-90 transition-all text-gray-600 shrink-0 border border-gray-100"
            >
              <ChevronLeft size={28} />
            </button>

            <div className="max-w-[350px] md:max-w-full mx-auto">
              <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl border border-gray-50 flex flex-col gap-8 min-h-[350px] transition-all duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-18 h-18 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-3xl ring-4 ring-red-100 shadow-inner">
                    {getAvatarInitials(activeItem.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl text-gray-800">
                      {activeItem.name}
                    </h4>
                    <p className="text-sm italic text-red-500 font-medium">
                      {activeItem.label}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="text-6xl text-red-100 absolute -top-8 -left-6 font-serif">
                    “
                  </span>
                  <p className="text-gray-600 italic text-xl leading-relaxed relative z-10">
                    {activeItem.des}
                  </p>
                  <span className="text-6xl text-red-100 absolute -bottom-12 -right-6 font-serif">
                    ”
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className=" hidden md:block p-4 bg-white rounded-full shadow-lg hover:bg-gray-50 active:scale-90 transition-all text-gray-600 shrink-0 border border-gray-100"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          <div className="flex justify-center gap-3 mt-10">
            {descriptions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setDescIndex(idx)}
                className={`h-2.5 transition-all duration-300 rounded-full ${
                  descIndex === idx
                    ? "bg-red-500 w-8"
                    : "bg-gray-300 w-2.5 hover:bg-gray-400"
                }`}
              />
            ))}
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
