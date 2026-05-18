import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI, animeAPI } from '../api';
import { useEffect } from 'react';

const C = {
  bg: '#06060f', surface: '#16162e', border: '#2a2a4a',
  accent: '#c084fc', accentDeep: '#7c3aed',
  white: '#f1f0ff', muted: '#7b7a9e',
};

export default function Upload({ user }) {
  const nav = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', anime: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) { nav('/login'); return; }
    animeAPI.getAll().then(res => setAnimeList(res.data));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    if (!videoFile) { setError('Выбери видеофайл'); return; }
    if (!form.title) { setError('Введи название'); return; }

    setUploading(true);
    setError('');

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('video_file', videoFile);
    if (thumbnail) fd.append('thumbnail', thumbnail);
    if (form.anime) fd.append('anime', form.anime);

    try {
      await videoAPI.upload(fd);
      setDone(true);
      setTimeout(() => nav('/videos'), 1500);
    } catch (err) {
      setError('Ошибка загрузки. Попробуй ещё раз.');
    } finally {
      setUploading(false);
    }
  };

  const inp = {
    width: '100%', background: '#0d0d1a',
    border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.white, padding: '11px 14px', fontSize: 14,
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    marginBottom: 16,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.white,
      fontFamily: "'Segoe UI', sans-serif" }}>

      <header style={{ height: 60, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', padding: '0 28px',
        justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🌙</span>
          <span style={{ fontFamily: 'Georgia', fontSize: 20,
            color: C.accent, cursor: 'pointer' }}
            onClick={() => nav('/')}>AniMoon</span>
        </div>
        <button onClick={() => nav('/')}
          style={{ background: 'none', border: `1px solid ${C.border}`,
            color: C.muted, borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', fontSize: 13 }}>
          ← Назад
        </button>
      </header>

      <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontFamily: 'Georgia', fontSize: 28,
          color: C.accent, marginBottom: 8 }}>
          📤 Загрузить видео
        </h1>
        <p style={{ color: C.muted, marginBottom: 32, fontSize: 14 }}>
          Залей свою нарезку, опенинг или обзор
        </p>

        {done ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, color: C.accent }}>Видео загружено!</div>
            <div style={{ color: C.muted, marginTop: 8 }}>Перенаправляем...</div>
          </div>
        ) : (
          <form onSubmit={submit}>

            {/* Видеофайл */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: C.muted,
                display: 'block', marginBottom: 6 }}>
                ВИДЕОФАЙЛ *
              </label>
              <div style={{
                border: `2px dashed ${videoFile ? C.accent : C.border}`,
                borderRadius: 10, padding: '28px 20px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                background: videoFile ? '#7c3aed11' : 'none',
              }}
                onClick={() => document.getElementById('video-input').click()}>
                <input id="video-input" type="file"
                  accept="video/*" style={{ display: 'none' }}
                  onChange={e => setVideoFile(e.target.files[0])}/>
                {videoFile ? (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎬</div>
                    <div style={{ color: C.accent, fontSize: 14, fontWeight: 700 }}>
                      {videoFile.name}
                    </div>
                    <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
                      {(videoFile.size / 1024 / 1024).toFixed(1)} МБ
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
                    <div style={{ color: C.white, fontSize: 14 }}>
                      Нажми чтобы выбрать видео
                    </div>
                    <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
                      MP4, AVI, MKV · максимум 500 МБ
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Превью */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: C.muted,
                display: 'block', marginBottom: 6 }}>
                ПРЕВЬЮ (необязательно)
              </label>
              <div style={{
                border: `2px dashed ${thumbnail ? C.accent : C.border}`,
                borderRadius: 10, padding: '16px 20px', textAlign: 'center',
                cursor: 'pointer',
              }}
                onClick={() => document.getElementById('thumb-input').click()}>
                <input id="thumb-input" type="file"
                  accept="image/*" style={{ display: 'none' }}
                  onChange={e => setThumbnail(e.target.files[0])}/>
                {thumbnail ? (
                  <div style={{ color: C.accent, fontSize: 13 }}>
                    🖼 {thumbnail.name}
                  </div>
                ) : (
                  <div style={{ color: C.muted, fontSize: 13 }}>
                    🖼 Добавить обложку (JPG, PNG)
                  </div>
                )}
              </div>
            </div>

            {/* Название */}
            <label style={{ fontSize: 12, color: C.muted,
              display: 'block', marginBottom: 6 }}>
              НАЗВАНИЕ *
            </label>
            <input style={inp} value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Например: АоТ — лучшие моменты"/>

            {/* Описание */}
            <label style={{ fontSize: 12, color: C.muted,
              display: 'block', marginBottom: 6 }}>
              ОПИСАНИЕ
            </label>
            <textarea style={{ ...inp, height: 100, resize: 'vertical' }}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="О чём это видео?"/>

            {/* Связь с аниме */}
            <label style={{ fontSize: 12, color: C.muted,
              display: 'block', marginBottom: 6 }}>
              СВЯЗАТЬ С АНИМЕ (необязательно)
            </label>
            <select style={{ ...inp, cursor: 'pointer' }}
              value={form.anime}
              onChange={e => setForm({ ...form, anime: e.target.value })}>
              <option value="">— не связывать —</option>
              {animeList.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>

            {error && (
              <div style={{ color: '#f87171', fontSize: 13,
                marginBottom: 16, padding: '10px 14px',
                background: '#f8717122', borderRadius: 6 }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={uploading}
              style={{
                width: '100%', background: uploading ? C.muted : C.accentDeep,
                border: 'none', borderRadius: 8, padding: '14px 0',
                color: C.white, fontSize: 15, fontWeight: 700,
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}>
              {uploading ? '⏳ Загружаем...' : '📤 Загрузить'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
