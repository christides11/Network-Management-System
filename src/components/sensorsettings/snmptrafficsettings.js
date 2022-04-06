import { Button, ButtonGroup, RadioGroup, TextField, FormControlLabel, Radio, FormLabel } from "@mui/material";
import { useEffect } from 'react';

function SNMPTrafficSettings({sensordata, socket, sensorSettings, setSensorSettings}){

    useEffect(() => {
        setSensorSettings({
            "interface": 1 
        });
    }, []);

    const changeSettings = (event) => {
        const { name, value } = event.target;
        setSensorSettings(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    return (
        <>
        <TextField id="outlined-basic" label="Interface #" variant="outlined" type="number" name="interface" value={sensorSettings["interface"]} onChange={changeSettings}  />
        </>
    );
}

export default SNMPTrafficSettings;