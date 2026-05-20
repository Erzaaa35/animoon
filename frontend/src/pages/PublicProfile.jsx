import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { profileAPI, videoAPI } from '../api';

const C = {
  bg: '#06060f', bg2: '#0d0d1a', surface: '#16162e',
  border: '#2a2a4a', borderGlow: '#6c3fc5',
  accent: '#c084fc', accentDeep: '#7c3aed',
  accentGlow: 'rgba(192,132,252,0.18)',
  pink: '#f472b6', teal: '#2dd4bf',
  white: '#f1f0ff', muted: '#7b7a9e', faint: '#2e2e50',
};
const FONT_DISPLAY = "'Georgia', serif";
const FONT_BODY = "'Segoe UI', sans-serif";
const FONT_MONO = "monospace";

const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:8000';

function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function Avatar({ profile, size = 80 }) {
  const initials = (profile?.display_name || profile?.username || '?').slice(0, 2).toUpperCase();
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

export default function PublicProfile({ user }) {
  const { username } = useParams();
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    profileAPI.getPublic(username)
      .then(res => {
        setProfile(res.data);
        return videoAPI.getAll({ user: res.data.id });
      })
      .then(res => setVideos(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.muted, fontFamily: FONT_BODY }}>
      Загрузка...
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: C.muted, fontFamily: FONT_BODY, gap: 16 }}>
      <div style={{ fontSize: 48 }}>👤</div>
      <div style={{ fontSize: 18, color: C.white }}>Пользователь не найден</div>
      <button onClick={() => nav(-1)}
        style={{ background: C.accentDeep, border: 'none', borderRadius: 8,
          padding: '8px 20px', color: C.white, fontSize: 13, cursor: 'pointer' }}>
        ← Назад
      </button>
    </div>
  );

  const isOwn = user?.username === username;

  return (
    <div style={{ minHeight: '100vh', background: C.bg,
      color: C.white, fontFamily: FONT_BODY,
      display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ height: 58, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', padding: '0 28px',
        justifyContent: 'space-between', background: C.bg,
        position: 'sticky', top: 0, zIndex: 30,
        backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center',
          gap: 8, cursor: 'pointer' }} onClick={() => nav('/')}>
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
          {isOwn ? (
            <button onClick={() => nav('/profile')}
              style={{ background: C.accentDeep, border: 'none',
                borderRadius: 8, padding: '6px 14px', color: C.white,
                fontSize: 13, cursor: 'pointer' }}>
              ✏️ Мой профиль
            </button>
          ) : (
            <button onClick={() => nav(-1)}
              style={{ background: 'none', border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '6px 14px', color: C.muted,
                cursor: 'pointer', fontSize: 13 }}>
              ← Назад
            </button>
          )}
        </div>
      </header>

      {/* Banner */}
      <div style={{ height: 140, position: 'relative',
        background: `linear-gradient(135deg, ${profile.banner_color || C.accentDeep}88, #06060f)` }}/>

      {/* Profile info */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px', flex: 1, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end',
          gap: 20, marginTop: -40, marginBottom: 20 }}>
          <Avatar profile={profile} size={84}/>
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: 22,
              fontWeight: 700, fontFamily: FONT_DISPLAY }}>
              {profile.display_name || profile.username}
            </h1>
            <div style={{ color: C.muted, fontSize: 13 }}>@{profile.username}</div>
          </div>
        </div>

        {profile.bio && (
          <p style={{ color: C.white, fontSize: 14, lineHeight: 1.6,
            margin: '0 0 20px' }}>
            {profile.bio}
          </p>
        )}

        <div style={{ display: 'flex', gap: 28, marginBottom: 28 }}>
          {[
            { label: 'Видео', value: profile.videos_count },
            { label: 'Лайки', value: profile.likes_count },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.accent }}>{value}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Videos */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 18,
            color: C.accent, margin: '0 0 16px' }}>
            Видео пользователя
          </h2>
          {videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0',
              color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📹</div>
              Пользователь ещё не загружал видео
            </div>
          ) : (
            <div style={{ display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
              gap: 14 }}>
              {videos.map(v => (
                <div key={v.id} onClick={() => setPlayingVideo(v)}
                  style={{ background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '16/9', background: C.bg2,
                    position: 'relative', overflow: 'hidden' }}>
                    {v.thumbnail ? (
                      <img src={mediaUrl(v.thumbnail)} alt={v.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    ) : (
                      <div style={{ width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 28 }}>🎬</div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.white,
                      marginBottom: 4, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between',
                      fontSize: 11, color: C.muted }}>
                      <span>👁 {v.views}</span>
                      <span>❤️ {v.likes_count}</span>
                      <span>💬 {v.comments_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`,
        padding: '16px 28px', display: 'flex',
        justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16,
          color: C.accent }}>🌙 AniMoon</span>
      </footer>

      {/* Video player modal */}
      {playingVideo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(6,6,15,0.96)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 16 }}
          onClick={() => setPlayingVideo(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.borderGlow}`,
            borderRadius: 16, maxWidth: 700, width: '100%',
            maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: '#000', borderRadius: '16px 16px 0 0',
              overflow: 'hidden' }}>
              {playingVideo.video_file ? (
                <video src={mediaUrl(playingVideo.video_file)}
                  controls autoPlay
                  style={{ width: '100%', maxHeight: 360, display: 'block' }}/>
              ) : (
                <div style={{ aspectRatio: '16/9', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 48,
                  background: 'linear-gradient(135deg,#7c3aed22,#06060f)' }}>🎬</div>
              )}
            </div>
            <div style={{ padding: '16px 20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                marginBottom: 8 }}>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17,
                  color: C.white, margin: 0 }}>{playingVideo.title}</h3>
                <button onClick={() => setPlayingVideo(null)}
                  style={{ background: 'none', border: 'none', color: C.muted,
                    fontSize: 20, cursor: 'pointer', padding: 0 }}>✕</button>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                👁 {playingVideo.views} · ❤️ {playingVideo.likes_count}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
