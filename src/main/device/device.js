import './device.css';
import React, { useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, IconButton, Checkbox, TableRow, Typography, Box, Collapse, MenuItem, Button, Menu } from '@mui/material';
import { useParams } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import useState from 'react-usestateref';
import { socket } from '../../api/socket';
import CreateSensorModal from './createSensorModal';

function SensorsTable(){
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [addingDevice, setAddingDevice, addingDeviceRef] = useState(false);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleAddSensorButton = () => {
      setAnchorEl(null);
      setAddingDevice(true);
    };

    const handleCloseAddSensor = () => {
        setAddingDevice(false);
    }

    return (
        <>
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableCell>
                        Sensor
                    </TableCell>
                    <TableCell>
                        <Button
                        id="basic-button"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        >
                        Options
                        </Button>
                        <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleAddSensorButton}
                        MenuListProps={{
                        'aria-labelledby': 'basic-button',
                        }}
                        >
                        <MenuItem onClick={handleAddSensorButton}>Add Sensor</MenuItem>
                        </Menu>
                    </TableCell>
                </TableHead>
            </Table>
        </TableContainer>
        <CreateSensorModal open={addingDevice} handleClose={handleCloseAddSensor} />
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