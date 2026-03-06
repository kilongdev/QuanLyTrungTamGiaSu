import Footer from "@/components/Footer";
import Header from "@/components/Header/Header";
import React from "react";
import { Outlet } from "react-router-dom";

const Layouts = ({ user, onLogin, onRegister, onLogout }) => {
  return (
    <div>
      <Header 
        user={user} 
        onLogin={onLogin} 
        onRegister={onRegister} 
        onLogout={onLogout} 
      />

      <Outlet />
      <Footer />
    </div>
  );
};

export default Layouts;
