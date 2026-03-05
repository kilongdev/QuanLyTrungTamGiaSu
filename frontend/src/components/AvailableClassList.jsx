import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SendIcon,
} from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { getAvailableClasses } from "@/service/classService";

const AvailableClastList = ({ classList }) => {
  //lọc
  // const [filters, setFilters] = useState({});
  // const [searchCode, setSearchCode] = useState("");

  // const [filterClassList, setFilterClassList] = useState(classList);

  // console.log("filters: ", filters);

  // // console.log("searchCode: ", searchCode);

  // // console.log("filterClassList: ", filterClassList);

  // // pagination
  // const [classes, setClasses] = useState([]);
  // const [total, setTotal] = useState(0);
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemPerPage = 10;
  // const totalPages = Math.ceil(total / itemPerPage);

  // useEffect(() => {
  //   fetchClasses();
  // }, [currentPage]);

  // const fetchClasses = async () => {
  //   try {
  //     const res = await getAvailableClasses({
  //       page: currentPage,
  //       limit: itemPerPage,
  //     });
  //     setClasses(res.data);
  //     setTotal(res.total);
  //   } catch (error) {
  //     console.error("Lỗi khi phân trang!");
  //   }
  // };

  // useEffect(() => {
  //   if (!searchCode) {
  //     setFilterClassList(classList);
  //   }
  // }, [searchCode, classList]);

  // // lọc theo MSL
  // const filterByMSL = () => {
  //   const result = classList.filter((item) =>
  //     item.lop_hoc_id?.toLowerCase().includes(searchCode.toLowerCase()),
  //   );
  //   setFilters({});
  //   setFilterClassList(result);
  // };

  // //lọc nâng cao
  // const filterClassByOptions = () => {
  //   const result = classList.filter((item) => {
  //     return Object.keys(filters).every((key) => {
  //       const value = filters[key];

  //       if (!value) return true;

  //       switch (key) {
  //         case "gioitinh":
  //           return item?.requirement?.gender === value;

  //         case "tinhthanh":
  //           return item?.location?.district === value;

  //         case "lop":
  //           return item?.grade === value;

  //         case "giasu":
  //           return item?.requirement?.role === value;

  //         case "monhoc":
  //           return item?.subject === value;

  //         default:
  //           return true;
  //       }
  //     });
  //   });
  //   setSearchCode("");
  //   setFilterClassList(result);
  // };

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
                  : "md:grid-cols-1 lg:grid-cols-2"
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
                        {item.fee}
                      </span>
                    </div>

                    <ul className="space-y-1 text-[15px] list-disc marker:text-blue-600">
                      <li>
                        <b>Yêu cầu:</b> {item.requirement.role} –{" "}
                        {item.requirement.gender}
                      </li>

                      <li>
                        <b>Môn:</b> {item.subject} {item.grade}
                      </li>

                      <li>
                        <b>Khu vực:</b> {item.location.address},{" "}
                        {item.location.ward}, {item.location.district}
                      </li>

                      <li>
                        <b>Buổi / tuần:</b> {item.schedule.sessionsPerWeek} buổi
                        ({item.schedule.durationPerSession}/buổi)
                      </li>

                      <li>
                        <b>Thời gian:</b>
                        <ul className="ml-5 list-disc">
                          {item.schedule.availableTime.map((t, i) => (
                            <li key={i}>
                              {t.day}: {t.time}
                            </li>
                          ))}
                        </ul>
                      </li>

                      <li>
                        <b>Học viên:</b> {item.student.quantity} -{" "}
                        {item.student.gender}
                      </li>

                      {item.note && (
                        <li>
                          <b>Ghi chú:</b> {item.note}
                        </li>
                      )}
                    </ul>

                    <div className="mt-auto pt-2">
                      <Button className="w-full h-10 rounded-full bg-red-600 text-white hover:bg-red-700">
                        Đăng ký dạy
                        <span>
                          <SendIcon size={22} />
                        </span>
                      </Button>
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
