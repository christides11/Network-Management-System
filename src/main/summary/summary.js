import "./summary.css";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function SummaryPage({ socket, sessionID }) {
  let navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    socket.on("ReceiveDeviceList", receiveDeviceList);
    socket.on("ReceiveSensorList", receiveSensorList);
    refreshData();

    return () => {
      socket.off("ReceiveDeviceList", receiveDeviceList);
    };
  }, [socket]);

  const receiveDeviceList = useCallback((devicesList) => {
    console.log(devicesList);
    setDevices(devicesList);
  });

  const receiveSensorList = useCallback((sensorsList) => {
    console.log(sensorsList);
    setSensors(sensorsList);
  });

  const refreshData = () => {
    socket.emit("RequestDeviceList");
    socket.emit("RequestSensorList");
  };

  return (
    <main className="container-fluid mt-3">
      <h1>Netman At A Glance</h1>
      <hr className="w-25"></hr>

      <div className="container text-center mb-5">
        <button className="btn btn-outline-info" onClick={refreshData}>
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      <div className="container">
        <section className="row">
          <div className="card col-xs-12 col-md-6">
            <div className="card-body">
              <h5 class="card-title">Total Network Devices</h5>
              <p class="card-text">
                {devices.length} devices connected.{" "}
                <a href="/devices" id="devices-link">
                  More details.
                </a>
              </p>
            </div>
          </div>

          <div className="card col-xs-12 col-md-6">
            <div className="card-body">
              <h5 class="card-title">Total Servers / Routers</h5>
              <p class="card-text">{sensors.length} sensors connected.</p>
            </div>
          </div>
        </section>

        <section className="row container"></section>
      </div>
    </main>
  );
}

export default SummaryPage;
