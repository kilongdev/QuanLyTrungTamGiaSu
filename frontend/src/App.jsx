import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layouts from "./Layouts/Layouts";
import Homepage from "./pages/HomePage";
import Tutorpage from "./pages/Tutorpage";
import Introduce from "./pages/Introduce";
import FeesPage from "./pages/FeesPage";
import ContactPage from "./pages/ContactPage";
import AvailableClassPage from "./pages/AvailableClassPage";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          <Route element={<Layouts />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/dich-vu-gia-su" element={<Tutorpage />} />
            <Route path="/ve-chung-toi" element={<Introduce />} />
            <Route path="/hoc-phi-gia-su" element={<FeesPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/lop-hien-co" element={<AvailableClassPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
