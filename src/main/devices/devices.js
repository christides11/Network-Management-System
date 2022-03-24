import './devices.css';
import React, { useState, useEffect, useContext, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputLabel, Select, MenuItem, Checkbox, FormControlLabel, FormGroup } from '@mui/material';

function DevicesPage({socket}){

    const [probeList, setProbeList] = useState([]);

    const receiveProbeList = useCallback((data) => {
        setProbeList(data);
    });

    useEffect(() => {
        socket.on("ReceiveProbeList", receiveProbeList)

        socket.emit("RequestProbeList");

        return () => {
            socket.off("ReceiveProbeList", receiveProbeList)
        }
    }, [socket]);

    return (
        <div className="DevicesPage">
            <h1>Devices Page</h1>
            <ul>
            {
                probeList.map(({name}, idx) => 
                    <li key={idx} value={idx}>{name}</li>
                )
            }
            </ul>
        </div>
    );
}

export default DevicesPage;