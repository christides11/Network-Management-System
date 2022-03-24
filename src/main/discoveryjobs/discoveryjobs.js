import './discoveryjobs.css';
import React, { useState, useEffect, useContext, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';

function DiscoveryJobsPage({socket}){

    const [discoveryJobs, setDiscoveryJobs] = useState(null);

    const receiveDiscoveryJobs = useCallback((data) => {
        console.log(data);
        setDiscoveryJobs(data);
      }, []);

    useEffect(() => {
        socket.on("ReceiveDiscoveryScanList", receiveDiscoveryJobs)

        return () => {
            socket.off("ReceiveDiscoveryScanList", receiveDiscoveryJobs)
        }
    }, [socket]);

    function RequestScanList(){
        socket.emit('RequestDiscoveryScanList');
    }

    return (<div className="DiscoveryJobsPage"><h1>Discovery Jobs Page</h1><button onClick={RequestScanList}>Request Scan List</button></div>);
    /*
    return (
        <div className="DiscoveryJobsPage">
            <h1>Discovery Jobs Page</h1>
            <button onClick={RequestScanList}>Request Scan List</button>
            {discoveryJobs != null &&
                <ul>
                    {
                    discoveryJobs.map(({ discoveryName }, idx) =>
                        <li key={idx}>{discoveryName}</li>
                    )
                    }
                </ul>
            }
        </div>
    );*/
}

export default DiscoveryJobsPage;