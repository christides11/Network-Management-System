import './sensor.css';
import React, { useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import useState from 'react-usestateref';
import { CircularProgress } from '@mui/material';

function SensorPage({socket}){
    let params = useParams();
    const [device, setDevice, deviceRef] = useState(null);
    const [sensor, setSensor, sensorRef] = useState(null);
    const [devicesensor, setDeviceSensor, deviceSensorRef] = useState(null);

    const receiveDevice = useCallback((data) => {
        setDevice(data);
    });

    const receiveSensor = useCallback((data) => {
        setSensor(data);
    });

    const receiveDeviceSensor = useCallback((data) => {
        setDeviceSensor(data);
    });

    useEffect(() => {
        socket.on("ReceiveDevice", receiveDevice)
        socket.on("ReceiveSensor", receiveSensor)
        socket.on("ReceiveDeviceSensor", receiveDeviceSensor)

        if(device == null) socket.emit("RequestDevice", params.deviceId)
        if(sensor == null) socket.emit("RequestSensor", params.sensorId)
        if(devicesensor == null) socket.emit("RequestDeviceSensor", {"deviceid": params.deviceId, "sensorid": params.sensorId, "id": params.id})

        return () => {
            socket.off("ReceiveDevice", receiveDevice)
            socket.off("ReceiveSensor", receiveSensor)
            socket.off("ReceiveDeviceSensor", receiveDeviceSensor)
        }
    }, [socket]);

    useEffect(() => {

    }, []);

    return (
        <div className="SensorPage">
            {(sensor == null || device == null || devicesensor == null) &&
                <>
                    <CircularProgress />
                </>
            }
            {(sensor != null && device != null && devicesensor != null) &&
                <>
                    <h1>{devicesensor["name"]} ({sensor["name"]})</h1>
                </>
            }
        </div>
    );
}

export default SensorPage;