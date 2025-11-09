import React, { useEffect } from "react";
import { getUsers } from "../../redux/users/action";
import { useDispatch, useSelector } from "react-redux";
import { userLoader, userState } from "../selectors";
import Loader from "../../common/Loader";
import Header from "../../components/Header/Header";
import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "../../components/sidebar";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const users = useSelector(userState);
  const usersLoaders = useSelector(userLoader);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  return (
    <>
      {/* <Header onMenuClick={toggleSidebar} /> */}
      <div className="h-screen flex flex-col">
        <Header onMenuClick={toggleSidebar} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
          <div className="flex flex-col flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
