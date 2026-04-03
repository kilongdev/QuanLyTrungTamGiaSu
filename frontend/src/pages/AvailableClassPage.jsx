import AvailableClastList from "@/components/AvailableClassList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { lopHocAPI } from "@/api/lophocApi";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const AvailableClassPage = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const [options, setOptions] = useState([]);
  const [filters, setFilters] = useState({});

  const [searchCode, setSearchCode] = useState("");
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const itemPerPage = 12;
  const totalPages = Math.ceil(total / itemPerPage);

  // Lấy lớp học
  const getClasses = async (
    overrideFilters = null,
    overrideSearchCode = null,
    page = currentPage,
  ) => {
    try {
      const classRes = await lopHocAPI.getAll({ excludeDong: true });

      let data = classRes.data || classRes || [];

      const subjects = new Set();
      const grades = new Set();
      data.forEach((item) => {
        if (item.ten_mon_hoc) subjects.add(item.ten_mon_hoc);
        if (item.khoi_lop) grades.add(item.khoi_lop);
      });

      const dynamicOptions = [
        {
          name: "monhoc",
          label: "Môn học",
          values: Array.from(subjects).sort(),
        },
        {
          name: "lop",
          label: "Khối lớp",
          values: Array.from(grades).sort(),
        },
      ];

      setOptions(dynamicOptions);

      const currentFilters =
        overrideFilters !== null ? overrideFilters : filters;
      const currentSearchCode =
        overrideSearchCode !== null ? overrideSearchCode : searchCode;

      // SEARCH theo MSL
      if (currentSearchCode) {
        data = data.filter((item) =>
          String(item.lop_hoc_id)
            .toLowerCase()
            .includes(currentSearchCode.toLowerCase()),
        );
      }

      // FILTER
      data = data.filter((item) => {
        if (currentFilters.lop && item?.khoi_lop !== currentFilters.lop)
          return false;

        if (
          currentFilters.monhoc &&
          item?.ten_mon_hoc !== currentFilters.monhoc
        )
          return false;

        return true;
      });

      const start = (page - 1) * itemPerPage;
      const end = start + itemPerPage;

      setClasses(data.slice(start, end));
      setTotal(data.length);
    } catch (error) {
      console.error("Lấy danh sách lớp học thất bại!", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClasses();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  useEffect(() => {
    getClasses();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    getClasses(null, null, 1);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    getClasses(null, null, 1);
  };

  const getPagination = (currentPage, totalPages) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pages = getPagination(currentPage, totalPages);

  if (loading) return <p>Loading...</p>;

  return (
    <>
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
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />

        <Button
          type="button"
          className="rounded-3xl bg-red-600 hover:bg-red-600 px-6 h-11 w-[260px]"
          onClick={handleSearch}
        >
          <Search />
          <span className="font-semibold">Tìm</span>
        </Button>
      </div>
      {/* filter options */}
      <div className="flex flex-col items-center justify-center mb-8 mx-auto max-w-5xl px-4">
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

          <Button
            type="button"
            onClick={() => {
              setFilters({});
              setSearchCode("");
              setCurrentPage(1);
              getClasses({}, "", 1);
            }}
            className="flex w-full h-10 px-3 py-1 bg-white text-black text-3xl text-base rounded-2xl items-center justify-center ring-2 ring-red-600 hover:bg-white"
          >
            Bỏ lọc
          </Button>
          <Button
            type="button"
            onClick={handleFilter}
            className="flex w-full h-10 px-3 py-1 text-base rounded-2xl items-center justify-center ring-2 ring-red-600 bg-red-600 hover:bg-red-600 text-3xl"
          >
            <Filter />
            <span>Lọc lựa chọn</span>
          </Button>
        </div>
      </div>
      <AvailableClastList classList={classes} />

      {/* pagination */}
      {totalPages !== 0 && (
        <div className="flex gap-3 items-center justify-center my-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={cn(
              "rounded-full bg-red-600 p-2",
              currentPage === 1 && "opacity-50 cursor-not-allowed",
            )}
          >
            <ChevronLeft />
          </button>

          {/* <span className="font-bold">
            {currentPage} / {totalPages}
          </span> */}

          <div className="flex gap-2">
            {pages.map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-full",
                    currentPage === page
                      ? "bg-red-600 text-white"
                      : "bg-gray-200",
                  )}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={cn(
              "rounded-full bg-red-600 p-2",
              currentPage === totalPages && "opacity-50 cursor-not-allowed",
            )}
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </>
  );
};

export default AvailableClassPage;
