import './discoveryjobs.css';
import React, { useState, useEffect, useContext, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';


function DiscoveryJobsPage({socket}){

    useEffect(() => {
        //socket.on("Frontend_RegisterDiscoveryScanResult", handleRegisterScanResult)

        return () => {
            //socket.off("Frontend_RegisterDiscoveryScanResult", handleRegisterScanResult)
        }
    }, [socket]);

    return (
        <div className="DiscoveryJobsPage">
            <h1>Discovery Jobs Page</h1>
        </div>
    );
}

export default DiscoveryJobsPage;