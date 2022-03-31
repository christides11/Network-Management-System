//import React from 'react';
//import socketio from "socket.io-client";
// import { SOCKET_URL } from "config";

//export const socket = null;
//export const SocketContext = React.createContext();

import io from "socket.io-client";

export const socket = io("http://localhost:8182");
