import { Dialog, DialogTitle, FormControl, InputLabel, Modal, Select, Typography, MenuItem, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect } from 'react';
import useState from 'react-usestateref';
import SensorSettings from "../../components/sensorsettings/sensorsettings";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

function CreateSensorModal({open, handleClose, socket}){
    const [sensorindex, setSensorIndex, sensorIndexRef] = useState(-1);
    const [sensorList, setSensorList, sensorListRef] = useState([]);
    const [name, setName, nameRef] = useState("");

    const handleSensorIDChange = (event) => {
        setSensorIndex(event.target.value);
    }

    const receiveSensorList = (data) => {
        setSensorList(data);
    }

    const localHandleClose = () => {
        setSensorIndex(0);
        setName("");
        handleClose();
    }

    useEffect(() => {
        socket.on("ReceiveSensorList", receiveSensorList);

        if(sensorListRef.current.length == 0) socket.emit("RequestSensorList");

        return () => {
            socket.off("ReceiveSensorList", receiveSensorList)
        }
    }, [socket]);

    return (
        <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
        onClose={localHandleClose}>
            <DialogTitle>Add Sensor</DialogTitle>
            <Box
            noValidate
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                m: 'auto',
                width: 'fit-content',
              }}
            >
                <FormControl sx={{ mt: 2, minWidth: 120 }}>
                    <InputLabel htmlFor="sensor">Sensor</InputLabel>
                    <Select 
                    autoFocus
                    value={sensorindex}
                    onChange={handleSensorIDChange}
                    label="sensor">
                        <MenuItem value={-1}>None</MenuItem>
                        {sensorList.map((s, idx) => (
                            <MenuItem key={idx} value={idx} row={s}>{s.name}</MenuItem>
                        ))
                        }
                    </Select>
                    {sensorindex != -1 &&
                        <>
                            <TextField id="outlined-basic" label="Sensor Name" variant="outlined" value={name} onChange={(event) => { setName(event.target.value); }} />
                            <br/>
                            <SensorSettings sensordata={sensorList[sensorindex]} socket={socket} />
                        </>
                    }
                </FormControl>
            </Box>
        </Dialog>
    );
}

export default CreateSensorModal;