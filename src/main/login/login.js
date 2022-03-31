import './login.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({socket, sessionID, setSessionID}){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    let navigate = useNavigate();

    function TryLogin(){
        socket.emit('RequestLogin', {"username": username, "password": password});
    }

    function ReceiveLoginResult(data){
        console.log(data.sessionID);
        if(data.sessionID == 0) return;
        setSessionID(data.sessionID);
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
                <input type="password" value={password} onInput={e => setPassword(e.target.value)} />
                <button onClick={TryLogin}>Login</button>
            </nav>
        </div>
    );
}

export default LoginPage;