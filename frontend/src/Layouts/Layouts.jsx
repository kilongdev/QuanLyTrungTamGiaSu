import Footer from "@/components/Footer";
import Header from "@/components/Header/Header";
import Homepage from "@/pages/HomePage";
import React from "react";
import { Outlet } from "react-router-dom";

const Layouts = () => {
  return (
    <div>
      <Header />

      <Outlet />
      <Footer />
    </div>
  );
};

export default Layouts;
