import React, { useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from '../main/login/login';
import RegisterPage from '../main/register/register';
import DiscoveryPage from '../main/discovery/discoveryTemp';
import DevicesPage from '../main/devices/devices';
import DevicePage from '../main/device/device';
import SummaryPage from '../main/summary/summary';
import Alerts from '../main/alerts/alerts';
import EventLog from '../main/eventlog/eventLog';
import Navbar from '../components/navbar/navbar';
import { socket } from '../api/socket';
import './app.css';
import DiscoveryJobsPage from '../main/discoveryjobs/discoveryjobs';
import DiscoveryLog from '../main/discoverylog/discoverylog';
import { LocalizationProvider } from '@mui/lab';
import AdapterMoment from '@mui/lab/AdapterMoment';
import SensorPage from '../main/sensor/sensor';
import useState from 'react-usestateref';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import NetmanLogo from '../components/images/Netman-logos_black.png';

// NavBar 
import {SidebarData} from "../components/navbar/sidebarData.js";

export default function App(){

    const [sessionID, setSessionID] = useState(null);

    const [snackbarOpen, setSnackbarOpen, snackbarOpenRef] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity, snackbarSeverityRef] = useState("success");
    const [snackbarMessage, setSnackbarMessage, snackbarMessageRef] = useState("");

    const receiveDeviceRegisterResult = useCallback((data) => {
        console.log(data);
        if(data.result == false){
            setSnackbarMessage("Device was not registered: " + data.reason);
            setSnackbarSeverity("error");
        }else{
            setSnackbarMessage("Device was registered.");
            setSnackbarSeverity("success");
        }
        setSnackbarOpen(true);
    }, []);

    useEffect(() => {
        socket.on("RegisterDeviceResult", receiveDeviceRegisterResult)
        return () => { 
            socket.off("RegisterDeviceResult", receiveDeviceRegisterResult)
        }
    }, [socket]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
    };

    const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
      });

    return (
        <Router>
            {/* <Navbar /> <---- To restore previous version: Simply uncomment this line. Pickup everything inside <Routes> and Drag it out of Navbar. Finally, delete everything inside NavBar comments */}

            {/* Beginning of Nav Bar */}
        <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                {snackbarMessage}
            </Alert>
        </Snackbar>
        <div className="container-fluid">
        <div className="row">
            <div className="col-sm-auto bg-light sticky-top">
                <div className="d-flex flex-sm-column flex-row flex-nowrap bg-light align-items-center sticky-top">
                    {/* Main Link */}
                    <a className="d-block p-3 link-dark text-decoration-none" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Icon-only">
                        <Link to={"/"}>
                        <img src={NetmanLogo} className="img-fluid" width={75} height={75}/>
                        </Link>
                    </a>

                    {/* Start of Links */}
                    <ul className="nav nav-pills nav-flush flex-sm-column flex-row flex-nowrap mb-auto mx-auto text-center align-items-center">

                    {/* {SidebarData.map((item, index) => {
                        return(
                            <li key={index} className={item.cName}>
                                <Link to={item.path}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        )
                    })} */}

                        {/* Link Item */}
                        <li className="nav-item">
                            <a className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Home">
                                <Link to={"/summary"}>
                                <i className="bi-house fs-1"></i>
                                <p>Home</p>
                                </Link>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <Link to={"/devices"}>
                                <i className="bi bi-laptop fs-1"></i>
                                <p>Devices</p>
                                </Link>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <Link to={"/alerts"}>
                                <i className="bi bi-alarm fs-1"></i>
                                <p>Alerts</p>
                                </Link>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <Link to={"/credentials"}>
                                <i className="bi bi-credit-card-2-front fs-1"></i>
                                <p>Credentials</p>
                                </Link>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <Link to={"/discovery"}>
                                <i className="bi bi-plus-circle fs-1"></i>
                                <p>Create</p>
                                </Link>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <Link to={"/discoveryjobs"}>
                                <i className="bi bi-eye fs-1"></i>
                                <p>View</p>
                                </Link>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <Link to={"/discoverylog"}>
                                <i className="bi bi-archive fs-1"></i>
                                <p>Logs</p>
                                </Link>
                            </a>
                        </li>

                        {/* End of links */}
                    </ul>
                </div>
            </div>
            <div className="col-sm p-3 min-vh-100">
                {/* content */}
                <main>
                <Routes>
                <Route path="/" element={<LoginPage socket={socket} sessionID={sessionID} setSessionID={setSessionID} />} />
                <Route path="/register" element={<RegisterPage socket={socket} sessionID={sessionID} setSessionID={setSessionID} />} />
                <Route path="/summary" element={<SummaryPage socket={socket} sessionID={sessionID} />} />
                <Route path="/devices" element={<DevicesPage socket={socket} />} />
                <Route path="/devices/:deviceId" element={<DevicePage socket={socket} />} />
                <Route path="/devices/:deviceId/sensor/:sensorId/id/:id" element={<SensorPage socket={socket} />} />
                <Route path="/discovery" element={ <LocalizationProvider dateAdapter={AdapterMoment}> <DiscoveryPage socket={socket} /> </LocalizationProvider>} />
                <Route path="/discoveryjobs" element={<DiscoveryJobsPage socket={socket} />} />
                <Route path="/discoverylog" element={<DiscoveryLog socket={socket} />} />
                <Route path='/alerts' element={<Alerts socket={socket}/>} />
                <Route path='/eventlog' element={<EventLog />} />
                <Route
                    path="*"
                    element={
                    <main style={{ padding: "1rem" }}>
                        <p>There's nothing here!</p>
                    </main>
                    }
                />
            </Routes>
                </main>
            </div>
        </div>
    </div>
        </Router>
    );
}