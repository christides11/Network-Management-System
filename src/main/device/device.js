import './device.css';
import React, { useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import useState from 'react-usestateref';
import { socket } from '../../api/socket';

function DevicePage(){
    let params = useParams();
    const [device, setDevice, deviceRef] = useState(null);

    const receiveDevice = useCallback((data) => {
        console.log(data);
    });

    useEffect(() => {
        socket.on("RequestDevice", receiveDevice)

        if(deviceRef.current == null) socket.emit("RequestDevice");
        return () => { 
            socket.off("RequestDevice", receiveDevice)
        }
    }, []);

    return (
        <div className="DevicePage">
            {device == null &&
                <CircularProgress />
            }
            {device != null &&
                <>
                <h1>{params.deviceId}</h1>
                </>
            }
        </div>
    );
}

export default DevicePage;