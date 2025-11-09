import React, { useRef } from "react";
import { Send } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useParams } from "react-router-dom";
// import socket from "../utils/socket";
import { toast } from "react-toastify";
import { AllChatRooms, allMessages, latestMessage, SingleUserRoom } from "../redux/chat/action";
import { chat_messages, rooms } from "../pages/selectors";
import socket from "../utils/socket";

const ChatContent = () => {
  const chatId = useSelector(rooms)
  const all_chatMessages = useSelector(chat_messages)
  console.log("all_chatMessages ", all_chatMessages);

  console.log("chatRoomschatRooms ", chatId);

  const currentUser = JSON.parse(localStorage.getItem("admin"))?.user;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const dispatch = useDispatch()

  const { receiverId } = useParams();

  useEffect(() => {
    if (!receiverId || !currentUser?._id) return;

    const fetchSingleRoom = async () => {
      try {
        const res = await dispatch(SingleUserRoom({
          senderId: currentUser._id,
          receiverId,
        }));

        console.log("res of single room", res);
      } catch (error) {
        console.error("Error fetching single room", error);
      }
    };

    fetchSingleRoom();
  }, [dispatch, receiverId, currentUser?._id]);


  useEffect(() => {
    if (!receiverId || !currentUser?._id) return;
    setLoading(true);

    const fetchMessages = async () => {
      try {
        const res = await dispatch(allMessages(
          receiverId
        ));
        setMessages(res?.allMessages)

        // if (all_chatMessages?.length > 0) {
        //   setMessages(all_chatMessages)
        // }
        // else {
        //   setMessages(res?.allMessages)
        // }
        console.log("res of all messages", res);
      } catch (error) {
        console.error("Error fetching all messages", error);
      }
      finally {
        setLoading(false);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 200);
      }
    };

    fetchMessages();
  }, [receiverId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 

  const handleSendMessage = async () => {

    if (!content.trim()) return;
    socket.emit("send_message", {
      chatId: chatId?._id,
      content,
      senderId: currentUser._id,
      receiverId
    });
    setContent("");
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

   const handleInput = (e) => {
     if (e.key === "Enter") {
      handleSendMessage();
    }
    setContent(e.target.value);

    let senderId = currentUser?._id
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { chatId: chatId._id, senderId, receiverId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId: chatId?._id, senderId, receiverId });
      setIsTyping(false);
    }, 2000);
     
  };
  // enabling Enter keyoard key
    const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };


  const messageReceiverUser = chatId?.users?.find((i) => {
    if (i?._id === receiverId) {
      return i
    }
  })

  useEffect(() => {
    if (!chatId?._id) return;
    socket.emit("join_chat", chatId._id);

    const id = chatId?._id
    socket.on("send_message", (msg) => {
      console.log("msgg from socket ", msg);
      if (msg?.chatId === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", ({ chatId: incomingChatId, senderId }) => {
      if (incomingChatId === id && senderId === messageReceiverUser._id) {
        setIsReceiverTyping(true)
      }
    });

    socket.on("stop_typing", ({ chatId: incomingChatId, senderId }) => {
      if (incomingChatId === id && senderId === receiverId) {
        setIsReceiverTyping(false)
      }
    });



    return () => {
      socket.off("send_message");
      socket.off("join_chat")
      socket.off("typing");
      socket.off("stop_typing");
      //       socket.off("notification")
    };
  }, [chatId?._id]);

  console.log("messages ", messages);


  console.log("messageReceiverUser", messageReceiverUser);


  return (
    <main className="flex flex-col h-full bg-white">
      {
        !receiverId ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Welcome to Chat App💬
            </h2>
            <p className="text-gray-500 mt-2">
              Select a conversation to start messaging.
            </p>
          </div>
        )
          : loading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="relative flex justify-center items-center">
                <div className="h-12 w-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-600 text-sm font-medium">Loading messages...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {
                messages?.length === 0 && (<p className="mt-4 text-gray-600 text-sm font-medium">Loading messages...</p>
                )
              }
              {messages?.map((msg) => {
                const isOwnMessage = msg.senderId?._id === currentUser?._id || msg.senderId === currentUser?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-2 ${isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                  >
                    {!isOwnMessage && (
                      <img
                        src={messageReceiverUser?.profile}
                        alt={messageReceiverUser?.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}

                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${isOwnMessage
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                    >
                      {!isOwnMessage && (
                        <div className="text-xs font-semibold mb-1">
                          {messageReceiverUser?.username}
                        </div>
                      )}
                      <div className="text-sm">{msg.content}</div>
                    </div>

                    {isOwnMessage && (
                      <img
                        src={msg.senderId?.profile}
                        alt="Me"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
              <div ref={scrollRef}></div>

              {isReceiverTyping && (
                <div className="text-gray-500 italic mt-2 text-sm">
                  {messageReceiverUser?.username} is typing...
                </div>
              )}

            </div>
          )
      }

      <div className="border-t p-4 flex flex-wrap justify-center items-center gap-2 bg-white">
        <input
          type="text"
          value={content}
          ref={typingTimeoutRef}
          onChange={(e) => handleInput(e)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 min-w-[200px] border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1 max-sm:w-full"
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </main>
  );
};

export default ChatContent;
