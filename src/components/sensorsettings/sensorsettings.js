import PingSettings from "./pingsettings";

function SensorSettings({sensordata, socket, sensorSettings, setSensorSettings}){

    return (
        <>
        {sensordata.id == 1 && <PingSettings sensordata={sensordata} socket={socket} sensorSettings={sensorSettings} setSensorSettings={setSensorSettings} />}
        </>
    );
}

export default SensorSettings;