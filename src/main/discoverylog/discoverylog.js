import './discoverylog.css';
import React, { useState, useEffect, useCallback} from 'react';

function DiscoveryLog({socket}){

    const [discoveryLogs, setDiscoveryLogs] = useState(null);

    const receiveScanLogs = useCallback((data) => {
        console.log(data);
        setDiscoveryLogs(data);
      }, []);

    useEffect(() => {
        socket.on("ReceiveScanLogs", receiveScanLogs)

        return () => {
            socket.off("ReceiveScanLogs", receiveScanLogs)
        }
    }, [socket]);

    function RequestScanLogs(){
        socket.emit('RequestScanLogs');
    }

    return (
        <div className="DiscoveryLog">
            <h1>Discovery Log</h1>
            <button onClick={RequestScanLogs}>Update</button>
            {discoveryLogs != null &&
                <ul>
                    {
                        discoveryLogs.map(({ discoveryName }, idx) =>
                            <nav>
                                <li key={idx}>{discoveryName}</li>
                                {
                                    discoveryLogs[idx]["resultList"].map((x, idp) => 
                                        <li key={idx*100+idp}>{x}</li>
                                    )
                                }
                            </nav>
                        )
                    }
                </ul>
            }
        </div>
    );
}

export default DiscoveryLog;