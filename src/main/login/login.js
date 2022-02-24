import './login.css';
import React, { useState, useEffect } from 'react';
import InputForm from '../../components/NameForm';
//import { socket, SocketContext } from '../../api/socket';
import socketio from "socket.io-client";

function LoginPage({socket, setSocket}){
    const [serverIP, setServerIP] = useState('localhost');

    function TryLogin(){
        console.log(serverIP);
        console.log(socket);
        setSocket(socketio.connect("http://" + serverIP + ":8080"));
    }

    return (
        <div className="LoginPage">
            <h1>Login Page</h1>
            <input value={serverIP} onInput={e => setServerIP(e.target.value)} />
            <button onClick={TryLogin}>Login</button>
        </div>
    );
}

//<InputForm name="Server IP"></InputForm>
export default LoginPage;