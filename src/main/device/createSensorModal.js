import { Dialog, DialogTitle, FormControl, InputLabel, Modal, Select, Typography, MenuItem, TextField, Button } from "@mui/material";
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

function CreateSensorModal({device, open, handleClose, socket}){
    const [sensorindex, setSensorIndex, sensorIndexRef] = useState(-1);
    const [sensorList, setSensorList, sensorListRef] = useState([]);
    const [generalSettings, setGeneralSettings, generalSettingsRef] = useState({"name":""});
    const [sensorSettings, setSensorSettings, sensorSettingsRef] = useState({});

    const handleSensorIDChange = (event) => {
        setSensorIndex(event.target.value);
    }

    const handleNameChange = (event) => {
        setGeneralSettings(prevState => ({
            ...prevState,
            ["name"]: event.target.value
        }));
    }

    const receiveSensorList = (data) => {
        setSensorList(data);
    }

    const localHandleClose = () => {
        handleClose();
    }

    const handleCreateSensor = () => {
        socket.emit("RegisterDeviceSensor", {"deviceid": device.id, "sensorid": sensorListRef.current[sensorIndexRef.current].id, "settings": generalSettings, "sensorSettings": sensorSettings})
        localHandleClose();
    };

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
                            <TextField id="outlined-basic" label="Sensor Name" variant="outlined" value={generalSettings["name"]} onChange={handleNameChange} />
                            <br/>
                            <SensorSettings sensordata={sensorList[sensorindex]} socket={socket} sensorSettings={sensorSettings} setSensorSettings={setSensorSettings} />
                        </>
                    }
                    <Button variant="contained" color="primary" type="submit" onClick={handleCreateSensor}>Create Sensor</Button>
                </FormControl>
            </Box>
        </Dialog>
    );
}

export default CreateSensorModal;