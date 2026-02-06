import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Layouts from "./Layouts/Layouts";
import Homepage from "./pages/HomePage";
import Tutorpage from "./pages/TutorPage";
import Introduce from "./pages/Introduce";
import FeesPage from "./pages/FeesPage";
import ContactPage from "./pages/ContactPage";
import AvailableClassPage from "./pages/AvailableClassPage";
import RegisterforATrialClass from "./pages/RegisterforATrialClass";
import AdminDashboard from "./pages/AdminDashboard";
import GiaSuDashboard from "./pages/GiaSuDashboard";
import PhuHuynhDashboard from "./pages/PhuHuynhDashboard";
import AuthModal from "./components/AuthModal";
import { Toaster } from "sonner";

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  // Kiểm tra token đã lưu
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      console.log("=== APP LOADED ===");
      console.log("Saved User:", JSON.parse(savedUser));
      console.log("Token:", token);
    }
  }, []);

  const handleAuthSuccess = (data) => {
    console.log("=== LOGIN SUCCESS ===");
    console.log("Response data:", data);
    console.log("User:", data.user);
    console.log("Token:", data.token);

    setUser(data.user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    console.log("=== LOGOUT ===");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const openLogin = () => {
    setAuthTab("login");
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthTab("register");
    setShowAuthModal(true);
  };

  // Component để bảo vệ route dashboard
  const DashboardRoute = () => {
    if (!user) {
      return <Navigate to="/" replace />;
    }

    switch (user.role) {
      case "admin":
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case "gia_su":
        return <GiaSuDashboard user={user} onLogout={handleLogout} />;
      case "phu_huynh":
        return <PhuHuynhDashboard user={user} onLogout={handleLogout} />;
      default:
        console.log("Unknown role:", user.role);
        return <Navigate to="/" replace />;
    }
  };

  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* Public routes với Layout */}
          <Route
            element={
              <Layouts
                user={user}
                onLogin={openLogin}
                onRegister={openRegister}
                onLogout={handleLogout}
              />
            }
          >
            <Route path="/" element={<Homepage />} />
            <Route path="/dich-vu-gia-su" element={<Tutorpage />} />
            <Route path="/ve-chung-toi" element={<Introduce />} />
            <Route path="/hoc-phi-gia-su" element={<FeesPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/lop-hien-co" element={<AvailableClassPage />} />
            <Route
              path="/dang-ky-hoc-thu"
              element={<RegisterforATrialClass />}
            />
          </Route>

          {/* Dashboard route - không dùng Layout */}
          <Route path="/dashboard" element={<DashboardRoute />} />
        </Routes>
      </BrowserRouter>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authTab}
      />
    </>
  );
}

export default App;
