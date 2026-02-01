import AvailableClastList from "@/components/AvailableClassList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAvailableClasses, getFilterOptions } from "@/service/classService";
import {
  CreditCard,
  DollarSign,
  FastForward,
  Filter,
  PlusSquare,
  Search,
  SendIcon,
  User2Icon,
  UserPen,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const AvailableClassPage = () => {
  // const [filters, setFilters] = useState({});

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [options, setOptions] = useState([]);

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
      <div className=" w-full">
        <img
          src="https://giasuongmattroi.com/wp-content/uploads/2017/07/lop-hien-co-tim-lop-day-kem.jpg"
          alt=""
          className=" w-full h-[240px] md:h-[360px] lg:h-[420px] object-cover"
        />
      </div>
      <section className=" bg-[#f4f4f4] pt-11 pb-8 mb-5 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center m-2 p-2">
            <div>
              <User2Icon size={50} className=" opacity-60" />
            </div>
            <div>
              <h3 className="font-semibold">
                <span>
                  Nhiều{" "}
                  <span className=" text-blue-700 uppercase">
                    lớp hiện có cần gia sư
                  </span>{" "}
                  cập nhật liên tục mỗi ngày
                </span>
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center text-center m-2 p-2">
            <div>
              <DollarSign size={50} className=" opacity-60" />
            </div>
            <div>
              <h3 className="font-semibold">
                <span>
                  Mức phí nhận lớp thấp{" "}
                  <span className=" text-red-500 uppercase">10% - 35%</span>
                </span>
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center text-center m-2 p-2">
            <div>
              <PlusSquare size={50} className=" opacity-60" />
            </div>
            <div>
              <h3 className="font-semibold">
                <span>
                  Lớp được{" "}
                  <span className=" text-orange-400 uppercase">
                    bảo hành lên tới 1 tháng
                  </span>
                </span>
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center text-center m-2 p-2">
            <div>
              <FastForward size={50} className=" opacity-60" />
            </div>
            <div>
              <h3 className="font-semibold">
                <span>
                  <span className=" text-purple-400  uppercase">
                    Hoàn phí nhanh chóng
                  </span>{" "}
                  khi lớp hỏng
                </span>
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center text-center m-2 p-2">
            <div>
              <CreditCard size={50} className=" opacity-60" />
            </div>
            <div>
              <h3 className="font-semibold">
                <span>
                  <span className=" text-green-400  uppercase">
                    Cam kết uy tín
                  </span>{" "}
                  trong việc giao lớp bằng CHUYỂN KHOẢN
                </span>
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center text-center m-2 p-2">
            <div>
              <UserPen size={50} className=" opacity-60" />
            </div>
            <div>
              <h3 className="font-semibold">
                <span>
                  <span className=" text-yellow-400  uppercase">
                    Tận tình hỗ trợ
                  </span>{" "}
                  gia sư trong quá trình nhận lớp và đi dạy
                </span>
              </h3>
            </div>
          </div>
        </div>
      </section>
      {/* filter */}
      <AvailableClastList options={options} classList={classes} />

      {/* form đăng ký dạy */}

      <form action=""></form>
    </>
  );
};

export default AvailableClassPage;
