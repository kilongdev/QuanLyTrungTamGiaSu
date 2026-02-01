import React from "react";

const FeesPage = () => {
  return (
    <>
      <div
        className="w-full h-164 bg-no-repeat bg-cover bg-center relative "
        style={{
          backgroundImage:
            "url(https://giasuttv.net/wp-content/uploads/2021/06/187146168_533083834731948_1070615797217668237_n.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 h-full flex flex-col justify-center px-10 text-white">
          <h1 className="text-3xl font-semibold mb-7">
            Tìm gia sư dạy kèm tại nhà chất lượng
          </h1>

          <div className="flex gap-4">
            <button className="bg-red-500 px-6 py-3 rounded-[50px]">
              Gửi yêu cầu gọi lại tư vấn
            </button>
            <button className="bg-white text-red-500 px-6 py-3 rounded-[50px]">
              Xem học phí
            </button>
          </div>
        </div>
        <div className="relative z-10">
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 md:translate-y-1/2 bg-blue-100 w-[90%] max-w-4xl rounded-2xl shadow-xl p-10 z-20 ">
            <h2 className="text-2xl font-semibold text-center">
              Bảng giá gia sư dạy kèm tại nhà
            </h2>
            <p className="text-center text-black mt-1">(Học phí mới nhất)</p>
          </div>
        </div>
      </div>
      <div className="pt-40">
        <div className="border border-red-500">
          <p>
            <span className="text-red-700">
              {"( "}
              <span>Kí hiệu: </span>
              {"2b/tuần"}
            </span>
            {" = học 2 buổi 1 tuần; "}

            <span className="text-red-700">{"3b/tuần"}</span>
            {" = học 3 buổi 1 tuần"}
            <span>{")"}</span>
            <br />
          </p>
        </div>
      </div>
    </>
  );
};

export default FeesPage;
