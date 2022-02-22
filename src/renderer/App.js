import './App.css';
import{ Outlet, Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <h1>Hello!</h1>
      <nav>
        <Link to="/login">Login</Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default App;
