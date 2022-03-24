import './login.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({socket}){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    let navigate = useNavigate();

    function TryLogin(){
        socket.emit('RequestLogin', {"username": username, "password": password});
        //setSocket(socketio.connect("http://" + serverIP + ":8080"));
        //setServerIP(serverIP);
        //navigate("/summary");
    }

    /*
    useEffect(() => {
        console.log("b");
        if(socket != null){
            console.log(window.location.pathname);
        }
        return () => { }
    }, [socket]);*/

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