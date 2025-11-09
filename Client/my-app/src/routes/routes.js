const userAuthUrl = `http://localhost:8000/api/auth`
const get_Requests = `http://localhost:8000/friends/api`
const chatBaseUrl  = `http://localhost:8000/chat/api`
const messageBaseUrl = `http://localhost:8000/message/api`

export const login = `${userAuthUrl}/login`
export const getAllUsers = `${userAuthUrl}/getAllUsers`
export const getFriendRequest = `${get_Requests}/get_friend_requests`
export const getAllFriends = `${get_Requests}/all_friends`
export const getAllChats = `${chatBaseUrl}/get_all_chats`
export const singleUsersRoom = `${chatBaseUrl}/get_user_chatroom`
export const allRoomMessages = `${messageBaseUrl}/getAllMessages`
export const latest_Message = `${messageBaseUrl}/latestMessage`
