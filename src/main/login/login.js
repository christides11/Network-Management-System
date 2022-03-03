import './login.css';
import React, { useState, useEffect } from 'react';
import socketio from "socket.io-client";
import { useNavigate } from 'react-router-dom';

function LoginPage({socket, setSocket}){
    let navigate = useNavigate();
    const [serverIP, setServerIP] = useState('localhost');

    function TryLogin(){
        setSocket(socketio.connect("http://" + serverIP + ":8080"));
        setServerIP(serverIP);
        navigate("/summary");
    }

    useEffect(() => {
        console.log("b");
        if(socket != null){
            console.log(window.location.pathname);
        }
        return () => { }
    }, [socket]);

    return (
        <div className="LoginPage">
            <nav>
                <h1>Login Page</h1>
                <input value={serverIP} onInput={e => setServerIP(e.target.value)} />
                <button onClick={TryLogin}>Login</button>
            </nav>
        </div>
    );
}

export default LoginPage;