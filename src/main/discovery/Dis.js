import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

// MUI Things + Date Picker
import { TextField } from '@mui/material';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { TimePicker } from '@mui/lab'; // Time Picker
// 

export default function Dis({socket}) {
    let navigate = useNavigate();

    // Get needed values to fill selection and listeners
    useEffect(() => {
        socket.on("Frontend_RegisterDiscoveryScanResult", handleRegisterScanResult)
        socket.on("ReceiveSNMPCredentials", receiveSNMPCredentials)
        socket.on("ReceiveWMICredentials", receiveWMICredentials)
        socket.on("ReceiveProbeList", receiveProbeList)

        socket.emit("RequestSNMPCredentials");
        socket.emit("RequestWMICredentials");
        socket.emit("RequestProbeList");

        return () => {
            socket.off("Frontend_RegisterDiscoveryScanResult", handleRegisterScanResult)
            socket.off("ReceiveSNMPCredentials", receiveSNMPCredentials)
            socket.off("ReceiveWMICredentials", receiveWMICredentials)
            socket.off("ReceiveProbeList", receiveProbeList)
        }
    }, [socket]);

    // State
    // NETWORK SELECTION
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");
    const [probeList, setProbeList] = useState([]);
    const [probe, setProbe] = useState(0);

    // CREDENTIALS
    const [snmpCredentials, setSNMPCredentials] = useState([]);
    const [snmpCommunity, setSNMPCommunity] = useState(0);
    const [wmiCredentials, setWMICredentials] = useState([]);
    const [wmi, setWMI] = useState(0);

    // MONITORING SETTINGS
    const [discoveryName, setDiscoveryName] = useState("");
    const [icmpRespondersOnly, setICMPResponders] = useState(true);
    const [snmpTimeout, setSNMPTimeout] = useState(500);
    const [scanTimeout, setScanTimeout] = useState(2000);
    const [snmpRetries, setSNMPRetries] = useState(2);
    const [wmiRetries, setWMIRetries] = useState(2);
    const [hopCount, setHopCount] = useState(0);
    const [discoveryTimeout, setDiscoveryTimeout] = useState(10);

    const [immediateScan, setImmediateScan] = useState(false);
    const [firstScanTime, setFirstScanTime] = useState(new Date());
    
    const [repeatType, setRepeatType] = useState(0);
    const [repeatValue, setRepeatValue] = useState(moment());

    // End of State

    // Functions
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

    const receiveProbeList = useCallback((data) => {
        setProbeList(data);
    })

    const handleIntervalChange = (event) => {
        setRepeatType(event.target.value);
    };

    // End of Helper Functions

    // Register Scan Function
    const RegisterScan = () => {
        console.log("REGISTER SCAN")
        let val = moment();
         // Only care about minutes.
        if(repeatType == 1){
            val.set('minutes', repeatValue.minutes()).set('second', 0);//.duration(repeatValue.minutes(), "minutes");//repeatValue.minutes();
        }else if(repeatType == 2){ // Only care about hours & minutes.
            val.set('hour', repeatValue.hours()).set('minute', repeatValue.minutes()).set('second', 0);
        }
        console.log(val.utc().format())
        socket.emit('RegisterDiscoveryScan', 
        {
                "network": 1,
                "probeID": probeList[probe].id,
                "discoveryName": discoveryName, 
                "scanType": 0, // Address Range(s) or Subnet(s)
                "ipStartRanges": [startAddress],
                "ipEndRanges": [endAddress],
                "subnets": ["0"],
                "snmpCredentials": [1],
                "wmiCredentials": [1],
                "icmpRespondersOnly": icmpRespondersOnly,
                "snmpTimeout": snmpTimeout,
                "scanTimeout": scanTimeout,
                "snmpRetries": snmpRetries,
                "wmiRetries": wmiRetries,
                "hopCount": hopCount,
                "discoveryTimeout": discoveryTimeout,
                "scanfrequencytype": repeatType,
                "nextscantime": val.utc().valueOf()
        })
    }
    // 

  return (
    <div className="container my-3">
        <section className="container-fluid">
            <h1 className='display-5 text-center'>Create a new Scan Job</h1>
            <hr className="w-25 mx-auto"></hr>



            <form>
                <div>
                    <h2>Network Selection</h2>
                    <div class="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Choose available probe</label>
                        <div className="col-sm-10">
                            {/* New Content Goes Here (change helper text names) */}
                            <select id="inputState" class="form-control" aria-describedby="probePicker" value={probe} onChange={e => setProbe(e.target.value)}>
                                {
                                    probeList.map(({name}, idx) => 
                                        <option key={idx} value={idx}>{name}</option>
                                    )
                                }
                            </select>
                            <small id="probePicker" class="form-text text-muted">
                                What probe would you like to use?
                            </small>
                            {/* New Content Goes Here */}
                        </div>
                    </div>

                    <div class="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">IP Range</label>
                        <div className="col-sm-5">
                            {/* New Content Goes Here (change helper text names) */}
                            <input class="form-control" type="text" placeholder="Start IP Address" value={startAddress} onInput={e => setStartAddress(e.target.value)} aria-describedby='ip-start-address' />
                            <small id="ip-start-address" class="form-text text-muted">
                                E.g. 10.0.0.0
                            </small>
                            {/* New Content Goes Here */}
                        </div>
                        <div className="col-sm-5">
                            <input class="form-control" type="text" placeholder="End IP Address" value={endAddress} onInput={e => setEndAddress(e.target.value)} aria-describedby='ip-end-address' />
                            <small id="ip-end-address" class="form-text text-muted">
                                E.g. 10.0.1.0
                            </small>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="mt-5">Monitoring Credentials</h2>
                    <div class="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Credentials</label>
                        <div className="col-sm-5">
                            {/* New Content Goes Here (change helper text names) */}
                            <select id="inputState" class="form-control" aria-describedby="snmpCredentials-helper" value={snmpCredentials} onChange={e => setSNMPCredentials(e.target.value)}>
                                {
                                    snmpCredentials.map((cred, idx) => 
                                        <option key={idx} value={idx}>{cred[1]}</option>
                                    )
                                }
                            </select>
                            <small id="snmpCredentials-helper" class="form-text text-muted">
                                Used to login to devices using SNMP
                            </small>
                            {/* New Content Goes Here */}
                        </div>
                        <div className="col-sm-5">
                        <select id="inputState" class="form-control" aria-describedby="wmiCredentials-helper" value={wmiCredentials} onChange={e => setWMICredentials(e.target.value)}>
                                {
                                    wmiCredentials.map((cred, idx) => 
                                        <option key={idx} value={idx}>{cred[1]}</option>
                                    )
                                }
                            </select>
                            <small id="wmiCredentials-helper" class="form-text text-muted">
                            Used to login to devices using WMI
                            </small>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="mt-5">Monitoring Settings</h2>
                    <div class="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Discovery Name</label>
                        <div className="col-sm-10">
                            <input class="form-control" type="text" placeholder="Discovery Name" value={discoveryName} onInput={e => setDiscoveryName(e.target.value)} aria-describedby='d-name' />
                            <small id="d-name" class="form-text text-muted">
                                Name of Discovery Scan Job
                            </small>
                        </div>
                    </div>
                    <div class="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Only devices with ICMP response</label>
                        <div className="col-sm-10">
                            <input class="form-check-input" type="checkbox" id="gridCheck" value={icmpRespondersOnly} onInput={e => setICMPResponders(e.target.checked)}  />
                        </div>
                    </div>
                    <div class="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Timeout</label>
                        <div className="col-sm-3">
                            {/* New Content Goes Here (change helper text names) */}
                            <input class="form-control" type="number" placeholder="Enter timeout value" value={snmpTimeout} onInput={e => setSNMPTimeout(e.target.value)} aria-describedby='snmp-timeout-label' />
                            <small id="snmp-timeout-label" class="form-text text-muted">
                                SNMP Timeout (ms)
                            </small>
                            {/* New Content Goes Here */}
                        </div>
                        <div className="col-sm-3">
                        <input class="form-control" type="number" placeholder="Enter timeout value" value={scanTimeout} onInput={e => setScanTimeout(e.target.value)} aria-describedby='scan-timeout-label' />
                            <small id="scan-timeout-label" class="form-text text-muted">
                                Scan Timeout (ms)
                            </small>
                        </div>
                        <div className="col-sm-3">
                        <input class="form-control" type="number" placeholder="Enter timeout value" value={discoveryTimeout} onInput={e => setDiscoveryTimeout(e.target.value)} aria-describedby='scan-timeout-label' />
                            <small id="scan-timeout-label" class="form-text text-muted">
                                Discovery Timeout (minutes)
                            </small>
                        </div>
                    </div>
                    <div class="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Retries</label>
                        <div className="col-sm-5">
                            {/* New Content Goes Here (change helper text names) */}
                            <input class="form-control" type="number" placeholder="Enter retry value" value={snmpRetries} onInput={e => setSNMPRetries(e.target.value)} aria-describedby='snmp-retries' />
                            <small id="snmp-retries" class="form-text text-muted">
                                SNMP Retries
                            </small>
                            {/* New Content Goes Here */}
                        </div>
                        <div className="col-sm-5">
                        <input class="form-control" type="number" placeholder="Enter retry value" value={wmiRetries} onInput={e => setWMIRetries(e.target.value)} aria-describedby='wmi-retries' />
                            <small id="wmi-retries" class="form-text text-muted">
                                WMI Retries
                            </small>
                        </div>
                    </div>
                    <div class="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Hop Count</label>
                        <div className="col-sm-3">
                            {/* New Content Goes Here (change helper text names) */}
                            <input class="form-control" type="number" placeholder="Enter Hop Count" value={hopCount} onInput={e => setHopCount(e.target.value)} aria-describedby='hop-count' />
                            <small id="hop-count" class="form-text text-muted">
                                Hop Count
                            </small>
                            {/* New Content Goes Here */}
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="mt-5">Discovery Interval</h2>
                    <div className="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Run Scan Now</label>
                        <div className="col-sm-10">
                            <input class="form-check-input" type="checkbox" id="gridCheck" checked={immediateScan} onChange={(event) => setImmediateScan(event.target.checked) } />
                        </div>
                        </div>
                        {
                            (immediateScan) ? <></> :
                            <div className="form-group row mb-3">
                                <label for="inputState" className="col-sm-2 col-form-label">Pick start date for scan</label>
                                <div className="col-sm-10">
                                    <DatePicker selected={firstScanTime} onChange={(date) => setFirstScanTime(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" />
                                </div>
                            </div>
                        }
                    
                    <div className="form-group row mb-3">
                        <label for="inputState" className="col-sm-2 col-form-label">Discovery Interval</label>
                        <div className="col-sm-10">
                            <select id="inputState" class="form-control" aria-describedby="discovery-interval-helper" value={repeatType} label="Interval" onChange={handleIntervalChange}>
                                <option selected value={0}>Once</option>
                                <option value={1}>Hourly</option>
                                <option value={2}>Daily</option>
                                <option value={3}>Custom</option>
                            </select>
                            <small id="discovery-interval-helper" class="form-text text-muted">
                                Interval at which the scan will repeat
                            </small>
                        </div>
                    </div>

                    {
                        (repeatType == 1) ?
                        <div className="form-group row mb-3">
                            {console.log("called")}
                                <label for="inputState" className="col-sm-2 col-form-label">Pick start time for scan</label>
                                <div className="col-sm-10">
                                <TimePicker 
                                    ampm={false}
                                    views={['minutes']}
                                    inputFormat="mm" 
                                    mask="__" 
                                    label="time" 
                                    value={repeatValue}
                                    onChange={(newValue) => { setRepeatValue(newValue);}} 
                                    renderInput={(params) => <TextField {...params}/>}/>
                                </div>
                            </div>
                        : <></>
                        
                    }
                    {
                        (repeatType == 2) ?
                        <div className="form-group row mb-3">
                                <label for="inputState" className="col-sm-2 col-form-label">Pick start time for scan</label>
                                <div className="col-sm-10">
                                <TimePicker 
                                    ampm={true}
                                    views={['hours','minutes']}
                                    inputFormat="HH:mm" 
                                    mask="__:__" 
                                    label="time" 
                                    value={repeatValue}
                                    onChange={(newValue) => { setRepeatValue(newValue);}} 
                                    renderInput={(params) => <TextField {...params}/>}/>
                                </div>
                            </div>
                        : <></>
                        
                    }
                </div>
                <div className="text-center">
                    <button onClick={RegisterScan} className='btn btn-success w-25 my-4'>🎉 All done. Register your job!</button>
                </div>
            </form>
        </section>
    </div>
  )
}
