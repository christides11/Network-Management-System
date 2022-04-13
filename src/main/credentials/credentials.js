import React, { useEffect, useContext, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import useState from 'react-usestateref';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, LinearProgress } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function CredentialsPage({socket}){

    const [snmpCredentials, setSNMPCredentials, snmpCredentialsRef] = useState([]);
    const [wmiCredentials, setWMICredentials, wmiCredentialsRef] = useState([]);
    const [snmpOpen, setSNMPOpen, snmpOpenRef] = useState([]);
    const [wmiOpen, setWMIOpen, wmiOpenRef] = useState([]);
    const [loadingStatus, setLoadingStatus, loadingStatusRef] = useState(true);

    const receiveSNMPCredentials = useCallback((data) => {
        setSNMPCredentials(data);
        setLoadingStatus(false);
    }, []);

    const receiveWMICredentials = useCallback((data) => {
        setWMICredentials(data);
        setLoadingStatus(false);
    }, []);

    useEffect(() => {
        socket.on("ReceiveSNMPCredentials", receiveSNMPCredentials)
        socket.on("ReceiveWMICredentials", receiveWMICredentials)

        if(snmpCredentialsRef.current.length == 0) socket.emit("RequestSNMPCredentials");
        if(wmiCredentialsRef.current.length == 0) socket.emit("RequestWMICredentials");

        return () => {
            socket.off("ReceiveSNMPCredentials", receiveSNMPCredentials)
            socket.off("ReceiveWMICredentials", receiveWMICredentials)
        }
    }, [socket]);

    useEffect(() => {
        if(snmpOpenRef.current.length != snmpCredentialsRef.current.length){
            let temp = [];
            for(let i = 0; i < snmpCredentialsRef.current.length; i++){
                temp.push(false);
            }
            setSNMPOpen(temp);
        }
    }, []);

    function RefreshCredentialsLists(){
        socket.emit('RequestSNMPCredentials');
        socket.emit('RequestWMICredentials');
        setLoadingStatus(true);
    }

    function SetRowOpen(index, probeID){
        let temp = [...snmpOpenRef.current];
        temp[index] = !temp[index];
        setSNMPOpen(temp);
    }

    function SNMPRow({job, k}) {
        return (
            <TableRow>
                <TableCell>
                    {job[0]}
                </TableCell>
                <TableCell>
                    {job[1]}
                </TableCell>
                <TableCell>
                    {job[2]}
                </TableCell>
                <TableCell>
                    {job[3]}
                </TableCell>
            </TableRow>
        )
    }

    function WMIRow({job, k}) {
        return (
            <TableRow>
                <TableCell>
                    {job[0]}
                </TableCell>
                <TableCell>
                    {job[1]}
                </TableCell>
                <TableCell>
                    {job[2]}
                </TableCell>
                <TableCell>
                    {job[3]}
                </TableCell>
            </TableRow>
        )
    }

    return (
        <div className="CredentialsPage">
            <h1>Credentials</h1>
            {/* SNMP TABLE */}
            <TableContainer component={Paper}>
                <Table>
                    {loadingStatus == false &&
                    <>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                #
                            </TableCell>
                            <TableCell>
                                NICKNAME
                            </TableCell>
                            <TableCell>
                                VERSION
                            </TableCell>
                            <TableCell>
                                COMMUNITY
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            snmpCredentials.map((job, idx) => (
                                <SNMPRow key={idx} job={job} k={idx}></SNMPRow>
                            ))
                        }
                    </TableBody>
                    </>
                    }
                </Table>
            </TableContainer>
            <br/>
            {/* WMI TABLE */}
            <TableContainer component={Paper}>
                <Table>
                    {loadingStatus == false &&
                    <>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                #
                            </TableCell>
                            <TableCell>
                                NICKNAME
                            </TableCell>
                            <TableCell>
                                USERNAME
                            </TableCell>
                            <TableCell>
                                PASSWORD
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            wmiCredentials.map((job, idx) => (
                                <WMIRow key={idx} job={job} k={idx}></WMIRow>
                            ))
                        }
                    </TableBody>
                    </>
                    }
                </Table>
            </TableContainer>

            {
                loadingStatus &&
                <LinearProgress/>
            }
            <br/>
            <Button variant="contained" onClick={RefreshCredentialsLists}>Refresh</Button>
        </div>
    );
}

export default CredentialsPage;