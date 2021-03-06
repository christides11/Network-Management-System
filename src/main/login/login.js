import "./login.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../../components/images/Netman-logos_black.png'

function LoginPage({ socket, sessionID, setSessionID }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  let navigate = useNavigate();

  function TryLogin() {
    socket.emit("RequestLogin", { username: username, password: password });
  }

  function ReceiveLoginResult(data) {
    console.log(data)
    if (data.sessionID == 0) return;
    setSessionID(data.sessionID);
    navigate("/summary");
  }

  useEffect(() => {
    socket.on("ReceiveLoginResult", ReceiveLoginResult);
    return () => {
      socket.off("ReceiveLoginResult", ReceiveLoginResult);
    };
  }, []);

  return (
    <div className="LoginPage">
      <form className="container">

        {/* Logo */}
        <div className="container w-25">
            <img src={logo} className="img-fluid" alt=""/>
        </div>
        <div className="row">
          <div className="form-group my-3 col-xs-12 col-lg-7 mx-auto">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control mx-auto d-block"
              id="username"
              aria-describedby="emailHelp"
              placeholder="Enter username"
              value={username}
              onInput={(e) => setUsername(e.target.value)}
            />
            <small id="usernameHelp" className="form-text text-muted">
              We take your privacy seriously.
            </small>
          </div>
        </div>

        <div className="row">
          <div className="form-group mb-3 col-xs-12 col-lg-7 mx-auto">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onInput={(e) => setPassword(e.target.value)}
              id="password"
              placeholder="Password"
            />
             <small id="usernameHelp" className="form-text text-muted">
              Security is our middle name.
            </small>
          </div>
        </div>

        <div className="row mb-3">
          <div className="text-center">
            <p>Not a member? <a href="/register" id="register-link" className="link-primary">Register</a></p>
          </div>

        </div>

        <div className="text-center">
          {/* Uses 'form' submit button by default which forces a refresh, which is what we do NOT want */}
          {/* <button
            onClick={TryLogin}
            className="btn btn-primary w-25"
          >
            Log In
          </button> */}
          <input type="button" onClick={TryLogin} className="btn btn-primary w-25" id="btnSeccion3" value="Log In"/>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
