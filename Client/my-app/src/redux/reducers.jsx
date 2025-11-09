const initialState = {
  user: null,
  admin: JSON.parse(localStorage.getItem("admin") || "null"),
  sent: null,
  friendRequestLoader: false,
  chatsRoom: null,
  singleRoom: null,
  Messages: null,
  AllUsersMessages:null,
  latestMessage: null,
  AllFriends: null,
  userLoader: false,
  authLoader: false,
  authStatus: false,
  OnlineUsers:null
};

export default function reducer(state = initialState, action) {
  const { type, payload } = action;
  console.log("🔥 ACTION DISPATCHED:", type, payload);
  console.log("payloaad ", payload);

  switch (type) {
    case "LOGIN_REQUEST":
      return {
        ...state,
        authLoader: true,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        admin: payload,
        authLoader: false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        authLoader: false,
      };
    case "LOGOUT":
      localStorage.removeItem("admin");
      return {
        ...state,
        admin: {},
      };
    case "USERS_REQUEST":
      return {
        ...state,
        userLoader: true,
      };
    case "USERS_SUCCESS":
      return {
        ...state,
        userLoader: false,
        authStatus: true,
        user: payload,
      };
    case "USERS_FAILURE":
      return {
        ...state,
        userLoader: false,
      };
    case "GET_FRIENDS_START":
      return { ...state, friendRequestLoader: true, error: null };

    case "GET_FRIENDS_SUCCESS":
      return {
        ...state,
        friendRequestLoader: false,
        sent: payload,
      };

    case "GET_FRIENDS_REQUETS":
      return { ...state, friendRequestLoader: false, error: action.payload };

    // All Friends
    case "GET_ALL_FRIENDS_REQUETS":
      return { ...state, friendRequestLoader: true, error: null };

    case "GET_ALL_FRIENDS_SUCCESS":
      return {
        ...state,
        friendRequestLoader: false,
        AllFriends: payload,
      };

    case "GET_ALL_FRIENDS_FAILURE":
      return { ...state, friendRequestLoader: false, error: action.payload };

    // chatsRoom
    case "GET_CHAT_REQUETS":
      return { ...state, error: null };

    case "GET_CHAT_SUCCESS":
      return {
        ...state,
        chatsRoom: payload,
      };

    case "GET_CHAT_FAILURE":
      return { ...state, error: action.payload };

    // single user room
    case "GET_ROOM_REQUETS":
      return { ...state, error: null };

    case "GET_ROOM_SUCCESS":
      return {
        ...state,
        singleRoom: payload,
      };

    case "GET_ROOM_FAILURE":
      return { ...state, error: action.payload };

    //get all Messages
    case "GET_ALL_MESSAGES_REQUETS":
      return { ...state, error: null };

    case "GET_ALL_MESSAGES_SUCCESS":
      return {
        ...state,
        Messages: payload,
      };

    case "GET_ALL_MESSAGES_FAILURE":
      return { ...state, error: action.payload };

    // get latest message
    
    // case "REQUEST_LATEST_MESSAGE":
    //   return { ...state, error: null };

    // case "SUCCESS_LATEST_MESSAGE":
    //   return {
    //     ...state,
    //     latestMessage: payload,
    //   };

    // case "FAILURE_LATEST_MESSAGE":
    //   return { ...state, error: action.payload };

      // allUsersMessages
      case "GET_LATEST_MESSAGE_REQUETS":
      return { ...state, error: null };

    case "GET_LATEST_MESSAGE_SUCCESS":
      return {
        ...state,
        latestMessage: payload,
      };

    case "GET_LATEST_MESSAGE_FAILURE":
      return { ...state, error: action.payload };

      // ONLINE
      case "ONLINE_REQUEST":
      return { ...state, error: null };

    case "ONLINE_SUCCESS":
      return {
        ...state,
        OnlineUsers: payload,
      };

    case "ONLINE_FAILURE":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
