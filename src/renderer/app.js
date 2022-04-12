import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

import NetmanLogo from '../components/images/Netman-logos_black.png';

// NavBar 
import {SidebarData} from "../components/navbar/sidebarData.js";

export default function App(){

    const [sessionID, setSessionID] = useState(null);

    const receiveDeviceRegisterResult = useCallback((data) => {
        console.log(data);
    }, []);

    useEffect(() => {
        socket.on("RegisterDeviceResult", receiveDeviceRegisterResult)
        return () => { 
            socket.off("RegisterDeviceResult", receiveDeviceRegisterResult)
        }
    }, []);

    return (
        <Router>
            {/* <Navbar /> <---- To restore previous version: Simply uncomment this line. Pickup everything inside <Routes> and Drag it out of Navbar. Finally, delete everything inside NavBar comments */}

            {/* Beginning of Nav Bar */}
            <div className="container-fluid">
        <div className="row">
            <div className="col-sm-auto bg-light sticky-top">
                <div className="d-flex flex-sm-column flex-row flex-nowrap bg-light align-items-center sticky-top">
                    {/* Main Link */}
                    <a href="/" className="d-block p-3 link-dark text-decoration-none" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Icon-only">
                        <img src={NetmanLogo} className="img-fluid" width={75} height={75}/>
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
                            <a href="/summary" className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Home">
                                <i className="bi-house fs-1"></i>
                                <p>Home</p>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a href="/devices" className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <i className="bi bi-laptop fs-1"></i>
                                <p>Devices</p>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a href="/alerts" className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <i className="bi bi-alarm fs-1"></i>
                                <p>Alerts</p>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a href="/credentials" className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <i className="bi bi-credit-card-2-front fs-1"></i>
                                <p>Credentials</p>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a href="/discovery" className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <i className="bi bi-plus-circle fs-1"></i>
                                <p>Create</p>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a href="/discoveryjobs" className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <i className="bi bi-eye fs-1"></i>
                                <p>View</p>
                            </a>
                        </li>

                        {/* Link Item */}
                        <li>
                            <a href="/discoverylog" className="nav-link py-2 px-2" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                                <i className="bi bi-archive fs-1"></i>
                                <p>Logs</p>
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