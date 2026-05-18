import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) { setError('Заполните все поля'); return; }
    if (form.password.length < 6) { setError('Пароль минимум 6 символов'); return; }
    try {
      await authAPI.register(form);
      const { data } = await authAPI.login({
        username: form.username, password: form.password
      });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      const me = await authAPI.me();
      onLogin(me.data);
      nav('/');
    } catch (err) {
      const msg = err.response?.data;
      if (msg?.username) setError('Это имя уже занято');
      else setError('Ошибка регистрации, попробуйте другие данные');
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
            margin: 0, color: '#c084fc' }}>Регистрация</h2>
        </div>
        <form onSubmit={submit}>
          <label style={{ fontSize: 12, color: '#7b7a9e', display: 'block', marginBottom: 4 }}>
            Логин *
          </label>
          <input style={inp} value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="придумай_логин" />
          <label style={{ fontSize: 12, color: '#7b7a9e', display: 'block', marginBottom: 4 }}>
            Email
          </label>
          <input style={inp} type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="твой@email.com" />
          <label style={{ fontSize: 12, color: '#7b7a9e', display: 'block', marginBottom: 4 }}>
            Пароль *
          </label>
          <input style={inp} type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="минимум 6 символов" />
          {error && <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
          <button type="submit" style={{
            width: '100%', background: '#7c3aed', border: 'none', borderRadius: 8,
            padding: '12px 0', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', marginTop: 4,
          }}>Создать аккаунт</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#7b7a9e' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: '#c084fc', textDecoration: 'none' }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
