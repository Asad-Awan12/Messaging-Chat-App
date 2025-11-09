import React, { useState } from "react";
import { useEffect } from "react";
// import { getUsers } from "../Redux/Auth/actions";
import { useDispatch, useSelector } from "react-redux";
// import { allChats } from "./Selectors";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AllFriends } from "../redux/FriendRequest/action";
import { getAllMessages, SingleUserRoom } from "../redux/chat/action";
import socket from "../utils/socket";
import { all_users_messages, latest_message, onlineFriends } from "../pages/selectors";

const Sidebar = ({ isOpen, onClose }) => {
  const isOnline = useSelector(onlineFriends)
  

  const latest = useSelector(latest_message);
  const allUsersMessages = useSelector(all_users_messages)
  console.log("allUsersMessages ", allUsersMessages);


  const getlocalUser = JSON.parse(localStorage.getItem("admin"));

  const [allUsers, setAllUsers] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [allMessages, setAllMessges] = useState("")
  const [latestMessage, setLatestMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [latestMsg, setLatestMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    if (!allUsersMessages) {
      dispatch(getAllMessages());
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await dispatch(AllFriends());
      setAllUsers(res);
    };

    fetchMessages();
  }, [])
  const handleRoom = (friendId) => {
    dispatch(SingleUserRoom({ receiverId: friendId, senderId: getlocalUser?.user?._id }))
    navigate(`/chat/${friendId}`);
  };

  useEffect(() => {
    socket.on("typing", ({ senderId }) => {
      setTypingUsers((prev) =>
        prev.includes(senderId) ? prev : [...prev, senderId]
      );
    });

    socket.on("stop_typing", ({ senderId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== senderId));
    });

    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, []);


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-full w-64 bg-gray-100  border-r overflow-y-auto transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-2 pt-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded"
          />
        </div>

        {(allUsers || [])?.length > 0 ? (
          <ul className="">
            {(allUsers || [])?.map((user) => {
              return (
                <li
                  key={user?._id}
                  onClick={() => handleRoom(user?._id)}
                  className="flex items-center p-2 space-x-3 rounded hover:bg-blue-100 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={user?.profile}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline?.includes(user?._id) ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="font-medium">{user?.username}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[150px]">
                      {typingUsers.includes(user?._id) ? "typing..." : user?.latestMessage?.content || "No messages yet"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 px-2">No users found</p>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
