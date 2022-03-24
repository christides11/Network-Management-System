import './discovery.css';
import React, { useState, useEffect, useContext, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputLabel, Select, MenuItem, Checkbox, FormControlLabel, FormGroup } from '@mui/material';

function DiscoveryPage({socket}){
    let navigate = useNavigate();

    // NETWORK SELECTION
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");

    // CREDENTIALS
    const [snmpCredentials, setSNMPCredentials] = useState([]);
    const [snmpCommunity, setSNMPCommunity] = useState(0);
    const [wmiCredentials, setWMICredentials] = useState([]);
    const [wmi, setWMI] = useState(0);

    // MONITORING SETTINGS
    const [discoveryName, setDiscoveryName] = useState("");
    const [icmpRespondersOnly, setICMPResponders] = useState(true);
    const [snmpTimeout, setSNMPTimeout] = useState(100);
    const [scanTimeout, setScanTimeout] = useState(600000);
    const [snmpRetries, setSNMPRetries] = useState(2);
    const [wmiRetries, setWMIRetries] = useState(2);
    const [hopCount, setHopCount] = useState(0);
    const [discoveryTimeout, setDiscoveryTimeout] = useState(10);

    const [immediateScan, setImmediateScan] = useState(false);
    const [firstScanTime, setFirstScanTime] = useState(new Date());
    const [repeatType, setRepeatType] = useState(0);

    const handleRegisterScanResult = useCallback((data) => {
        console.log(data.result);
        if(data.result){
            navigate("/discoveryjobs");
        }
      }, []);

    const receiveSNMPCredentials = useCallback((data) => {
        setSNMPCredentials(data);
    });

    const receiveWMICredentials = useCallback((data) => {
        setWMICredentials(data);
    })

    useEffect(() => {
        
    });

    useEffect(() => {
        socket.on("Frontend_RegisterDiscoveryScanResult", handleRegisterScanResult)
        socket.on("ReceiveSNMPCredentials", receiveSNMPCredentials)
        socket.on("ReceiveWMICredentials", receiveWMICredentials)
        socket.emit("RequestSNMPCredentials");
        socket.emit("RequestWMICredentials");

        return () => {
            socket.off("Frontend_RegisterDiscoveryScanResult", handleRegisterScanResult)
            socket.off("ReceiveSNMPCredentials", receiveSNMPCredentials)
            socket.off("ReceiveWMICredentials", receiveWMICredentials)
        }
    }, [socket]);

    function RegisterScan(){
        console.log("REGISTER SCAN")
        socket.emit('RegisterDiscoveryScan', 
        {
                "probeID": 9,
                "discoveryName": discoveryName, 
                "scanType": 0, // Address Range(s) or Subnet(s)
                "ipStartRanges": [startAddress],
                "ipEndRanges": [endAddress],
                "subnets": [],
                "snmpCredentials": [1],
                "wmiCredentials": [1],
                "icmpRespondersOnly": icmpRespondersOnly,
                "snmpTimeout": snmpTimeout,
                "scanTimeout": scanTimeout,
                "snmpRetries": snmpRetries,
                "wmiRetries": wmiRetries,
                "hopCount": hopCount,
                "discoveryTimeout": discoveryTimeout,
                "nextDiscoveryTime": moment(firstScanTime).toDate().valueOf()
                //"discoveryInterval": discoveryIsRepeating ? moment(nextScanTime).add(1, 'm').diff(moment(firstScanTime)).valueOf() : null
        })
    }

    //<input type="checkbox" id="runScanNow" value={scanImmediate} onInput={e => setScanImmediate(e.target.checked)} />

    const handleIntervalChange = (event) => {
        setRepeatType(event.target.value);
      };

    return (
        <div className="DiscoveryPage">
            <h1>Discovery Page</h1>

            <br/><h2>Network Selection</h2>
            <h3>IP Range</h3>
            <label htmlFor="rangeStart">IP Start Address:</label>
            <input id="rangeStart" value={startAddress} onInput={e => setStartAddress(e.target.value)} /><br/>
            <label htmlFor="rangeEnd">IP End Address:</label>
            <input id="rangeEnd" value={endAddress} onInput={e => setEndAddress(e.target.value)} /><br/>

            <br/><h2>Monitoring Credentials</h2>
            <FormGroup>
                <h3>SNMP</h3>
                <InputLabel id="snmpSelect-label">SNMP Credentials</InputLabel>
                <Select labelId="snmpSelect-Label" id="snmpSelect" value={repeatType} label="Interval" onChange={e => setSNMPCommunity(e.target.value)}>
                    {
                        snmpCredentials.map((cred, idx) => 
                            <MenuItem key={idx} value={idx}>{cred[1]}</MenuItem>
                        )
                    }
                </Select>
                <h3>WMI</h3>
                <InputLabel id="wmiSelect-label">WMI Credentials</InputLabel>
                <Select labelId="wmiSelect-Label" id="wmiSelect" value={repeatType} label="Interval" onChange={e => setWMI(e.target.value)}>
                    {
                        wmiCredentials.map((cred, idx) => 
                            <MenuItem key={idx} value={idx}>{cred[1]}</MenuItem>
                        )
                    }
                </Select>
            </FormGroup>
            <br/><h2>Monitoring Settings</h2>
            <label htmlFor="dName">Discovery Name:</label>
            <input id="dName" value={discoveryName} onInput={e => setDiscoveryName(e.target.value)} /><br/>
            <input type="checkbox" id="icmpResponders" value={icmpRespondersOnly} onInput={e => setICMPResponders(e.target.checked)} />
            <label htmlFor="icmpResponders">  Include Devices with only ICMP response?</label><br/>
            <label htmlFor="snmpTimeout">SNMP Timeout (ms):</label>
            <input type="number" id="snmpTimeout" value={snmpTimeout} onInput={e => setSNMPTimeout(e.target.value)} /><br/>
            <label htmlFor="scanTimeout">Scan Timeout (ms):</label>
            <input type="number" id="scanTimeout" value={scanTimeout} onInput={e => setScanTimeout(e.target.value)} /><br/>
            <label htmlFor="snmpRetries">SNMP Retries:</label>
            <input type="number" id="snmpRetries" value={snmpRetries} onInput={e => setSNMPRetries(e.target.value)} /><br/>
            <label htmlFor="wmiRetries">WMI Retries:</label>
            <input type="number" id="wmiRetries" value={wmiRetries} onInput={e => setWMIRetries(e.target.value)} /><br/>
            <label htmlFor="hopCount">Hop Count:</label>
            <input type="number" id="hopCount" value={hopCount} onInput={e => setHopCount(e.target.value)} /><br/>
            <label htmlFor="discoveryTimeout">Discovery Timeout (minutes):</label>
            <input type="number" id="discoveryTimeout" value={discoveryTimeout} onInput={e => setDiscoveryTimeout(e.target.value)} /><br/>
            <br/><h2>Discovery Interval</h2>
            <FormGroup>
                <FormControlLabel control={<Checkbox label="RunScanNow" checked={immediateScan} onChange={(event) => { setImmediateScan(event.target.checked) }} />} label="Run Scan Now" />
                { immediateScan == false &&
                    <DatePicker selected={firstScanTime} onChange={(date) => setFirstScanTime(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" />
                }
                <InputLabel id="intervalSelect-label">Discovery Interval</InputLabel>
                <Select labelId="intervalSelect-label" id="intervalSelect" value={repeatType} label="Interval" onChange={handleIntervalChange}>
                    <MenuItem value={0}>Once</MenuItem>
                    <MenuItem value={1}>Hourly</MenuItem>
                    <MenuItem value={2}>Daily</MenuItem>
                    <MenuItem value={3}>Weekly</MenuItem>
                </Select>
            </FormGroup>
            <br/>
            <br/>
            <button onClick={RegisterScan}>Register Scan</button>
        </div>
    );
}

export default DiscoveryPage;