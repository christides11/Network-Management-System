import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../main/login/login';
import DiscoveryPage from '../main/discovery/discoveryTemp';
import DevicesPage from '../main/devices/devices';
import DevicePage from '../main/device/device';
import SummaryPage from '../main/summary/summary';
import Alerts from '../main/alerts/alerts';
import EventLog from '../main/eventlog/eventLog';
import Navbar from '../components/navbar/navbar';
import Home from '../main/home/home';
import { socket } from '../api/socket';
import './app.css';
import DiscoveryJobsPage from '../main/discoveryjobs/discoveryjobs';
import DiscoveryLog from '../main/discoverylog/discoverylog';

export default function App(){

    const [sessionID, setSessionID] = useState(null);

    useEffect(() => {
        /*console.log("a");
        if(socket != null){
            console.log(window.location.pathname);
        }*/
        //console.log(window.location.pathname)
        //if(sessionID == null && window.location.pathname != "/"){
        //    Navigate("/");
        //}
        return () => { }
    }, []);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<LoginPage socket={socket} sessionID={sessionID} setSessionID={setSessionID} />} />
                <Route path='/home' exact element={<Home />} />
                <Route path="/summary" element={<SummaryPage socket={socket} />} />
                <Route path="/device" element={<DevicePage />} />
                <Route path="/devices" element={<DevicesPage socket={socket} />} />
                <Route path="/discovery" element={<DiscoveryPage socket={socket} />} />
                <Route path="/discoveryjobs" element={<DiscoveryJobsPage socket={socket} />} />
                <Route path="/discoverylog" element={<DiscoveryLog socket={socket} />} />
                <Route path='/alerts' element={<Alerts/>} />
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
        </Router>
    );
}