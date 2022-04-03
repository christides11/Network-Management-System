import { TextField } from "@mui/material";

function PingSettings({sensordata, socket}){
    return (
        <>
        <TextField id="outlined-basic" label="Timeout (Sec.)" variant="outlined" />
        </>
    );
}

export default PingSettings;