import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GiaSuTieuBieu = ({ tutor = [] }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const tutorList = Array.isArray(tutor) ? tutor : [];
  const canNavigate = tutorList.length > itemsPerPage;

  const getAvatarInitials = (name) => {
    if (!name || typeof name !== "string") return "";

    const words = name.trim().split(/\s+/);
    const lastWord = words[words.length - 1];

    return lastWord.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!tutorList.length) {
      setStartIndex(0);
      return;
    }
    if (startIndex >= tutorList.length) {
      setStartIndex(0);
    }
  }, [tutorList.length, startIndex]);

  const handleNext = () => {
    if (!canNavigate) return;
    setStartIndex((prev) => (prev + 1) % tutorList.length);
  };

  const handlePrev = () => {
    if (!canNavigate) return;
    setStartIndex((prev) => (prev === 0 ? tutorList.length - 1 : prev - 1));
  };

  // tutors hiển thị
  const visibleTutors = [];

  const displayedCount = Math.min(itemsPerPage, tutorList.length);
  for (let i = 0; i < displayedCount; i++) {
    visibleTutors.push(tutorList[(startIndex + i) % tutorList.length]);
  }

  return (
    <div className="flex flex-col items-center mb-12 mx-auto max-w-6xl px-4 lg:w-[750px] md:w-[650px]">
      <h2 className="text-6xl font-bold my-7 text-blue-800 font-corinthia">
        Gia Sư Tiêu Biểu
      </h2>

      <div className="flex items-center gap-4 w-full">
        <button
          onClick={handlePrev}
          disabled={!canNavigate}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft />
        </button>

        {/* cards */}
        <div
          className={`grid gap-6 w-full ${
            itemsPerPage === 1
              ? "grid-cols-1"
              : itemsPerPage === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {visibleTutors.length ? (
            visibleTutors.map((t, index) => (
            <div
              key={t?.gia_su_id || `tutor-${index}`}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 flex flex-col items-center"
            >
              {/* <img
                src={getAvatarInitials(t?.ho_ten)}
                alt={getAvatarInitials(t?.ho_ten)}
                className="w-24 h-24 rounded-full mb-4 text-center"
              /> */}
              <div className=" text-black w-24 h-24 rounded-full flex items-center justify-center font-bold text-4xl shadow-md mb-5 ring-1 ring-red-300">
                {getAvatarInitials(t?.ho_ten)}
              </div>

              <h3 className="text-lg font-semibold">{t?.ho_ten}</h3>

              <p className="text-sm text-gray-500">{t?.bang_cap}</p>

              <p className="text-sm text-gray-500">
                Kinh nghiệm: {t?.kinh_nghiem ?? "Chưa cập nhật"}
              </p>

              {/* rating
              <div className="flex items-center gap-1 mt-2 text-yellow-500">
                <Star size={16} fill="#facc15" />
                <span>
                  {parseFloat(t.diem_danh_gia_trung_binh || 0).toFixed(1)}
                </span>
              </div> */}

              {/* button */}
              {/* <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                Xem hồ sơ
              </button> */}
            </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl shadow-md p-6 text-center text-gray-500">
              Hiện chưa có gia sư tiêu biểu.
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!canNavigate}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default GiaSuTieuBieu;
