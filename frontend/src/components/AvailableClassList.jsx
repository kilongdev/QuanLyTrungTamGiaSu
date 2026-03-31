import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { SendIcon } from "lucide-react";

const AvailableClastList = ({ classList }) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center mb-8 mx-auto max-w-5xl px-4">
        {classList.length === 0 && (
          <div className=" font-bold text-[18px] text-red-500 italic">
            Không tìm thấy lớp hoặc lớp đã hết!
          </div>
        )}

        {/* Card list */}
        <div className="mt-10 w-full">
          <div className="relative w-full">
            <div
              className={`relative grid gap-10 px-5 md:px-0 z-10 place-items-center ${
                classList.length === 1
                  ? "grid-cols-1"
                  : "md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {classList.map((item) => (
                <div
                  key={item.lop_hoc_id}
                  className="relative w-full max-w-[400px]"
                >
                  <div className="absolute inset-0 bg-blue-200 max-w-[420px] -z-10 -skew-y-6 skew-x-6 rounded-xl" />

                  {/* card */}
                  <div className="bg-white relative w-full max-w-[400px] p-5 border border-[#ccc] rounded-xl shadow-md z-20 flex flex-col h-[420px]">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-bold text-2xl ">
                        MSL:{" "}
                        <span className="text-red-600">{item.lop_hoc_id}</span>
                      </h2>
                      <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-600">
                        {Number(item.gia_moi_buoi).toLocaleString("vi-VN")}đ /
                        buổi
                      </span>
                    </div>

                    <ul className="space-y-1 text-[15px] list-disc marker:text-blue-600">
                      <li>
                        <b>Gia sư:</b> {item.ten_gia_su || "Chưa có"} {" - "}
                        {item.bang_cap}
                      </li>

                      <li>
                        <b>Môn học:</b> {item.ten_mon_hoc}
                      </li>

                      <li>
                        <b>Khối lớp:</b> {item.khoi_lop}
                      </li>

                      <li>
                        <b>Số buổi học:</b> {item.so_buoi_hoc} buổi
                      </li>

                      <li>
                        <b>Số học viên tối đa:</b> {item.so_luong_toi_da}
                      </li>

                      <li>
                        <b>Số học viên hiện tại:</b> {item.so_luong_hien_tai}
                      </li>

                      <li>
                        <b>Học phí:</b>{" "}
                        {Number(item.gia_toan_khoa).toLocaleString("vi-VN")}đ
                      </li>
                      {/* 
                      <li>
                        <b>Trạng thái:</b> {item.trang_thai}
                      </li> */}
                    </ul>
                    <div className="mt-auto pt-2">
                      <Link
                        to={`/dang-ky-hoc-thu?source=available&MSL=${item.lop_hoc_id}`}
                        className="relative z-10"
                      >
                        <Button className="w-full h-10 rounded-full bg-red-600 text-white hover:bg-red-700">
                          Đăng ký học
                          <span>
                            <SendIcon size={22} />
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvailableClastList;
