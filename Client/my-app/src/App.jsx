import React from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";
import { auth_Loader } from "./pages/selectors";
import { useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";

const App = () => {
  
  const user = JSON.parse(localStorage.getItem("admin"));
  const navigate = useNavigate();

  const location = useLocation();



  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <>
      <Outlet />
    </>
  );
};

export default App;
