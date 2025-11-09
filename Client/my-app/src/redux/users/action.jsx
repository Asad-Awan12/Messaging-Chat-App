import { toast } from "react-toastify";
import { getAllUsers, login } from "../../routes/routes";
import { getApi, postApi } from "../../utils/api_methods";
import { failure, request, success } from "../builder";

export const loginUser = (credentials) => async (dispatch) => {
  dispatch(request({ type: "LOGIN_REQUEST" }));

  try {
    const admin = await postApi({
      url: login,
      credentials, // or data: credentials
    });
    localStorage.setItem("admin", JSON.stringify(admin));

    dispatch(success({ type: "LOGIN_SUCCESS", success: admin }));
    return admin;
  } catch (error) {
    dispatch(failure({ type: "LOGIN_FAILURE", error: error }));
    throw error;
  }
};

export const getUsers = () => async (dispatch) => {
  dispatch(request({ type: "USERS_REQUEST" }));
  try {
    const users = await getApi({ url: getAllUsers });
    dispatch(success({ type: "USERS_SUCCESS", success: users }));
    return users;
  } catch (error) {
    dispatch(failure({ type: "USERS_FAILURE", error: error }));
    throw error;
  }
};

export const onlineFriends = (credentials) => async (dispatch) => {
  try {
    dispatch(request({ type: "ONLINE_REQUEST" }));
    const onlineUsers = credentials;

    dispatch(success({ type: "ONLINE_SUCCESS", success: onlineUsers }));
    return onlineUsers;
  } catch (error) {
    dispatch(failure({ type: "ONLINE_FAILURE", error }));
    throw error;
  }
};


// export const onlineFriends = (credentials) =>(dispatch) => {
//   dispatch(request({ type: "ONLINE" }));
//   try {
//     const onlineUsers = credentials;
//     dispatch(success({ type: "ONLINE", success: onlineUsers }));
//     return onlineUsers
//   } catch (error) {
//     dispatch(failure({ type: "ONLINE", error: error }));
//     throw error;
//   }
// };

export const logout = () => ({
  type: "LOGOUT",
});
