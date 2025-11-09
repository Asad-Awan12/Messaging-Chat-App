import React, { useEffect, useState } from "react";
import { Container, Row, Col, Nav, Tab, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../components/Header/Header";
// import {
//   acceptFriendRequest,
//   getsingleUser,
//   getUsers,
//   sendFriendRequest,
// } from "../Redux/Auth/actions";
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "../redux/users/action";
import { friendsRequests, userState } from "./selectors";
import { getRequests, sendFriendRequest } from "../redux/FriendRequest/action";
import { toast } from "react-toastify";
import socket from "../utils/socket";
// import { access_chats } from "../Redux/Chat/action";
// import { io, Socket } from "socket.io-client";
// import socket from "../utils/socket";
// import { toast } from "react-toastify";

export default function UpdateProfileScreen({ friendRequests }) {
  const users = useSelector(userState);
  const requestData_redux = useSelector(friendsRequests);
  console.log("requestData_redux ", requestData_redux);

  console.log("select ", users);

  const getlocalUser = JSON.parse(localStorage.getItem("admin"));
  const [activeTab, setActiveTab] = useState("one");
  const dispatch = useDispatch();
  const [allUsers, setAllUsers] = useState([]);
  const [singleUser, setSingleUser] = useState([]);
  const [firendRequest, setFriendRequests] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleFriendRequest = (data) => {
      console.log("New Friend Request:", data);

      setFriendRequests((prev) => {
        if (prev.some((req) => req.senderId === data.senderId)) return prev;
        return [...prev, data];
      });
      toast.success(`New friend request from ${data?.username}`, {
        position: "top-right",
      });
    };

    const handleAcceptFriend = (data) => {
      console.log("Accept friend response:", data);

      if (data.success) {
        toast.success(data.message, { position: "top-right" });
      } else {
        toast.error(data.message || "Error accepting friend request", {
          position: "top-right",
        });
      }
    };

    socket.on("sent_friend_request", handleFriendRequest);
    socket.on("accept_friend_request", handleAcceptFriend);

    return () => {
      socket.off("sent_friend_request", handleFriendRequest);
      socket.off("accept_friend_request", handleAcceptFriend);
    };
  }, [socket]);

  useEffect(() => {
    if (requestData_redux === undefined) {
      const fetchUsers = async () => {
        const res = await dispatch(getRequests());
        setFriendRequests(res?.findRequests);
      };
      setFriendRequests(requestData_redux);
      fetchUsers();
    }
    setFriendRequests(requestData_redux);
  }, [dispatch]);

  console.log("allUsers firendRequest", firendRequest);

  const handleSendFriendRequest = async (receiverId) => {
    try {
      const user = getlocalUser?.user;

      await dispatch(sendFriendRequest({ senderId: user._id, receiverId }));
      toast.success("Friend Request Send Successfully");

      // await dispatch(sendFriendRequest(receiverId));
      // setAllUsers((prev) =>
      //   prev.filter((u) => u._id.toString() !== receiverId.toString())
      // );
    } catch (error) {
      console.log("error from sendd ", error);
      const message =
        typeof error === "string"
          ? error
          : error?.response?.data?.message || error.message;
      console.log("message from send ", message);

      toast.error(message);
    }
  };

  const handleAcceptFriendRequest = async (senderId) => {
    try {      
      const receiverId = getlocalUser.user._id;

      socket.emit("accept_friend_request", { senderId, receiverId });

      // socket.emit("accept_friend_request", { senderId }, (response) => {
      //   if (response.success) {
      //     console.log("Friend request accepted:", response.message);

      // optional: update your state instantly
      // setFriendRequests((prev) => prev.filter((r) => r._id !== senderId));

      // optional: add to friends list
      // setFriends((prev) => [...prev, { _id: senderId }]);

      // optional: show success toast
      //   toast.success(response.message);
      // } else {
      //   console.warn("Failed to accept:", response.message);
      //   toast.error(response.message);
      // }
      // });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Header />
      <Container fluid className="py-5 bg-light min-vh-100">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <Row className="g-0 flex-column flex-md-row">
                {/* Sidebar */}
                <Col
                  xs={12}
                  md={4}
                  className="bg-primary text-white p-4 text-center text-md-start"
                >
                  <h4 className="fw-bold mb-4">Friends</h4>
                  <Nav
                    variant="pills"
                    className="flex-md-column justify-content-center gap-2"
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                  >
                    <Nav.Item>
                      <Nav.Link eventKey="one" className="nav-link-custom">
                        <i className="ri-user-line me-2"></i> Friend Suggestions
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        eventKey="two"
                        className="nav-link-custom cursor-pointer"
                      >
                        <i className="ri-lock-line me-2"></i> Friend Requests
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>

                {/* Tab Content */}
                <Col xs={12} md={8} className="bg-white p-4">
                  <Tab.Container
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                  >
                    <Tab.Content>
                      {/* Friend Suggestions */}
                      <Tab.Pane eventKey="one">
                        <h3 className="fw-bold text-primary mb-4">
                          Friend Suggestions
                        </h3>
                        {(users || [])?.length > 0 ? (
                          <div className="d-flex flex-column gap-3">
                            {users?.map((i) => (
                              <Card
                                key={i._id}
                                className="border-0 shadow-sm rounded-3"
                              >
                                <Card.Body className="d-flex align-items-center max-md:flex-wrap">
                                  <img
                                    src={i?.profile || i?.image}
                                    alt="Profile"
                                    className="rounded-circle object-cover me-3"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                    }}
                                  />
                                  <div className="flex-grow-1 md:w-100">
                                    <p className="mb-1 fw-semibold">
                                      {i?.username}
                                    </p>
                                    <small className="text-muted">
                                      New friend suggestion
                                    </small>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleSendFriendRequest(i?._id)
                                    }
                                    className="btn btn-sm btn-primary shadow-sm px-3 w-100 mt-3 mt-md-0"
                                  >
                                    Add Friend
                                  </button>
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">
                            No new friend suggestions at the moment.
                          </p>
                        )}
                      </Tab.Pane>

                      {/* Friend Requests */}
                      <Tab.Pane eventKey="two">
                        <h3 className="fw-bold text-primary mb-2">
                          Friend Requests
                        </h3>
                        {(firendRequest || [])?.length > 0 ? (
                          <>
                            {(firendRequest || []).map((i) => (
                              <Card
                                key={i.senderId?._id || i?.senderId}
                                className="border-0 shadow-sm rounded-3 mb-3"
                              >
                                <Card.Body className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                                  {/* Profile Image + Info */}
                                  <div className="d-flex align-items-center w-100 w-md-50">
                                    <img
                                      src={i?.senderId?.profile || i?.profile}
                                      alt="Profile"
                                      className="rounded-circle object-cover me-3"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <div>
                                      <p className="mb-1 fw-semibold">
                                        {i?.senderId?.username || i?.username}
                                      </p>
                                      <small className="text-muted line-clamp-1">
                                        Wants to connect with you
                                      </small>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="d-flex gap-2 justify-content-center justify-content-md-end w-100 w-md-auto">
                                    <button
                                      onClick={() =>
                                        handleAcceptFriendRequest(
                                          i?.senderId?._id || i?.senderId
                                        )
                                      }
                                      className="btn btn-sm btn-primary shadow-sm px-3 w-100"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteFriendRequest(i?.senderId)
                                      }
                                      className="btn btn-sm btn-outline-danger shadow-sm px-3 w-100"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                          </>
                        ) : (
                          <p className="text-muted">
                            You have no pending friend requests.
                          </p>
                        )}
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Styles */}
        <style>
          {`
          .nav-link-custom {
            background: transparent;
            border-radius: 8px;
            padding: 0.6rem 1rem;
            font-weight: 500;
            color: white !important;
            transition: all 0.2s ease-in-out;
          }
          .nav-link-custom.active, 
          .nav-link-custom:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: translateX(4px);
          }
          @media (max-width: 768px) {
            .nav-link-custom {
              display: inline-block;
              margin: 0 4px;
            }
          }
        `}
        </style>
      </Container>
    </>
  );
}
