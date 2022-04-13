import './discoveryjobs.css';
import React, { useEffect, useContext, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import useState from 'react-usestateref';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function DiscoveryJobsPage({socket}){

    const [discoveryJobs, setDiscoveryJobs, discoveryJobsRef] = useState([]);
    const [open, setOpen, openRef] = useState([]);

    const receiveDiscoveryJobs = useCallback((data) => {
        console.log(data);
        setDiscoveryJobs(data);
      }, []);

    useEffect(() => {
        socket.on("ReceiveDiscoveryScanList", receiveDiscoveryJobs)

        if(discoveryJobsRef.current.length == 0) socket.emit("RequestDiscoveryScanList");

        return () => {
            socket.off("ReceiveDiscoveryScanList", receiveDiscoveryJobs)
        }
    }, [socket]);

    useEffect(() => {
        if(openRef.current.length == discoveryJobsRef.current.length) return;
        let temp = [];
        for(let i = 0; i < discoveryJobsRef.current.length; i++){
            temp.push(false);
        }
        setOpen(temp);
    }, []);

    function RequestScanList(){
        socket.emit('RequestDiscoveryScanList');
    }

    function SetRowOpen(index, probeID){
        let temp = [...openRef.current];
        temp[index] = !temp[index];
        setOpen(temp);
    }

    function ProbeRow({job, k}) {
        return (
            <>
                <TableRow>
                    { false &&
                    <TableCell>
                        <IconButton aria-label="expand row" size="small" onClick={() => SetRowOpen(k, job.id)}>
                            {open[k] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    }
                    <TableCell>
                        {job.name}
                    </TableCell>
                    <TableCell>
                        {job.nextscantime}
                    </TableCell>
                    <TableCell>
                        {job.ipStartRange[0]}
                    </TableCell>
                    <TableCell>
                        {job.ipEndRange[0]}
                    </TableCell>
                </TableRow>

                { false &&
                    <>
                    <TableRow background>
                        <TableCell></TableCell>
                        <TableCell>
                            NETWORK
                        </TableCell>
                        <TableCell>
                            {job.networkID}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>
                            TIMEOUT
                        </TableCell>
                        <TableCell>
                            {job.discoveryTimeout} minutes
                        </TableCell>
                    </TableRow>
                    </>
                }
            </>
        )
    }

    return (
        <div className="DiscoveryJobsPage">
            <h1>Discovery Jobs Page</h1>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                NAME
                            </TableCell>
                            <TableCell>
                                NEXT TIME
                            </TableCell>
                            <TableCell>
                                START RANGE
                            </TableCell>
                            <TableCell>
                                END RANGE
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            discoveryJobs.map((job, idx) => (
                                <ProbeRow key={idx} job={job} k={idx}></ProbeRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <Button onClick={RequestScanList}>Refresh</Button>
        </div>
    );
}

export default DiscoveryJobsPage;