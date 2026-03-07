import api from "@/lib/axios";

export const getClassesFee = async () => {
  try {
    const res = await api.get("/api/hocphi");
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy học phí!", error);
  }
};
