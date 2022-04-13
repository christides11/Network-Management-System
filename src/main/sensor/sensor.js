import './sensor.css';
import React, { useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import useState from 'react-usestateref';
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, IconButton, Checkbox, TableRow, Typography, Box, Collapse, MenuItem, Button, Menu, CircularProgress, Grid, LinearProgress} from '@mui/material';
import moment from 'moment';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function SensorPage({socket}){
    let params = useParams();
    const [device, setDevice, deviceRef] = useState(null);
    const [sensor, setSensor, sensorRef] = useState(null);
    const [devicesensor, setDeviceSensor, deviceSensorRef] = useState(null);
    const [sensorchannels, setSensorChannels, sensorChannelsRef] = useState({})
    const [latestChannelData, setLatestChannelData, latestChannelDataRef] = useState({})
    const [channelData, setTimeChannelData, timeChannelDataRef] = useState({})
    const [lastTime, setLastTime, lastTimeRef] = useState("")

    const [loading, setLoading, loadingRef] = useState(true);

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
        setLatestChannelData(data)
    });

    const receiveChannelData = useCallback((data) => {
        if(data["channel_id"] == 0) console.log("Receive for 0.");
        setTimeChannelData(prevState => ({
            ...prevState,
            [data["channel_id"]]: data["data"]
        }));
    });

    useEffect(() => {
        socket.on("ReceiveDevice", receiveDevice)
        socket.on("ReceiveSensor", receiveSensor)
        socket.on("ReceiveDeviceSensor", receiveDeviceSensor)
        socket.on("ReceiveLatestChannelData", receiveLatestChannelData)
        socket.on("ReceiveSensorChannels", receiveSensorChannels)
        socket.on("ReceiveChannelData", receiveChannelData)

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
            socket.off("ReceiveChannelData", receiveChannelData)
        }
    }, [socket]);

    useEffect(() => {
        for(const [key, value] of Object.entries(latestChannelDataRef.current)){
            socket.emit("GetChannelData", {"deviceid": params.deviceId, "sensorid": params.sensorId, "id": params.id, "channelid": key})
        }
    }, [latestChannelData]);

    useEffect(() => {
        if(Object.keys(latestChannelDataRef.current).length == 0) socket.emit("GetLatestChannelData", {"deviceid": params.deviceId, "sensorid": params.sensorId, "id": params.id} )
    }, []);

    function refreshChannels(){
        //for(const [key, value] of Object.entries(latestChannelDataRef.current)){
        //    socket.emit("GetChannelData", {"deviceid": params.deviceId, "sensorid": params.sensorId, "id": params.id, "channelid": key})
        //}
        //socket.emit("RequestSensor", params.sensorId)
        socket.emit("GetLatestChannelData", {"deviceid": params.deviceId, "sensorid": params.sensorId, "id": params.id} )
    }

    const DataFormater = (number) => {
        if(number > 1000000000){
          return (number/1000000000).toString() + 'B';
        }else if(number > 1000000){
          return (number/1000000).toString() + 'M';
        }else if(number > 1000){
          return (number/1000).toString() + 'K';
        }else{
          return number.toString();
        }
      }

    function ChannelChart({channel, k}){
        let cdd = channelData[channel];

        return (
            <Grid item xs={5}>
                {cdd.length > 0 &&
                    <>
                        <Typography>{sensorchannels[channel]["name"]}</Typography>
                        <LineChart width={600} height={300} data={cdd}>
                            <Line connectNulls type="monotone" dataKey="data" stroke="#8884d8" />
                            <CartesianGrid stroke="#ccc" strokeDasharray="5 5"  />
                            <XAxis dataKey="collected_at" domain={[cdd[0]["collected_at"], cdd[cdd.length - 1]["collected_at"]]} tickFormatter={timeStr => moment(timeStr).format('HH:mm:ss')}/>
                            <YAxis domain={[cdd[0]["data"][0], cdd[cdd.length - 1]["data"]][0]} tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)} />
                            <Tooltip />
                        </LineChart>
                    </>
                }
            </Grid>
        )
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
                    <LinearProgress/>
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
                    <Grid container
                      spacing={12}
                      alignItems="center"
                      justifyContent="center">
                        {Object.keys(channelData).map((key, idx) => (
                            <ChannelChart key={idx} channel={key} k={idx}></ChannelChart>
                        ))
                        }
                    </Grid>
                </>
            }
        </div>
    );
}

export default SensorPage;