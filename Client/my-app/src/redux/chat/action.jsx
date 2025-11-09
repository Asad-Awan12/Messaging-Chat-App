import { allRoomMessages, getAllChats, latest_Message, singleUsersRoom } from "../../routes/routes";
import { getApi, getByIdApi, postApi } from "../../utils/api_methods";
import { failure, request, success } from "../builder";

export const AllChatRooms = () => async (dispatch) => {
  dispatch(request({ type: "GET_CHAT_REQUETS" }))
  try {
    const allChats = await getApi({ url: getAllChats })
    dispatch(success({ type: "GET_CHAT_SUCCESS", success: allChats }))
    return allChats;
  } catch (error) {
    console.log("error ", error);
    dispatch(failure({ type: "GET_CHAT_FAILURE" }))
    throw error
  }
}

export const getAllMessages = () => async (dispatch) => {
  dispatch(request({ type: "GET_LATEST_MESSAGE_REQUETS" }))
  try {
    const latestMessage = await getApi({ url: latest_Message })
    dispatch(success({ type: "GET_LATEST_MESSAGE_SUCCESS", success: latestMessage }))
    return latestMessage;
  } catch (error) {
    console.log("error ", error);
    dispatch(failure({ type: "GET_LATEST_MESSAGE_FAILURE" }))
    throw error
  }
}

export const SingleUserRoom = (credentials) => async (dispatch) => {
  dispatch(request({ type: "GET_ROOM_REQUETS" }))
  try {
    const room = await postApi({ url: singleUsersRoom, credentials })
    dispatch(success({ type: "GET_ROOM_SUCCESS", success: room }))
    return room;
  } catch (error) {
    console.log("error ", error);
    dispatch(failure({ type: "GET_ROOM_FAILURE" }))
    throw error
  }
}

export const allMessages = (userId) => async (dispatch) => {
  dispatch(request({ type: "GET_ALL_MESSAGES_REQUETS" }))
  try {
    const allChatMessages = await getByIdApi({ url: allRoomMessages, credentials: userId })
    dispatch(success({ type: "GET_ALL_MESSAGES_SUCCESS", success: allChatMessages }))
    return allChatMessages;
  } catch (error) {
    console.log("error ", error);
    dispatch(failure({ type: "GET_ALL_MESSAGES_FAILURE" }))
    throw error
  }
}

export const latestMessage = (userId) => async (dispatch) => {
  dispatch(request({ type: "REQUEST_LATEST_MESSAGE" }))
  try {
    const message = await getByIdApi({ url: latest_Message, credentials: userId })
    console.log("mes ", message);

    dispatch(success({ type: "SUCCESS_LATEST_MESSAGE", success: message }))
    return message
  } catch (error) {
    dispatch(failure({ type: "FAILURE_LATEST_MESSAGE" }))
    throw error
  }
}