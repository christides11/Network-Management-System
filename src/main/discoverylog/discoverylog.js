import './discoverylog.css';
import React, { useState, useEffect, useCallback} from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, IconButton, Checkbox, TableRow, Typography, Box, Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function DiscoveryLog({socket}){

    const [discoveryJobs, setDiscoveryJobs] = useState({});
    const [discoveryLogs, setDiscoveryLogs] = useState([]);
    const [selected, setSelected] = useState([]);
    const [test, setTest] = useState(0); // Force page to refresh from 2d array change, doesn't seem to change otherwise.
    const [open, setOpen] = useState([]);

    const receiveScanLogs = useCallback((data) => {
        let tfList = [];
        for(let i = 0; i < data.length; i++){
            let dList = [];
            for(let j = 0; j < data[i].devicesFound.length; j++){
                dList.push(false);
            }
            tfList.push(dList);
        }
        setSelected(tfList);
        setDiscoveryLogs(data);
      }, []);

    const receiveScanList = useCallback((data) => {
        let temp = {};
        for(let i = 0; i < data.length; i++){
            temp[data[i].id] = data[i];
        }
        setDiscoveryJobs(temp);
        console.log(temp);
    }, []);

    useEffect(() => {
        socket.on("ReceiveScanLogs", receiveScanLogs)
        socket.on("ReceiveDiscoveryScanList", receiveScanList)
        if(Object.keys(discoveryJobs).length == 0){
            socket.emit('RequestDiscoveryScanList');
        }
        if(discoveryLogs.length == 0){
            socket.emit('RequestScanLogs');
        }

        return () => {
            socket.off("ReceiveScanLogs", receiveScanLogs)
            socket.off("ReceiveDiscoveryScanList", receiveScanList)
        }
    }, [socket]);

    useEffect(() => {
        if(open.length == discoveryLogs.length) return;
        let temp = [];
        for(let i = 0; i < discoveryLogs.length; i++){
            temp.append(false);
        }
        setOpen(temp);
    }, []);

    function RegisterDevices(){
        for(let i = 0; i < discoveryLogs.length; i++){
            for(let x = 0; x < discoveryLogs[i].devicesFound.length; x++){
                if(selected[i][x] == false) continue;
                let device = discoveryLogs[i].devicesFound[x];
                let dJob = discoveryJobs[discoveryLogs[i].scanID];
                socket.emit('RegisterDevice', {"deviceName": device.deviceName, "ip": device.ip, "parentProbe": dJob.probeID, "snmpCredential": device.snmpCredID, "wmiCredential": device.wmiCredID});
            }
        }
    }

    function RequestScanLogs(){
        socket.emit('RequestScanLogs');
    }

    function RequestDiscoveryScans(){
        socket.emit('RequestDiscoveryScanList');
    }

    function SetSelectedStatus(idx, idy){
        let tfList = selected;
        tfList[idx][idy] = !tfList[idx][idy];
        setSelected(tfList);
        setTest(test+1);
    }

    function SetRowOpen(index){
        let temp = open;
        open[index] = !open[index];
        setOpen(temp);
        setTest(test+1);
    }

    function Row({row, k, s}) {

        return (
            <React.Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => SetRowOpen(k)}
                        >
                            {open[k] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell>

                    </TableCell>
                    <TableCell>
                        {discoveryJobs[row.scanID].name}
                    </TableCell>
                    <TableCell>
                        {row.date}
                    </TableCell>
                    <TableCell>
                        {row.devicesFound.length}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={open[k]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Devices Found
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell>Device Name</TableCell>
                                            <TableCell>Device IP</TableCell>
                                            <TableCell>SNMP Credentials</TableCell>
                                            <TableCell>WMI Credentials</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {row.devicesFound.map((device, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <Checkbox checked={s[k][idx]} onClick={() => SetSelectedStatus(k, idx)} />
                                                </TableCell>
                                                <TableCell>{device.deviceName}</TableCell>
                                                <TableCell>{device.ip}</TableCell>
                                                <TableCell>{device.snmpCredID}</TableCell>
                                                <TableCell>{device.wmiCredID}</TableCell>
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
        <div className="DiscoveryLog">
            <h1>Discovery Log</h1>
            <button onClick={RequestScanLogs}>Update</button>
            {discoveryLogs != null &&
                <TableContainer component={Paper}>
                     <Table aria-label="collapsible table">
                         <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell padding="checkbox">
                                </TableCell>
                                <TableCell>Discovery Job</TableCell>
                                <TableCell>Scan Date</TableCell>
                                <TableCell>Devices Found</TableCell>
                            </TableRow>
                         </TableHead>
                         <TableBody>
                             {discoveryLogs.map((log, idx) => (
                                 <Row key={idx} row={log} k={idx} s={selected}></Row>
                             ))
                             }
                         </TableBody>
                     </Table>
                </TableContainer>
            }
            <br/>
            <button onClick={RegisterDevices}>Register Device(s)</button>
        </div>
    );
}

export default DiscoveryLog;