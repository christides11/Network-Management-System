import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import LoginPage from '../main/login/login';
import DiscoveryPage from '../main/discovery/discovery';
import DevicesPage from '../main/devices/devices';
import DevicePage from '../main/device/device';
import SummaryPage from '../main/summary/summary';
import App from './app';

const rootElement = document.getElementById("root");
render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/" element={<LoginPage />} />
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
      </Route>
    </Routes>
  </BrowserRouter>,
  rootElement
);