import PingSettings from "./pingsettings";

function SensorSettings({sensordata, socket}){

    return (
        <>
        {sensordata.id == 1 && <PingSettings/>}
        </>
    );
}

export default SensorSettings;