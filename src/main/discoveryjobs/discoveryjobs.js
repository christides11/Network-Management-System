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
        socket.on("ReceiveRegisteredDiscoveryScans", receiveDiscoveryJobs)

        return () => {
            socket.off("ReceiveRegisteredDiscoveryScans", receiveDiscoveryJobs)
        }
    }, [socket]);

    function RequestScanList(){
        socket.emit('RequestRegisteredDiscoveryScans');
    }

    return (
        <div className="DiscoveryJobsPage">
            <h1>Discovery Jobs Page</h1>
            <button onClick={RequestScanList}>Request Scan List</button>
            {discoveryJobs != null &&
                <nav>
                    <h2>Test.</h2>
                </nav>
            }
        </div>
    );
}

export default DiscoveryJobsPage;