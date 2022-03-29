import './discoverylog.css';
import React, { useState, useEffect, useCallback} from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, IconButton, Checkbox, TableRow } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function DiscoveryLog({socket}){

    const [discoveryLogs, setDiscoveryLogs] = useState([]);

    const [selected, setSelected] = React.useState([]);

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

    
    const handleSelectAllClick = (event) => {
        /*
        if (event.target.checked) {
            const newSelecteds = rows.map((n) => n.name);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);*/
    };


    const handleClick = (event, name) => {
        /*
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
            selected.slice(0, selectedIndex),
            selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);*/
    };

    function Row(props) {
        const { row } = props;
        const [open, setOpen] = React.useState(false);

        return (
            <React.Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell>

                    </TableCell>
                    <TableCell component="th" scope="row">
                        {row.scanID}
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {row.minutesSpent}
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    }
    
    return (
        <div className="DiscoveryLog">
            <h1>Discovery Log</h1>
            <button onClick={RequestScanLogs}>Update</button>
            {discoveryLogs != null &&
                <TableContainer component={Paper}>
                     <Table aria-label="collapsible table">
                         <TableHead>
                            <TableCell />
                            <TableCell padding="checkbox">
                            </TableCell>
                            <TableCell>Scan Name</TableCell>
                            <TableCell>Scan Date</TableCell>
                         </TableHead>
                         <TableBody>
                             {discoveryLogs.map((log, idx) => (
                                 <Row key={idx} row={log}></Row>
                             ))
                             }
                         </TableBody>
                     </Table>
                </TableContainer>
            }
        </div>
    );
}

export default DiscoveryLog;