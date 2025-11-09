import { Routes, Route, Navigate, Router, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import App from "./App";
import Login from "./pages/Auth/Login";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import socket from "./utils/socket";
import { useState } from "react";
import UpdateProfileScreen from "./pages/FriendRequestScreen";
import ChatContent from "./components/Chat";
import { AllChatRooms } from "./redux/chat/action";
import { useDispatch } from "react-redux";
import { onlineFriends } from "./redux/users/action";

const AppRoutes = () => {
  const user = JSON.parse(localStorage.getItem("admin"));
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchChats = dispatch(AllChatRooms())
    console.log("fetchChatsRooms ", fetchChats);
  }, [])

  // socket connect immediately when we login
  useEffect(() => {
    if (user?.accessToken) {
      socket.auth = { token: user.accessToken };
      socket.connect();
    }
  }, [user?.accessToken]);

  useEffect(() => {
    if (user?.accessToken) {
      socket.on("online_user", (users) => {
        console.log("users ", users);
        dispatch(onlineFriends(users))
      });
      socket.on("disconnect_user", (data) => {
        dispatch(onlineFriends(data))
      });
      return () => {
        socket.off("online_user");
        socket.off("disconnect_user");
      };
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);


  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route path="/" element={<Home/>}>
            <Route index element={<ChatContent />} />
            <Route path="chat/:receiverId" element={<ChatContent />} />
          </Route>
          <Route path="/update" element={<UpdateProfileScreen />} />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
};

export default AppRoutes;
