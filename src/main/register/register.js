import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../components/images/Netman-logos_black.png";
import "./register.css";

function RegisterPage({ socket, sessionID, setSessionID }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const TryRegister = () => {
    socket.emit("RequestRegistration", {
      username: username,
      password: password,
    });
  };

  let navigate = useNavigate();

  const ReceiveRegistrationResult = (data) => {
    console.log(data.result);
    if (data.result) {
      navigate("/summary");
    } else {
      console.log("An error occurred.");
    }
  };

  useEffect(() => {
    socket.on("ReceiveRegistrationResult", ReceiveRegistrationResult);
    return () => {
      socket.off("ReceiveRegistrationResult", ReceiveRegistrationResult);
    };
  }, [socket]);

  return (
    <div className="container my-5">
      {/* Logo */}
      <div className="container w-25">
        <img src={logo} className="img-fluid" alt="" />
      </div>

      <h1 className="display-5 text-center">
        Let's sign you up to manage those pesky devices...
      </h1>

      <form className="container">
        <div className="row">
          <div class="form-group my-3 col-xs-12 col-lg-7 mx-auto">
            <label for="username">Username</label>
            <input
              type="text"
              className="form-control mx-auto d-block"
              id="username"
              aria-describedby="emailHelp"
              placeholder="Enter username"
              value={username}
              onInput={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="form-group mb-3 col-xs-12 col-lg-7 mx-auto">
            <label for="password">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onInput={(e) => setPassword(e.target.value)}
              id="password"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="text-center mb-4">
          {/* Using the default triggers Bootstrap to RELOAD page when this is clicked */}
          {/* <button
            onClick={TryRegister}
            type="submit"
            className="btn btn-primary w-25"
          >
            Register
          </button> */}
          <input type="button" onClick={TryRegister} class="btn btn-primary w-25" id="btnSeccion3" value="Register"/>
        </div>

        <div className="row mb-2">
          <p className="text-center">
            Back to{" "}
            <a href="/" id="login-link" className="link-primary">
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
