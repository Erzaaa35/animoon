import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI } from './api';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Videos from './pages/Videos';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#06060f',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#c084fc', fontSize: 28,
      }}>🌙</div>
    );
  }

  return (
    <Routes>
      <Route path="/"         element={<Home user={user} onLogout={logout}/>}/>
      <Route path="/login"    element={<Login onLogin={setUser}/>}/>
      <Route path="/register" element={<Register onLogin={setUser}/>}/>
      <Route path="/upload"   element={<Upload user={user}/>}/>
      <Route path="/profile"  element={<Profile user={user}/>}/>
      <Route path="/videos"   element={<Videos user={user} onLogout={logout}/>}/>
      <Route path="*"         element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}
