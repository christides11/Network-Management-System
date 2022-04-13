import { LinearProgress } from '@mui/material';
import React, {useState, useEffect, useCallback} from 'react'

export default function Alerts({ socket }) {

    const [devicesList, setDevices] = useState([]);
    const [devicesStyling, setDevicesStyling] = useState([]);
    const [sensorsList, setSensors] = useState([]);
    const [sensorsStyling, setSensorStyling] = useState([]);

    const [loadingData, setLoadingStatus, loadingStatusRef] = useState(true);

    // runs only when socket changes
    useEffect(() => {
        // Get entire device row
        socket.on("ReceiveDeviceList", receiveDeviceList);
        socket.on("ReceiveAllDeviceSensorList", receiveAllDeviceSensorList);
        refreshData();

        return () => {
            socket.off("ReceiveDeviceList", receiveDeviceList);
            socket.off("ReceiveAllDeviceSensorList", receiveAllDeviceSensorList);
        };
        // Get entire sensor row
    }, [socket])

    // run only when devicesList changes
    useEffect(() => {
        addStylingForDeviceStatus();
    }, [devicesList])

    // run only when sensors get added
    useEffect(() => {
        addStylingForSensorStatus();
    }, [sensorsList])

    const refreshData = () => {
        socket.emit("RequestDeviceList");
        socket.emit("RequestAllDeviceSensorList");
    };

    // Callback functions from the database
    const receiveDeviceList = useCallback((devicesList) => {
        setDevices(devicesList);
        setLoadingStatus(false);
      });
    
    const receiveAllDeviceSensorList = useCallback((sensorsList) => {
        setSensors(sensorsList);
        setLoadingStatus(false);
    });

    // Styling functions
    const addStylingForDeviceStatus = () => {
        let styles = []
        devicesList.forEach(device => {
            if (device.status === 1) {
                styles.push("table-secondary") // unknown
            }
            else if (device.status === 2) {
                styles.push("table-success") // success
            } else if (device.status === 3) {
                styles.push("table-warning") // warning
            }
            else {
                styles.push("table-danger") // down
            }

            setDevicesStyling(styles);
        })
    }

    const addStylingForSensorStatus = () => {
        let styles = []
        sensorsList.forEach(sensors => {
            if (sensors.status === 1) {
                styles.push("table-secondary") // unknown
            }
            else if (sensors.status === 2) {
                styles.push("table-success") // success
            } else if (sensors.status === 3) {
                styles.push("table-warning") // warning
            }
            else {
                styles.push("table-danger") // down
            }

            setSensorStyling(styles);
        })
    }
    // End of styling functions

    return (
        <div className="container-fluid mt-3">
            <h1 >Alerts</h1>
            <hr className="w-25 mb-5"></hr>
            {loadingData && 
                <LinearProgress/>
            }
            {/* 2 sections */}
            { loadingData == false &&
            <>
            <section>
                <div className="card">
                    <div className="card-title"><h2 className="px-3 pt-3">Devices</h2></div>
                    <div className="card-body">
                        {/* Start of table */}
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">IP Address</th>
                                    <th scope="col">Status Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    devicesList.map( (device, index) => 
                                        <tr className={devicesStyling[index]} key={index}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{device.name}</td>
                                            <td>{device.ipAddress}</td>
                                            <td>{device.statusmessage}</td>
                                        </tr>
                                        
                                    )
                                }
                            </tbody>
                        </table>
                        {/* End of table */}
                    </div>

                </div>

            </section>

            <section>
            <div className="card">
                    <div className="card-title"><h2 className="px-3 pt-3">Sensors</h2></div>
                    <div className="card-body">
                        {/* Start of table */}
                        <table className="table table-hover">
                         <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Status Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    sensorsList.map( (sensor, index) => 
                                        <tr className={sensorsStyling[index]} key={index}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{sensor.name}</td>
                                            <td>{sensor.statusmessage}</td>
                                        </tr>
                                        
                                    )
                                }
                            </tbody>
                        </table>
                        {/* End of table */}
                    </div>

                </div>

            </section>
            </>
            }
        </div>
    )
}