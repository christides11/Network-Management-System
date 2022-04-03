import './device.css';
import React, { useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, IconButton, Checkbox, TableRow, Typography, Box, Collapse } from '@mui/material';
import { useParams } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import useState from 'react-usestateref';
import { socket } from '../../api/socket';

function SensorsTable(){
    return (
        <>
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableCell>
                        Sensor
                    </TableCell>
                </TableHead>
                <TableBody>
                    
                </TableBody>
            </Table>
        </TableContainer>
        </>
    );
}

function DevicePage(){
    let params = useParams();
    const [device, setDevice, deviceRef] = useState(null);

    const receiveDevice = useCallback((data) => {
        console.log(data);
        setDevice(data);
    });

    useEffect(() => {
        socket.on("ReceiveDevice", receiveDevice)

        if(deviceRef.current == null) socket.emit("RequestDevice", params.deviceId);
        return () => { 
            socket.off("ReceiveDevice", receiveDevice)
        }
    }, []);

    return (
        <div className="DevicePage">
            {device == null &&
                <CircularProgress />
            }
            {device != null &&
                <>
                <h1>{device.name}</h1>
                <h2>{device.ipAddress}</h2>

                <h2>Sensors</h2>
                <SensorsTable />
                </>
            }
        </div>
    );
}

export default DevicePage;