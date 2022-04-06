import './devices.css';
import React, { useEffect, useContext, useCallback, useRef} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputLabel, Select, MenuItem, Checkbox, FormControlLabel, FormGroup, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, IconButton, Collapse, Typography, Button, CircularProgress } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box } from '@mui/system';
import useState from 'react-usestateref';


function DevicesPage({socket}){

    const [probeList, setProbeList, probeListRef] = useState([]);
    const [probeDeviceList, setProbeDeviceList, probeDeviceListRef] = useState([]);
    const [open, setOpen, openRef] = useState([]);
    const [temp, setTemp, tempRef] = useState(0);

    const receiveProbeList = useCallback((data) => {
        if(probeDeviceListRef.current.length != data.length){
            let t = [];
            for(let i = 0; i < data.length; i++){
                let temp = [];
                t.push(temp);
            }
            setProbeDeviceList(t);
        }
        setProbeList(data);
    });

    const receiveDeviceList = useCallback((data) => {
        for(let i = 0; i < probeListRef.current.length; i++){
            if(probeListRef.current[i].id != data.probeID) continue;
            let temp = probeDeviceListRef.current;
            temp[i] = data.devices;
            setProbeDeviceList(temp);
        }
        setTemp(tempRef+1);
    });

    useEffect(() => {
        socket.on("ReceiveProbeList", receiveProbeList)
        socket.on("ReceiveDeviceList", receiveDeviceList)
        
        if(probeList.length == 0) socket.emit("RequestProbeList");

        return () => {
            socket.off("ReceiveProbeList", receiveProbeList)
            socket.off("ReceiveDeviceList", receiveDeviceList)
        }
    }, [socket]);

    useEffect(() => {
        if(openRef.current.length == probeList.length) return;
        let temp = [];
        for(let i = 0; i < probeList.length; i++){
            temp.push(false);
        }
        setOpen(temp);
    }, []);

    function SetRowOpen(index, probeID){
        let temp = [...openRef.current];
        temp[index] = !temp[index];
        setOpen(temp);
        if(temp){
            GetProbeDeviceList(probeID);
        }
    }

    function GetProbeDeviceList(probeID){
        socket.emit("RequestDeviceListFromProbe", probeID);
    }

    function RefreshDeviceList(){
        for(let i = 0; i < probeListRef.current.length; i++){
            GetProbeDeviceList(probeListRef.current[i].id);
        }
    }

    function ProbeRow({probe, k}) {
        return (
            <React.Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                        <IconButton aria-label="expand row" size="small" onClick={() => SetRowOpen(k, probe.id)}>
                            {open[k] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell>
                        {probe.name}
                    </TableCell>
                    <TableCell>
                        {probe.ipAddress}
                    </TableCell>
                    <TableCell>
                        ...
                    </TableCell>
                    <TableCell>
                        <Button variant="contained"> 
                            <Link to={`/devices/${probe.id}`} key={probe.id}>View Details...</Link> 
                        </Button>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={open[k]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                Devices
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                Device Name
                                            </TableCell>
                                            <TableCell>
                                                Device IP
                                            </TableCell>
                                            <TableCell align="right"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {probeDeviceList.length == 0 &&
                                            <TableRow key={0}>
                                                <TableCell>
                                                    <CircularProgress />
                                                </TableCell>
                                            </TableRow>
                                        }
                                        {probeDeviceList.length != 0 &&
                                            probeDeviceList[k].map((device, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{device.name}</TableCell>
                                                <TableCell>{device.ipAddress}</TableCell>
                                                <TableCell align="right">
                                                    <Button variant="contained"> 
                                                        <Link to={`/devices/${device.id}`} key={device.id}>View Details...</Link> 
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        }
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    }

    return (
        <div className="DevicesPage">
            <h1>Devices Page</h1>
            <button onClick={RefreshDeviceList}>Refresh</button>
            <ul>
            {probeList != null &&
                <TableContainer component={Paper}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell/>
                                <TableCell>
                                    PROBE NAME
                                </TableCell>
                                <TableCell>
                                    PROBE IP
                                </TableCell>
                                <TableCell>
                                    # OF DEVICES
                                </TableCell>
                                <TableCell>

                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {probeList.map((probe, idx) => (
                                <ProbeRow key={idx} probe={probe} k={idx}></ProbeRow>
                            ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            }
            </ul>
        </div>
    );
}

export default DevicesPage;