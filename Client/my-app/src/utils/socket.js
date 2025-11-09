// socket.js
import { io } from "socket.io-client";
// let getlocalUser;
// if (typeof window !== "undefined") {
//    getlocalUser = JSON.parse(localStorage.getItem("admin"));
// }
  // const token = getlocalUser?.accessToken

const socket = io("http://localhost:8000"); 

export default socket;


