import React, { useEffect, useContext, useCallback} from 'react';
import useState from 'react-usestateref';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, LinearProgress, Stack, Dialog, DialogTitle, FormControl, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';

function CredentialsPage({socket}){

    const [snmpCredentials, setSNMPCredentials, snmpCredentialsRef] = useState([]);
    const [wmiCredentials, setWMICredentials, wmiCredentialsRef] = useState([]);
    const [snmpOpen, setSNMPOpen, snmpOpenRef] = useState(false);
    const [wmiOpen, setWMIOpen, wmiOpenRef] = useState(false);
    const [loadingStatus, setLoadingStatus, loadingStatusRef] = useState(true);

    const [snmpSettings, setSNMPSettings, snmpSettingsRef] = useState({"name":"", "version":2, "community":""});
    const [wmiSettings, setWMISettings, wmiSettingsRef] = useState({"name":"", "username":"", "password":""});

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
    }, []);

    function RefreshCredentialsLists(){
        socket.emit('RequestSNMPCredentials');
        socket.emit('RequestWMICredentials');
        setLoadingStatus(true);
    }

    const handleSNMPSettingsChange = (event) => {
        setSNMPSettings(prevState => ({
            ...prevState,
            [event.target.name]: event.target.value
        }));
    }

    const addSNMPCredential = () => {
        socket.emit('RegisterSNMPCredentials', snmpSettingsRef.current)
        setSNMPOpen(false);
        //RefreshCredentialsLists();
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
            <Stack spacing={2} direction="row">
                <Button variant="contained" onClick={RefreshCredentialsLists}>Refresh</Button>
                <Button variant="outlined" onClick={() => {setSNMPOpen(true)}}>Add SNMP Credentials</Button>
                <Button variant="outlined" onClick={() => {setWMIOpen(true)}}>Add WMI Credentials</Button>
            </Stack>

            <Dialog
                fullWidth={true}
                maxWidth={'sm'}
                open={snmpOpen}
                onClose={() => {setSNMPOpen(false)}}>
                    <DialogTitle>Add SNMP Credentials</DialogTitle>
                    <Box
                    noValidate
                    component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        m: 'auto',
                        width: 'fit-content',
                    }}>
                        <FormControl sx={{ mt: 2, minWidth: 120 }}>
                            <TextField id="outlined-basic" label="Nickname" variant="outlined" name="name" value={snmpSettings["name"]} onChange={handleSNMPSettingsChange} />
                            <RadioGroup row aria-labelledby="version-label" name="version" value={snmpSettings["version"]} onChange={handleSNMPSettingsChange} defaultValue={2}>
                                <FormControlLabel value={1} control={<Radio />} label="v1" />
                                <FormControlLabel value={2} control={<Radio />} label="v2" />
                                <FormControlLabel value={3} control={<Radio />} label="v3" />
                            </RadioGroup>
                            <TextField id="outlined-basic" label="Community" variant="outlined" name="community" value={snmpSettings["community"]} onChange={handleSNMPSettingsChange} />
                            <Button variant="contained" color="primary" type="submit" onClick={addSNMPCredential}>Create</Button>
                        </FormControl>
                    </Box>
            </Dialog>
        </div>
    );
}

export default CredentialsPage;