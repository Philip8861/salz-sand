import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import Admin from './pages/Admin';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Lade...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <Game /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
