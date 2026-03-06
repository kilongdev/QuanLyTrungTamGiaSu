import React, { useState } from "react";
import { Button } from "./ui/button";
import { Filter, Search, SendIcon } from "lucide-react";
import { Input } from "./ui/input";

const AvailableClastList = ({ options, classList }) => {
  const [filters, setFilters] = useState({});

  return (
    <>
      <div className="flex flex-col items-center justify-center mb-8 mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center mb-6 text-center">
          <h2 className="font-corinthia text-red-500 text-5xl">Lớp hiện</h2>
          <p className="text-4xl uppercase font-semibold">Có tìm gia sư</p>
        </div>

        {/* Filter */}
        <div className="flex flex-col md:flex-row gap-2 justify-center items-center w-full">
          <label className="font-bold md:w-[120px]">Tìm theo MSL:</label>

          <Input
            className="md:w-[460px] focus-visible:ring-blue-500 focus-visible:ring-2 rounded-3xl h-10"
            placeholder="Mã số lớp"
          />

          <Button className="rounded-3xl bg-red-600 hover:bg-red-600 px-6 h-11 w-[260px]">
            <Search />
            <span className="font-semibold">Tìm</span>
          </Button>
        </div>
        {/* filter options */}
        <div>
          <div className="my-5 grid grid-cols-2 sm:flex gap-4">
            {/* gia su */}
            {options.map((item) => (
              <select
                key={item.name}
                name={item.name}
                value={filters[item.name] || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    [item.name]: e.target.value,
                  })
                }
                id={item.name}
                className="w-full h-10 px-3 py-1 border border-input bg-transparent text-base rounded-2xl shadow-sm focus-visible:outline-none focus-visible:ring-blue-500 focus-visible:ring-2"
              >
                <option value="">{item.label}</option>

                {item.values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            ))}

            <Button className="flex w-full h-10 px-3 py-1 bg-white text-black text-3xl text-base rounded-2xl items-center justify-center ring-2 ring-red-600 hover:bg-white">
              Bỏ lọc
            </Button>
            <Button className="flex w-full h-10 px-3 py-1 text-base rounded-2xl items-center justify-center ring-2 ring-red-600 bg-red-600 hover:bg-red-600 text-3xl">
              <Filter />
              <span>Lọc lựa chọn</span>
            </Button>
          </div>
        </div>

        {/* Card list */}
        <div className="mt-10 w-full">
          <div className="relative w-full">
            <div className="relative grid md:grid-cols-1 lg:grid-cols-2 items-start gap-10 justify-self-center px-5 md:px-0 z-10">
              {classList.map((item) => (
                <div key={item.code} className="relative w-full max-w-[400px]">
                  <div className="absolute inset-0 bg-blue-200 max-w-[420px] -z-10 -skew-y-6 skew-x-6 rounded-xl" />

                  {/* card */}
                  <div className="bg-white relative w-full max-w-[400px] p-5 border border-[#ccc] rounded-xl shadow-md z-20 flex flex-col h-[420px]">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-bold text-2xl ">
                        MSL: <span className="text-red-600">{item.code}</span>
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
                        <b>Dạy:</b> {item.subject} {item.grade}
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
