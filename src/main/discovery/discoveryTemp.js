import './discovery.css';


function DiscoveryPage({socket}){

    function RegisterScan(){
        console.log("REGISTER SCAN")
        socket.emit('RegisterDiscoveryScan', "Test Scan", 0);
    }

    return (
        <div className="DiscoveryPage">
            <h1>Discovery Page</h1>

            <button onClick={RegisterScan}>Register Scan</button>
        </div>
    );
}

export default DiscoveryPage;