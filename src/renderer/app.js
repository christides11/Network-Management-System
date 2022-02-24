import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

export default function App(){
    return (
        <div className="App">
            <h1>App</h1>
        </div>
    );
}