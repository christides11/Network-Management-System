import './login.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({socket, sessionID, setSessionID}){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    let navigate = useNavigate();

    function TryLogin(){
        socket.emit('RequestLogin', {"username": username, "password": password});
        //setSocket(socketio.connect("http://" + serverIP + ":8080"));
        //setServerIP(serverIP);
        //navigate("/summary");
    }

    function ReceiveLoginResult(sessionID){
        console.log(sessionID);
        if(sessionID == null) return;
        setSessionID(sessionID);
        navigate("/summary");
    }
    
    useEffect(() => {
        socket.on('ReceiveLoginResult', ReceiveLoginResult)
        return () => {
            socket.off('ReceiveLoginResult', ReceiveLoginResult)
        }
    }, [socket]);

    return (
        <div className="LoginPage">
            <nav>
                <h1>Login Page</h1>
                <input value={username} onInput={e => setUsername(e.target.value)} />
                <input value={password} onInput={e => setPassword(e.target.value)} />
                <button onClick={TryLogin}>Login</button>
            </nav>
        </div>
    );
}

export default LoginPage;