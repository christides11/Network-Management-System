import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../main/login/login';
import DiscoveryPage from '../main/discovery/discovery';
import DevicesPage from '../main/devices/devices';
import DevicePage from '../main/device/device';
import SummaryPage from '../main/summary/summary';
import Alerts from '../main/alerts/alerts';
import EventLog from '../main/eventlog/eventLog';
import Navbar from '../components/navbar/navbar';
import Home from '../main/home/home';
import { socket, SocketContext } from '../api/socket';
import './app.css';

export default function App(){

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        console.log("a");
        if(socket != null){
            console.log(window.location.pathname);
        }
        return () => { }
    }, []);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<LoginPage socket={socket} setSocket={setSocket} />} />
                <Route path='/home' exact element={<Home />} />
                <Route path="/summary" element={<SummaryPage socket={socket} setSocket={setSocket} />} />
                <Route path="/device" element={<DevicePage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/discovery" element={<DiscoveryPage />} />
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