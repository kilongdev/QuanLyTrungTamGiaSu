import api from "@/lib/axios";
export const getTutor = async () => {
  try {
    const res = await api.get("/api/admin");
    return res.data;
  } catch (error) {
    console.error("Không thể lấy thông tin admin!", error);
  }
};
