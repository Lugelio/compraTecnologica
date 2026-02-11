import Header from "./header/Header";
import Footer from "./footer/footer";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function MainLayout() {
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setMsg(location.state.message);
      setShowToast(true);

      const timer = setTimeout(() => {
        setShowToast(false);
        window.history.replaceState({}, document.title);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    /* 1. Usamos la clase .layout que tiene el display: flex y min-height: 100vh */
    <div className="layout"> 
      <Header />
      
      {/* Contenedor de Toast */}
      <div className="position-relative">
        <div className="toast-container position-absolute top-0 start-50 translate-middle-x p-3">
          <div className={`toast align-items-center text-white bg-info border-0 ${showToast ? 'show' : 'hide'}`} role="alert">
            <div className="d-flex">
              <div className="toast-body fw-bold">
                {msg}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Envolvemos el Outlet en un div con la clase .content (la que tiene el flex: 1) */}
      <div className="content">
        <Outlet /> 
      </div>

      <Footer/>
    </div>
  );
}

export default MainLayout;