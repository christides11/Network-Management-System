import './sensor.css';
import { useParams } from "react-router-dom";

function SensorPage(){
    let params = useParams();

    return (
        <div className="SensorPage">
            <h1>Sensor ???</h1>
        </div>
    );
}

export default SensorPage;