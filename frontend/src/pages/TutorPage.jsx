import { getTutor } from "@/service/tutorService";
import React, { useEffect, useState } from "react";

const Tutorpage = () => {
  const [tutors, setTutors] = useState([]);
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await getTutor();
        setTutors(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTutor();
  }, []);
  return (
    <div>
      <div className="bg-red-500 w-full h-60">
        {tutors.map((tutor) => (
          <div className="flex gap-4">
            <p>{tutor.ho_ten}</p>
            <p>{tutor.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutorpage;
