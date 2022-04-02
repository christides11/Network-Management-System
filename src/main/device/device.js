import './device.css';
import { useParams } from "react-router-dom";

function DevicePage(){
    let params = useParams();

    return (
        <div className="DevicePage">
            <h1>{params.deviceId}</h1>
        </div>
    );
}

export default DevicePage;