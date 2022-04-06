import './sensor.css';
import React, { useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import useState from 'react-usestateref';
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, IconButton, Checkbox, TableRow, Typography, Box, Collapse, MenuItem, Button, Menu, CircularProgress} from '@mui/material';
import moment from 'moment';

function SensorPage({socket}){
    let params = useParams();
    const [device, setDevice, deviceRef] = useState(null);
    const [sensor, setSensor, sensorRef] = useState(null);
    const [devicesensor, setDeviceSensor, deviceSensorRef] = useState(null);
    const [sensorchannels, setSensorChannels, sensorChannelsRef] = useState({})
    const [latestChannelData, setChannelData, channelDataRef] = useState({})
    const [lastTime, setLastTime, lastTimeRef] = useState("")

    const receiveDevice = useCallback((data) => {
        setDevice(data);
    });

    const receiveSensor = useCallback((data) => {
        setSensor(data);
        setLastTime(moment.utc(data['nexttime']).local().format('MMMM Do YYYY, h:mm:ss a'))
    });

    const receiveDeviceSensor = useCallback((data) => {
        setDeviceSensor(data);
    });

    const receiveSensorChannels = useCallback((data) => {
        let t = {};
        for(let i = 0; i < data.length; i++){
            t[data[i]["id"]] = data[i]
        }
        setSensorChannels(t)
    });

    const receiveLatestChannelData = useCallback((data) => {
        setChannelData(data)
    });

    useEffect(() => {
        socket.on("ReceiveDevice", receiveDevice)
        socket.on("ReceiveSensor", receiveSensor)
        socket.on("ReceiveDeviceSensor", receiveDeviceSensor)
        socket.on("ReceiveLatestChannelData", receiveLatestChannelData)
        socket.on("ReceiveSensorChannels", receiveSensorChannels)

        if(device == null) socket.emit("RequestDevice", params.deviceId)
        if(sensor == null) socket.emit("RequestSensor", params.sensorId)
        if(devicesensor == null) socket.emit("RequestDeviceSensor", {"deviceid": params.deviceId, "sensorid": params.sensorId, "id": params.id})
        socket.emit("GetSensorChannels", params.sensorId)

        return () => {
            socket.off("ReceiveDevice", receiveDevice)
            socket.off("ReceiveSensor", receiveSensor)
            socket.off("ReceiveDeviceSensor", receiveDeviceSensor)
            socket.off("ReceiveLatestChannelData", receiveLatestChannelData)
            socket.off("ReceiveSensorChannels", receiveSensorChannels)
        }
    }, [socket]);

    useEffect(() => {

    }, []);

    function refreshChannels(){
        socket.emit("RequestSensor", params.sensorId)
        socket.emit("GetLatestChannelData", {"deviceid": params.deviceId, "sensorid": params.sensorId, "id": params.id} )
    }

    function ChannelRow({channel, k}) {
        let channelID = latestChannelData[channel]["channel_id"];

        return (
            <TableRow>
                <TableCell>
                    {channelID in sensorchannels &&
                        <Typography>
                            {sensorchannels[channelID]["name"]}
                        </Typography>
                    }
                    {channel == -4 &&
                        <Typography>Downtime</Typography>
                    }
                </TableCell>
                <TableCell>
                    {latestChannelData[channel]['data'][0]}
                </TableCell>
            </TableRow>
        );
    }

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
                    <Button onClick={refreshChannels}>Refresh</Button>
                    <Typography>
                        Last Update at {lastTime}
                    </Typography>
                    <h2>Channels</h2>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        CHANNEL NAME
                                    </TableCell>
                                    <TableCell>
                                        CHANNEL VALUE
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(latestChannelData).map((key, idx) => (
                                    <ChannelRow key={idx} channel={key} k={idx}></ChannelRow>
                                ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            }
        </div>
    );
}

export default SensorPage;