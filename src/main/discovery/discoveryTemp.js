import './discovery.css';
import React, { useState, useEffect, useContext, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function DiscoveryPage({socket}){
    let navigate = useNavigate();

    // NETWORK SELECTION
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");

    // CREDENTIALS
    const [snmpCommunity, setSNMPCommunity] = useState(0);
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

    const [firstScanTime, setFirstScanTime] = useState(new Date());
    const [nextScanTime, setNextScanTime] = useState(new Date());
    const [discoveryIsRepeating, setDiscoveryIsRepeating] = useState(false);
    //const [scanImmediate, setScanImmediate] = useState(false);

    const handleRegisterScanResult = useCallback((data) => {
        console.log(data.result);
        if(data.result){
            navigate("/discoveryjobs");
        }
      }, []);

    useEffect(() => {
        socket.on("Frontend_RegisterDiscoveryScanResult", handleRegisterScanResult)

        return () => {
            socket.off("Frontend_RegisterDiscoveryScanResult", handleRegisterScanResult)
        }
    }, [socket]);

    function RegisterScan(){
        console.log("REGISTER SCAN")
        socket.emit('RegisterDiscoveryScan', 
        {
                "probeID": "12345",
                "discoveryName": discoveryName, 
                "scanType": 0, // Address Range(s) or Subnet(s)
                "addressRanges": [[startAddress, endAddress]],
                "snmpCommunity": 0,
                "wmi": 0,
                "icmpRespondersOnly": icmpRespondersOnly,
                "snmpTimeout": snmpTimeout,
                "scanTimeout": scanTimeout,
                "snmpRetries": snmpRetries,
                "wmiRetries": wmiRetries,
                "hopCount": hopCount,
                "discoveryTimeout": discoveryTimeout,
                "nextDiscoveryTime": moment(firstScanTime).toDate().valueOf(),
                "discoveryInterval": discoveryIsRepeating ? moment(nextScanTime).add(1, 'm').diff(moment(firstScanTime)).valueOf() : null
        })
    }

    //<input type="checkbox" id="runScanNow" value={scanImmediate} onInput={e => setScanImmediate(e.target.checked)} />

    console.log(moment.now().valueOf());

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
            <h3>SNMP</h3>
            <label htmlFor="snmpCommunity">SNMP Community:</label>
            <input type="number" id="snmpCommunity" value={snmpCommunity} onInput={e => setSNMPCommunity(e.target.value)} /><br/>
            <h3>WMI</h3>
            <label htmlFor="wmiUsername">WMI:</label>
            <input type="number" id="wmiUsername" value={wmi} onInput={e => setWMI(e.target.value)} /><br/>

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
            <a>Discovery Time</a>
            <label htmlFor="runScanNow">Run scan now?</label><br/>
            <DatePicker selected={firstScanTime} onChange={(date) => setFirstScanTime(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" />
            <label htmlFor="repeatingScan">Repeating Scan?</label><br/>
            <input type="checkbox" id="repeatingScan" value={discoveryIsRepeating} onInput={e => setDiscoveryIsRepeating(e.target.checked)} />
            {discoveryIsRepeating == true &&
            <nav>
                <a>Next Discovery Time</a>
                <DatePicker
                    selected={nextScanTime}
                    onChange={(date) => setNextScanTime(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                />
            </nav>
            }
            <br/>
            <br/>
            <button onClick={RegisterScan}>Register Scan</button>
        </div>
    );
}

export default DiscoveryPage;