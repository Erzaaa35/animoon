import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI, commentAPI } from '../api';

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

const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:8000';

function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

function MiniAvatar({ name, size = 26 }) {
  const initials = (name || '?').slice(0, 2).toUpperCase();
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},50%,25%)`,
      border: `2px solid hsl(${hue},50%,40%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: C.white,
      fontFamily: FONT_DISPLAY, cursor: 'pointer',
    }}>{initials}</div>
  );
}

function CommentBlock({ videoId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const endRef = useRef(null);

  const load = () => {
    commentAPI.getVideoComments(videoId)
      .then(res => setComments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [videoId]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) { nav('/login'); return; }
    await commentAPI.addVideoComment(videoId, { text });
    setText('');
    load();
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleLike = async (commentId) => {
    if (!user) return;
    await commentAPI.likeComment(videoId, commentId);
    load();
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return;
    await commentAPI.deleteComment(videoId, commentId);
    load();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 11,
        color: C.accent, letterSpacing: '0.1em', marginBottom: 14 }}>
        💬 КОММЕНТАРИИ ({comments.length})
      </div>
      <form onSubmit={submit} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={user ? 'Написать комментарий...' : 'Войдите чтобы комментировать'}
            disabled={!user} rows={2}
            style={{ flex: 1, background: user ? C.bg2 : C.faint,
              border: `1px solid ${C.border}`, borderRadius: 8,
              color: user ? C.white : C.muted, padding: '8px 12px',
              fontSize: 13, fontFamily: FONT_BODY, outline: 'none',
              resize: 'none', boxSizing: 'border-box',
              cursor: user ? 'text' : 'not-allowed' }}/>
          {user && (
            <button type="submit"
              style={{ background: C.accentDeep, border: 'none',
                borderRadius: 8, padding: '0 16px', color: C.white,
                fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>→</button>
          )}
        </div>
        {!user && (
          <button type="button" onClick={() => nav('/login')}
            style={{ marginTop: 6, background: 'none',
              border: `1px solid ${C.border}`, borderRadius: 6,
              padding: '5px 14px', color: C.accent,
              fontSize: 12, cursor: 'pointer' }}>
            Войти для комментариев →
          </button>
        )}
      </form>
      {loading ? (
        <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
          Загрузка...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ color: C.muted, fontSize: 13, textAlign: 'center',
          padding: '16px 0', border: `1px dashed ${C.border}`, borderRadius: 8 }}>
          Комментариев пока нет 👇
        </div>
      ) : (
        <div>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 10,
              padding: '10px 0', borderBottom: `1px solid ${C.faint}` }}>
              <div onClick={() => nav(`/user/${c.username}`)} style={{ cursor: 'pointer' }}>
                <MiniAvatar name={c.display_name || c.username} size={30}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span onClick={() => nav(`/user/${c.username}`)}
                    style={{ fontWeight: 700, fontSize: 12, color: C.accent, cursor: 'pointer' }}>
                    {c.display_name || c.username}
                  </span>
                  <span style={{ fontSize: 11, color: C.muted }}>{timeAgo(c.created_at)}</span>
                </div>
                <p style={{ margin: '0 0 5px', fontSize: 13, color: C.white, lineHeight: 1.5 }}>
                  {c.text}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => handleLike(c.id)}
                    style={{ background: 'none', border: 'none',
                      cursor: user ? 'pointer' : 'default',
                      color: c.is_liked ? C.pink : C.muted,
                      fontSize: 12, padding: 0,
                      display: 'flex', alignItems: 'center', gap: 3 }}>
                    {c.is_liked ? '♥' : '♡'} {c.likes_count}
                  </button>
                  {user && c.username === user.username && (
                    <button onClick={() => handleDelete(c.id)}
                      style={{ background: 'none', border: 'none',
                        cursor: 'pointer', color: '#f87171',
                        fontSize: 12, padding: 0 }}>
                      🗑 удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>
      )}
    </div>
  );
}

function VideoCard({ video, user, onLike, onPlay }) {
  const [hov, setHov] = useState(false);
  const nav = useNavigate();

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? C.surface : C.bg2,
        border: `1px solid ${hov ? C.borderGlow : C.border}`,
        borderRadius: 12, overflow: 'hidden', transition: 'all 0.25s',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 10px 28px ${C.accentGlow}` : 'none',
        cursor: 'pointer' }}>
      <div onClick={() => onPlay(video)}
        style={{ position: 'relative', paddingTop: '56.25%',
          background: C.faint, overflow: 'hidden' }}>
        {video.thumbnail ? (
          <img src={mediaUrl(video.thumbnail)} alt={video.title}
            style={{ position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover' }}/>
        ) : (
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg,#7c3aed22,#06060f)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 36 }}>🎬</div>
        )}
        {hov && (
          <div style={{ position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%',
              border: `2px solid ${C.accent}`, background: C.accentGlow,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20 }}>▶</div>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 8, right: 8,
          background: '#00000099', borderRadius: 4,
          padding: '2px 7px', fontFamily: FONT_MONO,
          fontSize: 11, color: C.muted }}>👁 {video.views}</div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13,
          fontWeight: 700, color: C.white, marginBottom: 6,
          lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {video.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 6 }}>
          {/* Кликабельное имя автора */}
          <span onClick={(e) => { e.stopPropagation(); nav(`/user/${video.uploader_name}`); }}
            style={{ fontSize: 12, color: C.accent, cursor: 'pointer',
              textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}>
            {video.uploader_display || video.uploader_name}
          </span>
          {video.anime_title && (
            <span style={{ background: C.accentDeep+'33',
              border: `1px solid ${C.accentDeep}55`, color: C.accent,
              borderRadius: 99, padding: '1px 8px', fontSize: 10,
              fontFamily: FONT_MONO }}>
              {video.anime_title}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: C.muted }}>💬 {video.comments_count}</span>
          <button onClick={(e) => { e.stopPropagation(); onLike(video); }}
            style={{ background: 'none', border: 'none',
              cursor: user ? 'pointer' : 'default',
              color: video.is_liked ? C.pink : C.faint,
              fontSize: 13, padding: 0,
              display: 'flex', alignItems: 'center', gap: 4 }}>
            {video.is_liked ? '♥' : '♡'} {video.likes_count}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ video, onClose, user, onLike }) {
  const [liked, setLiked] = useState(video.is_liked);
  const [likes, setLikes] = useState(video.likes_count);
  const nav = useNavigate();

  const handleLike = async () => {
    if (!user) { nav('/login'); return; }
    const res = await videoAPI.like(video.id);
    setLiked(res.data.liked);
    setLikes(res.data.likes);
    onLike(video.id, res.data.liked, res.data.likes);
  };

  const videoSrc = video.video_file
    ? (video.video_file.startsWith('http') ? video.video_file : mediaUrl(video.video_file))
    : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(6,6,15,0.96)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: C.surface, border: `1px solid ${C.borderGlow}`,
        borderRadius: 16, maxWidth: 740, width: '100%',
        maxHeight: '94vh', overflowY: 'auto',
        boxShadow: `0 0 60px ${C.accentGlow}`,
        scrollbarWidth: 'thin', scrollbarColor: `${C.border} transparent` }}
        onClick={e => e.stopPropagation()}>

        <div style={{ background: '#000', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
          {videoSrc ? (
            <video src={videoSrc} controls autoPlay
              style={{ width: '100%', maxHeight: 380, display: 'block' }}/>
          ) : (
            <div style={{ aspectRatio: '16/9', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,#7c3aed22,#06060f)',
              fontSize: 48 }}>🎬</div>
          )}
        </div>

        <div style={{ padding: '18px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20,
              color: C.white, margin: 0, lineHeight: 1.3, flex: 1 }}>
              {video.title}
            </h2>
            <button onClick={onClose}
              style={{ background: 'none', border: 'none',
                color: C.muted, fontSize: 22, cursor: 'pointer',
                padding: 0, lineHeight: 1, flexShrink: 0 }}>✕</button>
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 12,
            fontSize: 12, color: C.muted, flexWrap: 'wrap',
            alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MiniAvatar name={video.uploader_display || video.uploader_name} size={22}/>
              <span onClick={() => nav(`/user/${video.uploader_name}`)}
                style={{ color: C.accent, cursor: 'pointer' }}>
                {video.uploader_display || video.uploader_name}
              </span>
            </span>
            <span>👁 {video.views}</span>
            {video.anime_title && <span>🎌 {video.anime_title}</span>}
          </div>

          {video.description && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 13,
              color: C.muted, lineHeight: 1.6, margin: '0 0 14px',
              background: C.bg2, borderRadius: 8, padding: '10px 14px' }}>
              {video.description}
            </p>
          )}

          <button onClick={handleLike}
            style={{ width: '100%', background: liked ? '#f472b622' : C.bg2,
              border: `1px solid ${liked ? C.pink : C.border}`,
              color: liked ? C.pink : C.muted, borderRadius: 8,
              padding: '10px 0', fontFamily: FONT_BODY,
              fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
              marginBottom: 4 }}>
            {liked ? '♥' : '♡'} {likes} {likes === 1 ? 'лайк' : 'лайков'}
          </button>

          <CommentBlock videoId={video.id} user={user}/>
        </div>
      </div>
    </div>
  );
}

export default function Videos({ user, onLogout }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [playing, setPlaying] = useState(null);
  const nav = useNavigate();

  const load = (search = '') => {
    setLoading(true);
    videoAPI.getAll(search ? { search } : {})
      .then(res => setVideos(res.data))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const handleLike = (videoId, liked, likes) => {
    setVideos(prev => prev.map(v =>
      v.id === videoId ? { ...v, is_liked: liked, likes_count: likes } : v
    ));
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg,
      fontFamily: FONT_BODY, color: C.white,
      display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30,
        background: C.bg + 'f2', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 24px', height: 58,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16 }}>
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
              fontFamily: FONT_BODY, fontSize: 13, color: C.accent }}>
            Видео
          </button>
        </nav>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <>
              <button onClick={() => nav('/upload')}
                style={{ background: C.accentDeep, border: 'none',
                  borderRadius: 8, padding: '6px 14px', color: C.white,
                  fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
                📤 Загрузить
              </button>
              <button onClick={() => nav('/profile')}
                style={{ background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '6px 12px', color: C.white,
                  cursor: 'pointer', fontSize: 13 }}>
                👤 {user.profile?.display_name || user.username}
              </button>
              <button onClick={onLogout}
                style={{ background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '6px 12px', color: C.muted,
                  cursor: 'pointer', fontSize: 13 }}>Выйти</button>
            </>
          ) : (
            <>
              <button onClick={() => nav('/login')}
                style={{ background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '6px 14px', color: C.white,
                  cursor: 'pointer', fontSize: 13 }}>Войти</button>
              <button onClick={() => nav('/register')}
                style={{ background: C.accentDeep, border: 'none',
                  borderRadius: 8, padding: '7px 14px', color: C.white,
                  cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                Регистрация
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <div style={{ flex: 1 }}>
        <div style={{ padding: '32px 24px 20px' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.accent,
            letterSpacing: '0.2em', marginBottom: 8 }}>
            ✦ ПОЛЬЗОВАТЕЛЬСКИЕ ВИДЕО ✦
          </div>
          <div style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 32,
              color: C.white, margin: 0 }}>
              Видео от <span style={{ color: C.accent }}>сообщества</span>
            </h1>
            {user && (
              <button onClick={() => nav('/upload')}
                style={{ background: C.accentDeep, border: 'none',
                  borderRadius: 10, padding: '10px 20px', color: C.white,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                📤 Загрузить видео
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Поиск видео..."
              style={{ width: '100%', background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.white, padding: '9px 14px 9px 38px',
                fontSize: 13, fontFamily: FONT_BODY, outline: 'none',
                boxSizing: 'border-box' }}/>
            <span style={{ position: 'absolute', left: 12,
              top: '50%', transform: 'translateY(-50%)',
              color: C.muted, pointerEvents: 'none' }}>🔍</span>
          </div>
        </div>

        <main style={{ padding: '0 24px 60px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🌙</div>
              <div>Загрузка...</div>
            </div>
          ) : videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
              <div style={{ fontSize: 18, color: C.white, marginBottom: 8 }}>
                Видео пока нет
              </div>
              <div style={{ color: C.muted, marginBottom: 24, fontSize: 14 }}>
                Стань первым кто загрузит видео!
              </div>
              <button onClick={() => nav(user ? '/upload' : '/login')}
                style={{ background: C.accentDeep, border: 'none',
                  borderRadius: 10, padding: '12px 28px', color: C.white,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {user ? '📤 Загрузить первое видео' : 'Войти и загрузить'}
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11,
                color: C.muted, letterSpacing: '0.12em', marginBottom: 16 }}>
                НАЙДЕНО {videos.length} ВИДЕО
              </div>
              <div style={{ display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))',
                gap: 16 }}>
                {videos.map(v => (
                  <VideoCard key={v.id} video={v} user={user}
                    onLike={async (video) => {
                      if (!user) { nav('/login'); return; }
                      const res = await videoAPI.like(video.id);
                      handleLike(video.id, res.data.liked, res.data.likes);
                    }}
                    onPlay={setPlaying}/>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── FOOTER — такой же как на главной ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`,
        padding: '16px 28px', display: 'flex',
        justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16,
          color: C.accent }}>🌙 AniMoon</span>
      </footer>

      {playing && (
        <VideoModal video={playing} onClose={() => setPlaying(null)}
          user={user} onLike={handleLike}/>
      )}
    </div>
  );
}
