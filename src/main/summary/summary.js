import "./summary.css";
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

function SummaryPage({ socket, sessionID }) {
  let navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sensorsList, setSensorsList] = useState([]);
  const [downDevices, setDownDevices] = useState(0);
  const [downSensors, setDownSensors] = useState(0);

  useEffect(() => {
    socket.on("ReceiveDeviceList", receiveDeviceList);
    socket.on("ReceiveSensorList", receiveSensorList);

    // Alerts
    socket.on("ReceiveDeviceList", receiveDeviceList);
    socket.on("ReceiveAllDeviceSensorList", receiveAllDeviceSensorList);
    refreshData();

    return () => {
      socket.off("ReceiveDeviceList", receiveDeviceList);
      socket.off("ReceiveSensorList", receiveSensorList);
      socket.off("ReceiveAllDeviceSensorList", receiveAllDeviceSensorList);
    };
  }, [socket]);

  useEffect(() => {
    let sensorCount = 0;
    // Update alerts for sensors
    sensorsList.forEach((sensor, index) => {
      if (sensor.statusmessage === "Sensor is down.") {
        sensorCount++;
      }
    })
    setDownSensors(sensorCount);

    // Update alerts for devices
    let deviceCount = 0;
    devices.forEach((device, index) => {
      if (device.statusmessage === "Device is down.") {
        deviceCount++;
      }
    })
    setDownDevices(deviceCount);
  }, [devices, sensorsList]);


  // Callback functions from the database
  const receiveDeviceList = useCallback((devicesList) => {
    console.log(devicesList);
    setDevices(devicesList);
  });

  const receiveSensorList = useCallback((sensorsList) => {
    setSensors(sensorsList);
  });

  const receiveAllDeviceSensorList = useCallback((devicesSensorsList) => {
    console.log("devices")
    console.log(devicesSensorsList);
    setSensorsList(devicesSensorsList);
  });

  // Refresh data
  const refreshData = () => {
    socket.emit("RequestDeviceList");
    socket.emit("RequestSensorList");
    socket.emit("RequestAllDeviceSensorList");
  };

  return (
    <main className="container-fluid mt-3">
      <h1>Netman At A Glance</h1>
      <hr className="w-25"></hr>

      <div className="container text-center mb-5">
        <button className="btn btn-outline-info" onClick={refreshData}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      <div className="container">
        <section className="row gy-2">
          <div className="card col-xs-12 col-md-6">
            <div className="card-body">
              <h5 className="card-title">Total Network Devices</h5>
              <p className="card-text">
                {devices.length} devices connected.{" "}
                <Link to={"/devices"} style={{ textDecoration: 'none' }}>
                    More details.
                </Link>
              </p>
            </div>
          </div>

          <div className="card col-xs-12 col-md-6">
            <div className="card-body">
              <h5 className="card-title">Total Sensors</h5>
              <p className="card-text">{sensors.length} sensors connected.{" "}
              <Link to={"/devices"} style={{ textDecoration: 'none' }}>
                  More details.
              </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="row gx-2">
        <div className="card col-xs-12 col-md-6">
            <div className="card-body">
              <h5 className="card-title">Alerts</h5>
              <p className="card-text">
                {downDevices} device(s) down.{" "}
                {" "}{downSensors} sensor(s) down.{" "}
                <Link to={"/alerts"} style={{ textDecoration: 'none' }}>
                  More details.
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SummaryPage;
