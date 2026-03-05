import axios from "axios";
import { options, classList } from "@/data/availableClassData";

// // mock mode (DEV)
export const getAvailableClasses = async (param = {}) => {
  const {
    page = 1,
    limit = 10,
    searchCode = "",
    gioitinh,
    tinhthanh,
    lop,
    giasu,
    monhoc,
  } = param;

  let filteredData = [...classList];

  //  SEARCH theo MSL
  if (searchCode) {
    filteredData = filteredData.filter((item) =>
      item.lop_hoc_id?.toLowerCase().includes(searchCode.toLowerCase()),
    );
  }

  // Lọc nâng cao
  filteredData = filteredData.filter((item) => {
    if (gioitinh && item?.requirement?.gender !== gioitinh) return false;
    if (tinhthanh && item?.location?.district !== tinhthanh) return false;
    if (lop && item?.grade !== lop) return false;
    if (giasu && item?.requirement?.role !== giasu) return false;
    if (monhoc && item?.subject !== monhoc) return false;

    return true;
  });

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginationData = filteredData.slice(start, end);

  return Promise.resolve({
    data: paginationData,
    total: filteredData.length,
    page,
    limit,
  });
};

export const getFilterOptions = async () => {
  return Promise.resolve({
    data: options,
  });
};
