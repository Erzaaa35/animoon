import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, videoAPI } from '../api';

const C = {
  bg: '#06060f', bg2: '#0d0d1a', surface: '#16162e',
  border: '#2a2a4a', borderGlow: '#6c3fc5',
  accent: '#c084fc', accentDeep: '#7c3aed',
  accentGlow: 'rgba(192,132,252,0.18)',
  gold: '#fbbf24', pink: '#f472b6', teal: '#2dd4bf',
  white: '#f1f0ff', muted: '#7b7a9e', faint: '#2e2e50',
};

const FONT_DISPLAY = "'Georgia', serif";
const FONT_BODY = "'Segoe UI', sans-serif";
const FONT_MONO = "monospace";

const BANNER_COLORS = [
  '#7c3aed','#2563eb','#059669','#d97706',
  '#dc2626','#db2777','#0891b2','#4f46e5',
];

const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:8000';

function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function Avatar({ profile, size = 80 }) {
  const initials = (profile?.display_name || profile?.username || '?')
    .slice(0, 2).toUpperCase();
  const color = profile?.banner_color || C.accentDeep;
  if (profile?.avatar) {
    return (
      <img src={mediaUrl(profile.avatar)} alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', border: `3px solid ${color}` }}/>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: color + '55', border: `3px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: C.white,
      fontFamily: FONT_DISPLAY }}>
      {initials}
    </div>
  );
}

export default function Profile({ user }) {
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: '', bio: '', banner_color: '#7c3aed' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    if (!user) { nav('/login'); return; }
    profileAPI.getMe().then(res => {
      setProfile(res.data);
      setForm({
        display_name: res.data.display_name || '',
        bio: res.data.bio || '',
        banner_color: res.data.banner_color || '#7c3aed',
      });
    });
    videoAPI.getAll({ user: user.id }).then(res => setVideos(res.data));
  }, [user, nav]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('display_name', form.display_name);
    fd.append('bio', form.bio);
    fd.append('banner_color', form.banner_color);
    if (avatarFile) fd.append('avatar', avatarFile);
    try {
      const res = await profileAPI.update(fd);
      setProfile(res.data);
      setSaved(true);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm('Удалить это видео?')) return;
    await videoAPI.delete(id);
    setVideos(v => v.filter(x => x.id !== id));
  };

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.muted, fontFamily: FONT_BODY }}>
      Загрузка...
    </div>
  );

  const displayProfile = avatarPreview
    ? { ...profile, avatar: avatarPreview }
    : profile;

  return (
    <div style={{ minHeight: '100vh', background: C.bg,
      color: C.white, fontFamily: FONT_BODY }}>

      {/* ── HEADER ── */}
      <header style={{ height: 60, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', padding: '0 28px',
        justifyContent: 'space-between', background: C.bg,
        position: 'sticky', top: 0, zIndex: 30,
        backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => nav('/')}>
          <span style={{ fontSize: 22 }}>🌙</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20,
            fontWeight: 700, color: C.accent }}>AniMoon</span>
        </div>
        <nav style={{ display: 'flex', gap: 2 }}>
          <button onClick={() => nav('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 12px', borderRadius: 6,
              fontFamily: FONT_BODY, fontSize: 13, color: C.muted }}>
            Каталог
          </button>
          <button onClick={() => nav('/videos')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 12px', borderRadius: 6,
              fontFamily: FONT_BODY, fontSize: 13, color: C.muted }}>
            Видео
          </button>
        </nav>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => nav('/upload')}
            style={{ background: C.accentDeep, border: 'none',
              borderRadius: 8, padding: '6px 14px', color: C.white,
              fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
            📤 Загрузить
          </button>
        </div>
      </header>

      {/* ── BANNER ── */}
      <div style={{ height: 160, position: 'relative',
        background: `linear-gradient(135deg, ${form.banner_color}99, #06060f)` }}>
        {editing && (
          <div style={{ position: 'absolute', bottom: 12, right: 16,
            display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              Цвет баннера:
            </span>
            {BANNER_COLORS.map(c => (
              <button key={c} onClick={() => setForm({ ...form, banner_color: c })}
                style={{ width: 24, height: 24, borderRadius: '50%',
                  background: c, cursor: 'pointer', padding: 0,
                  border: form.banner_color === c
                    ? '3px solid white' : '2px solid transparent' }}/>
            ))}
          </div>
        )}
      </div>

      {/* ── PROFILE BODY ── */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-end',
          gap: 20, marginTop: -44, marginBottom: 24 }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar profile={displayProfile} size={90}/>
            {editing && (
              <button onClick={() => document.getElementById('avatar-input').click()}
                style={{ position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: C.accentDeep, border: `2px solid ${C.bg}`,
                  cursor: 'pointer', fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✏️
              </button>
            )}
            <input id="avatar-input" type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handleAvatarChange}/>
          </div>

          {/* Name */}
          <div style={{ flex: 1, paddingBottom: 8 }}>
            {editing ? (
              <input value={form.display_name}
                onChange={e => setForm({ ...form, display_name: e.target.value })}
                placeholder="Отображаемое имя"
                style={{ background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 6, color: C.white, padding: '6px 12px',
                  fontSize: 18, fontWeight: 700, outline: 'none',
                  width: '100%', marginBottom: 4, boxSizing: 'border-box',
                  fontFamily: FONT_DISPLAY }}/>
            ) : (
              <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700,
                fontFamily: FONT_DISPLAY }}>
                {profile.display_name || profile.username}
              </h1>
            )}
            <div style={{ color: C.muted, fontSize: 13 }}>@{profile.username}</div>
          </div>

          {/* Buttons */}
          <div style={{ paddingBottom: 8, display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <button onClick={saveProfile} disabled={saving}
                  style={{ background: C.accentDeep, border: 'none',
                    borderRadius: 8, padding: '8px 18px', color: C.white,
                    fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
                  {saving ? '...' : '💾 Сохранить'}
                </button>
                <button onClick={() => { setEditing(false); setAvatarPreview(null); }}
                  style={{ background: 'none', border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: '8px 14px', color: C.muted,
                    cursor: 'pointer', fontSize: 13 }}>
                  Отмена
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}
                style={{ background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '8px 18px', color: C.white,
                  cursor: 'pointer', fontSize: 13 }}>
                ✏️ Редактировать
              </button>
            )}
          </div>
        </div>

        {/* Saved notice */}
        {saved && (
          <div style={{ background: '#05966922', border: '1px solid #059669',
            borderRadius: 8, padding: '10px 16px', marginBottom: 16,
            color: C.teal, fontSize: 13 }}>
            ✓ Профиль сохранён!
          </div>
        )}

        {/* Bio */}
        <div style={{ marginBottom: 24 }}>
          {editing ? (
            <textarea value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Расскажи о себе..."
              maxLength={500}
              style={{ width: '100%', background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.white, padding: '10px 14px', fontSize: 14,
                fontFamily: FONT_BODY, outline: 'none',
                resize: 'vertical', minHeight: 80, boxSizing: 'border-box' }}/>
          ) : (
            <p style={{ color: profile.bio ? C.white : C.muted,
              fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              {profile.bio || 'Нет описания. Нажми «Редактировать» чтобы добавить.'}
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
          {[
            { label: 'Видео', value: profile.videos_count },
            { label: 'Лайки', value: profile.likes_count },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>{value}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* My Videos */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 18,
              color: C.accent, margin: 0 }}>
              Мои видео
            </h2>
            <button onClick={() => nav('/upload')}
              style={{ background: C.accentDeep, border: 'none',
                borderRadius: 8, padding: '8px 16px', color: C.white,
                fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
              + Загрузить
            </button>
          </div>

          {videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0',
              color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📹</div>
              <div style={{ marginBottom: 14 }}>Ты ещё не загружал видео</div>
              <button onClick={() => nav('/upload')}
                style={{ background: C.accentDeep, border: 'none',
                  borderRadius: 8, padding: '8px 20px', color: C.white,
                  fontSize: 13, cursor: 'pointer' }}>
                Загрузить первое
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 14 }}>
              {videos.map(v => (
                <div key={v.id} style={{ background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 10,
                  overflow: 'hidden' }}>

                  {/* Thumbnail — кликабельный */}
                  <div onClick={() => setPlayingVideo(v)}
                    style={{ aspectRatio: '16/9', background: C.bg2,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 28,
                      cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                    {v.thumbnail ? (
                      <img src={mediaUrl(v.thumbnail)} alt={v.title}
                        style={{ position: 'absolute', inset: 0,
                          width: '100%', height: '100%', objectFit: 'cover' }}/>
                    ) : (
                      <span>🎬</span>
                    )}
                    {/* Hover play overlay */}
                    <div className="play-overlay"
                      style={{ position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                        e.currentTarget.querySelector('.play-btn').style.opacity = '1';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0)';
                        e.currentTarget.querySelector('.play-btn').style.opacity = '0';
                      }}>
                      <div className="play-btn"
                        style={{ width: 42, height: 42, borderRadius: '50%',
                          border: `2px solid ${C.accent}`, background: C.accentGlow,
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 16,
                          opacity: 0, transition: 'opacity 0.2s' }}>
                        ▶
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.white,
                      marginBottom: 4, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between',
                      fontSize: 11, color: C.muted, marginBottom: 8 }}>
                      <span>👁 {v.views}</span>
                      <span>❤️ {v.likes_count}</span>
                      <span>💬 {v.comments_count}</span>
                    </div>
                    <button onClick={() => deleteVideo(v.id)}
                      style={{ width: '100%', background: '#dc262622',
                        border: '1px solid #dc2626', borderRadius: 6,
                        color: '#f87171', padding: '5px 0',
                        fontSize: 12, cursor: 'pointer' }}>
                      🗑 Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── VIDEO PLAYER MODAL ── */}
      {playingVideo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(6,6,15,0.96)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 16 }}
          onClick={() => setPlayingVideo(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.borderGlow}`,
            borderRadius: 16, maxWidth: 700, width: '100%',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: `0 0 60px ${C.accentGlow}`,
            scrollbarWidth: 'thin', scrollbarColor: `${C.border} transparent` }}
            onClick={e => e.stopPropagation()}>

            {/* Player */}
            <div style={{ background: '#000', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
              {playingVideo.video_file ? (
                <video src={mediaUrl(playingVideo.video_file)}
                  controls autoPlay
                  style={{ width: '100%', maxHeight: 380, display: 'block' }}/>
              ) : (
                <div style={{ aspectRatio: '16/9', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 48,
                  background: 'linear-gradient(135deg,#7c3aed22,#06060f)' }}>
                  🎬
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '18px 22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 10 }}>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18,
                  color: C.white, margin: 0, flex: 1, lineHeight: 1.3 }}>
                  {playingVideo.title}
                </h3>
                <button onClick={() => setPlayingVideo(null)}
                  style={{ background: 'none', border: 'none', color: C.muted,
                    fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1,
                    marginLeft: 12, flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12,
                color: C.muted, marginBottom: 12, flexWrap: 'wrap' }}>
                <span>👁 {playingVideo.views} просмотров</span>
                <span>❤️ {playingVideo.likes_count} лайков</span>
                <span>💬 {playingVideo.comments_count} комментариев</span>
                {playingVideo.anime_title && <span>🎌 {playingVideo.anime_title}</span>}
              </div>
              {playingVideo.description && (
                <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.muted,
                  lineHeight: 1.6, margin: 0, background: C.bg2,
                  borderRadius: 8, padding: '10px 14px' }}>
                  {playingVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}