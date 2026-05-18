import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await authAPI.login(form);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      const me = await authAPI.me();
      onLogin(me.data);
      nav('/');
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  const inp = {
    display: 'block', width: '100%', marginBottom: 14,
    background: '#0d0d1a', border: '1px solid #2a2a4a',
    borderRadius: 8, color: '#f1f0ff', padding: '11px 14px',
    fontSize: 14, boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06060f',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 380, background: '#16162e', border: '1px solid #2a2a4a',
        borderRadius: 16, padding: '36px 32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌙</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22,
            margin: 0, color: '#c084fc' }}>Вход в AniMoon</h2>
        </div>
        <form onSubmit={submit}>
          <label style={{ fontSize: 12, color: '#7b7a9e', display: 'block', marginBottom: 4 }}>
            Логин
          </label>
          <input style={inp} value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="твой_логин" />
          <label style={{ fontSize: 12, color: '#7b7a9e', display: 'block', marginBottom: 4 }}>
            Пароль
          </label>
          <input style={inp} type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••" />
          {error && <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
          <button type="submit" style={{
            width: '100%', background: '#7c3aed', border: 'none', borderRadius: 8,
            padding: '12px 0', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', marginTop: 4,
          }}>Войти</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#7b7a9e' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: '#c084fc', textDecoration: 'none' }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
