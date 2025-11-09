import { getAllFriends, getFriendRequest } from "../../routes/routes";
import { getApi } from "../../utils/api_methods";
import socket from "../../utils/socket";
import { failure, request, success } from "../builder";

export const sendFriendRequest = (credentials) => (dispatch) => {
  console.log("🟢 sendFriendRequest called with", credentials);
  dispatch({ type: "SEND_REQUEST_START" });

  return new Promise((resolve, reject) => {
    try {
      socket.emit("sent_friend_request", credentials, (response) => {
        console.log("🟡 socket response:", response);

        if (response?.success) {
          dispatch({
            type: "SEND_REQUEST_SUCCESS",
            payload: credentials,
          });
          resolve(response);
        } else {
          const errorMessage = response?.message || "Request failed";
          dispatch({
            type: "SEND_REQUEST_FAIL",
            error: errorMessage,
          });
          console.log("🔴 rejecting promise with", errorMessage);
          reject(new Error(errorMessage)); // ⚠️ critical
        }
      });
    } catch (error) {
      console.log("🔴 exception caught in try/catch", error);
      dispatch({
        type: "SEND_REQUEST_FAIL",
        error: error.message,
      });
      reject(error);
    }
  });
};

export const getRequests = ()=> async(dispatch)=>{
  dispatch(request({type:"GET_FRIENDS_REQUETS"}))
  try {
    const getFriendRequets = await getApi({url:getFriendRequest}) 
    dispatch(success({type:"GET_FRIENDS_SUCCESS",success:getFriendRequets}))
    return getFriendRequets;
  } catch (error) {
    console.log("error ",error);
    dispatch(failure({type:"GET_FRIENDS_FAILURE"}))
    throw error
  }
}

export const AllFriends = ()=> async(dispatch)=>{
  dispatch(request({type:"GET_ALL_FRIENDS_REQUETS"}))
  try {
    const Friends = await getApi({url:getAllFriends}) 
    dispatch(success({type:"GET_ALL_FRIENDS_SUCCESS",success:Friends}))
    return Friends;
  } catch (error) {
    console.log("error ",error);
    dispatch(failure({type:"GET_ALL_FRIENDS_FAILURE"}))
    throw error
  }
}
