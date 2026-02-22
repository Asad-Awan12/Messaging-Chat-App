**** Real-Time Chat Application | MERN Stack + Socket.IO

A full-stack real-time chat application built with the MERN stack and Socket.IO that enables users to communicate instantly. This project demonstrates modern full-stack development practices including authentication, protected routes, global state management, and real-time bidirectional communication

**** Key Features

✅ User Signup and Login with JWT Authentication
✅ Real-time Messaging using Socket.IO
✅ Online / Offline User Status
✅ Private One-to-One Chat
✅ Protected Routes
✅ Persistent Login using Token
✅ Responsive Modern UI
✅ Global State Management with Redux Toolkit
✅ REST API Integration
✅ MongoDB Database Integration

**** Tech Stack
Frontend

React.js

Redux Toolkit

Tailwind CSS

Axios

Socket.IO Client

React Router DOM

Backend

Node.js

Express.js

MongoDB

Mongoose

Socket.IO

*** Authentication Flow

User Signup/Login

Backend generates JWT token

Token stored in localStorage

Protected routes verify token

User accesses chat

*** Real-Time Flow

User connects to Socket.IO server

Socket ID stored

Message sent

Server emits message

Receiver gets message instantly

JWT Authentication

bcrypt.js
