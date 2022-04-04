import { Button, ButtonGroup, RadioGroup, TextField, FormControlLabel, Radio, FormLabel } from "@mui/material";
import { useEffect } from 'react';
import useState from 'react-usestateref';

function PingSettings({sensordata, socket, sensorSettings, setSensorSettings}){

    useEffect(() => {
        setSensorSettings({
            "timeout": 0,
            "packetsize": 32,
            "method": 0,
            "pingcount": 5,
            "packetdelay": 5
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
        <TextField id="outlined-basic" label="Timeout (Sec.)" variant="outlined" type="number" name="timeout" value={sensorSettings["timeout"]} onChange={changeSettings}  />
        <TextField id="outlined-basic" label="Packet Size (Bytes)" variant="outlined" type="number" name="packetsize" value={sensorSettings["packetsize"]} onChange={changeSettings} />
        <FormLabel id="ping-method-label">Ping Method</FormLabel>
        <RadioGroup row aria-labelledby="ping-method-label" name="method" value={sensorSettings["method"]} onChange={changeSettings} defaultValue={0}>
            <FormControlLabel value={0} control={<Radio />} label="Single Ping" />
            <FormControlLabel value={1} control={<Radio />} label="Multiple Pings" />
        </RadioGroup>
        { sensorSettings["method"] == 1 &&
        <>
            <TextField id="outlined-basic" label="Ping Count" variant="outlined" type="number" name="pingcount" value={sensorSettings["pingcount"]} onChange={changeSettings} />
            <TextField id="outlined-basic" label="Packet Delay (ms)" variant="outlined" type="number" name="packetdelay" value={sensorSettings["packetdelay"]} onChange={changeSettings} />
        </>
        }
        </>
    );
}

export default PingSettings;