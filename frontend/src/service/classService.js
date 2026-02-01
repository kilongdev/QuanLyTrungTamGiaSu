import axios from "axios";
import { options, classList } from "@/data/availableClassData";

// mock mode (DEV)
export const getAvailableClasses = async () => {
  return Promise.resolve({
    data: classList,
  });
};

export const getFilterOptions = async () => {
  return Promise.resolve({
    data: options,
  });
};
