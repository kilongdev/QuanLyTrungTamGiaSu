import React, { useEffect, useState } from "react";
import { giaSuAPI } from "@/api/giaSuApi";

const Tutorpage = () => {
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await giaSuAPI.getAll();

        setTutors(res.data || []);
      } catch (error) {
        console.log("Lỗi khi lấy danh sách gia sư:", error);
      }
    };

    fetchTutors();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách gia sư</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tutors.map((tutor) => (
          <div
            key={tutor.id}
            className="border p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            <p className="font-bold text-lg">{tutor.ho_ten}</p>

            <p>Email: {tutor.email}</p>

            <p>SĐT: {tutor.so_dien_thoai}</p>

            <p>Địa chỉ: {tutor.dia_chi}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutorpage;
