import React from 'react'
import './App.css';
//import {Button, TextField, Collapse} from "@material-ui/core";
//import Topbar from "./components/topbar/Topbar";
import Navbar from "./components/navbar/Navbar";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Devices from './pages/Devices';
import Alerts from './pages/Alerts';
import EventLog from './pages/EventLog';


function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/devices' element={<Devices/>} />
          <Route path='/alerts' element={<Alerts/>} />
          <Route path='/eventlog' element={<EventLog/>} />
          <Route path='/' exact element={<Home/>} />
 
        </Routes>
      </Router>
    </div>
  );
}

export default App;
