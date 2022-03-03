import './discovery.css';
import React, { useState, useEffect } from 'react';


function DiscoveryPage({socket}){

    // NETWORK SELECTION
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");

    // CREDENTIALS
    const [snmpCommunity, setSNMPCommunity] = useState("");
    const [wmiUsername, setWMIUsername] = useState("");
    const [wmiPassword, setWMIPassword] = useState("");

    // MONITORING SETTINGS
    const [discoveryName, setDiscoveryName] = useState("");
    const [icmpRespondersOnly, setICMPResponders] = useState(true);
    const [snmpTimeout, setSNMPTimeout] = useState(100);
    const [scanTimeout, setScanTimeout] = useState(600000);
    const [snmpRetries, setSNMPRetries] = useState(2);
    const [wmiRetries, setWMIRetries] = useState(2);
    const [hopCount, setHopCount] = useState(0);
    const [discoveryTimeout, setDiscoveryTimeout] = useState(10);

    function RegisterScan(){
        console.log("REGISTER SCAN")
        socket.emit('RegisterDiscoveryScan', "Test Scan", 0, {});
    }

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
            <input id="snmpCommunity" value={snmpCommunity} onInput={e => setSNMPCommunity(e.target.value)} /><br/>
            <h3>WMI</h3>
            <label htmlFor="wmiUsername">WMI Username:</label>
            <input id="wmiUsername" value={wmiUsername} onInput={e => setWMIUsername(e.target.value)} /><br/>
            <label htmlFor="wmiPassword">WMI Password:</label>
            <input id="wmiPassword" value={wmiPassword} onInput={e => setWMIPassword(e.target.value)} /><br/>

            <br/><h2>Monitoring Settings</h2>
            <label htmlFor="dName">Discovery Name:</label>
            <input id="dName" value={discoveryName} onInput={e => setDiscoveryName(e.target.value)} /><br/>
            <input type="checkbox" id="icmpResponders" value={icmpRespondersOnly} onInput={e => setICMPResponders(e.target.value)} />
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
            <input type="number" id="discoveryTimeout" value={hopCount} onInput={e => setDiscoveryTimeout(e.target.value)} /><br/>
            <br/>
            <br/>
            <button onClick={RegisterScan}>Register Scan</button>
        </div>
    );
}

export default DiscoveryPage;