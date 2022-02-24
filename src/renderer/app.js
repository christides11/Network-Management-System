import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../main/login/login';
import DiscoveryPage from '../main/discovery/discovery';
import DevicesPage from '../main/devices/devices';
import DevicePage from '../main/device/device';
import SummaryPage from '../main/summary/summary';
import { socket, SocketContext } from '../api/socket';

export default function App(){

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        return () => { }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage socket={socket} setSocket={setSocket} />} />
                <Route path="/summary" element={<SummaryPage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/discovery" element={<DiscoveryPage />} />
                <Route path="/device" element={<DevicePage />} />
                <Route
                    path="*"
                    element={
                    <main style={{ padding: "1rem" }}>
                        <p>There's nothing here!</p>
                    </main>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}