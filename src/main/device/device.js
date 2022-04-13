import './device.css';
import React, { useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, IconButton, Checkbox, TableRow, Typography, Box, Collapse, MenuItem, Button, Menu} from '@mui/material';
import { useParams } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import useState from 'react-usestateref';
import { socket } from '../../api/socket';
import CreateSensorModal from './createSensorModal';
import { Link, useNavigate } from 'react-router-dom';

function SensorsTable({device, socket, sensorList, setSensorList}){
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
        setSensorList([]);
    }

    function Row({row, k}){
        return (
            <>
                <TableRow  sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                        {row.name}
                    </TableCell>
                    <TableCell align="right">
                        <Button> 
                            <Link to={`/devices/${row.device_id}/sensor/${row.sensor_id}/id/${row.id}`} key={device.id}>View Sensor</Link> 
                        </Button>
                    </TableCell>
                </TableRow>
            </>
        )
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
                <TableBody>
                    {sensorList.map((sensor, idx) => (
                        <Row key={idx} row={sensor} k={idx}></Row>
                    ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
        <CreateSensorModal open={addingDevice} device={device} handleClose={handleCloseAddSensor} socket={socket} />
        </>
    );
}

function DevicePage({socket}){
    let params = useParams();
    const [device, setDevice, deviceRef] = useState(null);
    const [sensorList, setSensorList, sensorListRef] = useState([]);

    const receiveDevice = useCallback((data) => {
        setDevice(data);
    });

    const receiveDeviceSensors = useCallback((data) => {
        setSensorList(data);
    });

    useEffect(() => {
        if(sensorListRef.current.length == 0) socket.emit("RequestDeviceSensors", params.deviceId);
    }, [sensorList]);

    useEffect(() => {
        socket.on("ReceiveDevice", receiveDevice)
        socket.on("ReceiveDeviceSensorList", receiveDeviceSensors);

        if(deviceRef.current == null) socket.emit("RequestDevice", params.deviceId);
        //if(sensorListRef.current.length == 0) socket.emit("RequestDeviceSensors", params.deviceId);

        return () => { 
            socket.off("ReceiveDevice", receiveDevice)
            socket.off("ReceiveDeviceSensorList", receiveDeviceSensors);
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
                <SensorsTable device={device} sensorList={sensorList} setSensorList={setSensorList} socket={socket} />
                </>
            }
        </div>
    );
}

export default DevicePage;