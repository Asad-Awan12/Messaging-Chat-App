import React, { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { Bell, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
// import { getUsers, logout } from "../Redux/Auth/actions";
import { Link, useNavigate } from "react-router-dom";
import { getUsers, logout } from "../../redux/users/action";
// import ModalWrapper from "./ModelWraper";
// import UpdateProfileScreen from "../../pages/FriendRequestScreen";

const Header = ({ onMenuClick }) => {
  const getlocalUser = JSON.parse(localStorage.getItem("admin"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [friendList, setFriendList] = useState(false);

  const [allUsers, setAllUsers] = useState();
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await dispatch(getUsers());
      console.log("res", res);
      setAllUsers(res?.users);
    };

    fetchUsers();
  }, []);

  const matchedUsers = allUsers?.filter((user) =>

    user?.friends?.every(
      (friend) =>
        friend?._id?.toString() !== getlocalUser?.user?._id?.toString()
    )
  );

  const handleLogOut = () => {
    dispatch(logout());
    navigate("/login");
  };



  const handleFriends = () => {
    navigate("/update");
  };


  return (
    <header className="flex items-center justify-between bg-blue-600 text-white px-4 py-3 shadow">
      <div className="flex items-center gap-2">
        <button className="md:hidden p-2" onClick={onMenuClick}>
          ☰
        </button>
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          app
        </h1>
      </div>
      <div className="flex gap-4 items-center relative">
        <button
          className="hover:text-gray-200 cursor-pointer"
        // onClick={() => setFriendList((pre) => !pre)}
        >
          <Bell onClick={() => handleFriends()} />
        </button>
        {/* friend Requests */}
        {friendList && (
          <div className="absolute right-4 top-[4.5rem] sm:right-8 w-64 sm:w-80 md:w-96 min-h-[10rem] bg-white text-black rounded-lg shadow-lg z-50">
            {matchedUsers?.length > 0 ? (
              <div>
                <h1 className="text-xl px-5 py-5">Friends Suggestions</h1>
                {matchedUsers?.map((i) => (
                  <>
                    <div className="flex items-center space-x-4 p-4">
                      <img
                        src={i?.image}
                        alt="Profile"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium">
                          {i?.username} sent you a friend request
                        </p>
                      </div>
                      <button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm shadow-md transition">
                        Add Friend
                      </button>
                    </div>
                  </>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 px-2">
                No New users Friend Suggestions
              </p>
            )}

            {/* Menu Options
    <div className="border-t border-gray-200">
      <button className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-sm sm:text-base">
        Profile
      </button>
      <button className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-sm sm:text-base">
        Settings
      </button>
    </div> */}
          </div>
        )}

        <div
          onClick={() => setMenuOpen((pre) => !pre)}
          className="cursor-pointer"
        >
          <img
            src={getlocalUser?.user?.image || getlocalUser?.user?.profile}
            alt="Profile"
            class="w-12 h-12 rounded-full object-cover"
          />

          {/* <CgProfile size={30} /> */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50">
              <button className="block w-full px-4 py-2 hover:bg-gray-100 text-left">
                Profile
              </button>
              <button className="block w-full px-4 py-2 hover:bg-gray-100 text-left">
                Settings
              </button>
              <button
                onClick={handleLogOut}
                className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for UpdateProfileScreen */}
      {/* <ModalWrapper
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      >
        <UpdateProfileScreen />
      </ModalWrapper> */}
    </header>
  );
};

export default Header;
