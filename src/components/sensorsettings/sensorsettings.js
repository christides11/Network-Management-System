import PingSettings from "./pingsettings";
import SNMPTrafficSettings from "./snmptrafficsettings";

function SensorSettings({sensordata, socket, sensorSettings, setSensorSettings}){

    return (
        <>
        {sensordata.id == 1 && <PingSettings sensordata={sensordata} socket={socket} sensorSettings={sensorSettings} setSensorSettings={setSensorSettings} />}
        {sensordata.id == 2 && <SNMPTrafficSettings sensordata={sensordata} socket={socket} sensorSettings={sensorSettings} setSensorSettings={setSensorSettings} />}
        </>
    );
}

export default SensorSettings;