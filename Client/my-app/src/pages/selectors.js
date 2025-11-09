export const userState = (state) => state?.user?.users
export const friendsRequests = (state) => state?.sent?.findRequests
export const rooms = (state)=> state?.singleRoom?.room
export const chat_messages = (state)=> state?.Messages?.allMessages
export const latest_message = (state)=> state?.latestMessage
export const all_users_messages = (state)=> state?.AllUsersMessages
export const auth_Loader = (state) => state?.authLoader
export const userLoader = (state) => state?.userLoader
export const onlineFriends = (state) => state?.OnlineUsers