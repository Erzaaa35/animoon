import { useState, useEffect } from 'react';
import { animeAPI, favoriteAPI, commentAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const FONT_DISPLAY = "'Georgia', serif";
const FONT_BODY = "'Segoe UI', sans-serif";
const FONT_MONO = "monospace";

const C = {
  bg: '#06060f', bg2: '#0d0d1a', bg3: '#13132a',
  surface: '#16162e', border: '#2a2a4a', borderGlow: '#6c3fc5',
  accent: '#c084fc', accentDeep: '#7c3aed',
  accentGlow: 'rgba(192,132,252,0.18)',
  gold: '#fbbf24', pink: '#f472b6', teal: '#2dd4bf',
  white: '#f1f0ff', muted: '#7b7a9e', faint: '#2e2e50',
};

const GENRES = ['Все','Сёнэн','Сёдзё','Исэкай','Меха','Романтика','Экшен','Триллер','Фэнтези'];

const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:8000';

function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

// Рабочие YouTube embed ID для каждого аниме
const ANIME_VIDEOS = {
  'Атака Титанов':               'EohPsrO6qZ0', // AoT финальный сезон трейлер RU
  'Клинок, рассекающий демонов': 'VQGCKyvzIM4', // Demon Slayer official trailer
  'Стальной Алхимик':            'kx0nBaS_q50', // FMA Brotherhood trailer
  'Violet Evergarden':           'tNpWUtEdHJw', // Violet Evergarden Movie Netflix
  'Хоримия':                     'e4RCugyx5No', // Horimiya official trailer
  'Тетрадь смерти':              'NlJZ-YgAt-c', // Death Note Crunchyroll trailer
  'Оверлорд':                    'ffTKNwHF70c', // Overlord season 1 trailer
  'Евангелион':                  '13nSISwxrY4', // NGE Netflix official trailer
};

function Badge({ children, color }) {
  return (
    <span style={{
      background: color + '22', border: `1px solid ${color}55`,
      color, borderRadius: 99, padding: '2px 10px',
      fontSize: 11, fontFamily: FONT_MONO, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Avatar({ profile, username, size = 32 }) {
  const name = profile?.display_name || username || '?';
  const initials = name.slice(0, 2).toUpperCase();
  const color = profile?.banner_color || C.accentDeep;
  if (profile?.avatar) {
    return (
      <img src={mediaUrl(profile.avatar)} alt={name}
        style={{ width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', border: `2px solid ${color}`, flexShrink: 0 }}/>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color + '44', border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: C.white,
      fontFamily: FONT_DISPLAY,
    }}>{initials}</div>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

function CommentItem({ comment, animeId, user, onReload }) {
  const [liked, setLiked] = useState(comment.is_liked);
  const [likes, setLikes] = useState(comment.likes_count);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await commentAPI.likeAnimeComment(animeId, comment.id);
      setLiked(res.data.liked); setLikes(res.data.likes);
    } catch (e) {}
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await commentAPI.addAnimeComment(animeId, { text: replyText, parent: comment.id });
    setReplyText(''); setShowReply(false); onReload();
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить?')) return;
    await commentAPI.deleteAnimeComment(animeId, comment.id);
    onReload();
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Avatar profile={comment.avatar ? { avatar: comment.avatar } : null}
          username={comment.display_name || comment.username} size={30}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: C.accent }}>
              {comment.display_name || comment.username}
            </span>
            <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(comment.created_at)}</span>
          </div>
          <p style={{ margin: '0 0 5px', fontSize: 13, color: C.white, lineHeight: 1.5 }}>
            {comment.text}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleLike}
              style={{ background: 'none', border: 'none',
                cursor: user ? 'pointer' : 'default',
                color: liked ? C.pink : C.muted, fontSize: 12, padding: 0,
                display: 'flex', alignItems: 'center', gap: 3 }}>
              {liked ? '♥' : '♡'} {likes}
            </button>
            {user && (
              <button onClick={() => setShowReply(s => !s)}
                style={{ background: 'none', border: 'none',
                  cursor: 'pointer', color: C.muted, fontSize: 12, padding: 0 }}>
                💬 Ответить
              </button>
            )}
            {user && comment.username === user.username && (
              <button onClick={handleDelete}
                style={{ background: 'none', border: 'none',
                  cursor: 'pointer', color: '#f87171', fontSize: 12, padding: 0 }}>
                🗑
              </button>
            )}
          </div>
          {showReply && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitReply(); }}
                placeholder="Ответ..."
                style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`,
                  borderRadius: 6, color: C.white, padding: '6px 10px',
                  fontSize: 12, outline: 'none', fontFamily: FONT_BODY }}/>
              <button onClick={submitReply}
                style={{ background: C.accentDeep, border: 'none',
                  borderRadius: 6, padding: '6px 12px',
                  color: C.white, fontSize: 12, cursor: 'pointer' }}>→</button>
            </div>
          )}
          {comment.replies?.length > 0 && (
            <div style={{ marginTop: 10, paddingLeft: 14,
              borderLeft: `2px solid ${C.faint}` }}>
              {comment.replies.map(r => (
                <div key={r.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Avatar profile={null}
                    username={r.display_name || r.username} size={22}/>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700,
                      color: C.accent, marginRight: 6 }}>
                      {r.display_name || r.username}
                    </span>
                    <span style={{ fontSize: 12, color: C.white }}>{r.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentsPanel({ animeId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const load = () => {
    commentAPI.getAnimeComments(animeId)
      .then(res => setComments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [animeId]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) { nav('/login'); return; }
    await commentAPI.addAnimeComment(animeId, { text });
    setText(''); load();
  };

  return (
    <div>
      <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.accent,
        margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 Комментарии
        <span style={{ fontFamily: FONT_MONO, fontSize: 12,
          color: C.muted, fontWeight: 400 }}>{comments.length}</span>
      </h3>
      <form onSubmit={submit} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          {user && <Avatar profile={user.profile} username={user.username} size={30}/>}
          <div style={{ flex: 1 }}>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder={user ? 'Написать комментарий...'
                : 'Войдите чтобы комментировать'}
              disabled={!user} rows={2}
              style={{ width: '100%', background: user ? C.bg2 : C.faint,
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: user ? C.white : C.muted, padding: '8px 12px',
                fontSize: 13, fontFamily: FONT_BODY, outline: 'none',
                resize: 'none', boxSizing: 'border-box',
                cursor: user ? 'text' : 'not-allowed' }}/>
            {user && text.trim() && (
              <div style={{ display: 'flex', justifyContent: 'flex-end',
                gap: 8, marginTop: 6 }}>
                <button type="button" onClick={() => setText('')}
                  style={{ background: 'none', border: `1px solid ${C.border}`,
                    borderRadius: 6, padding: '5px 12px', color: C.muted,
                    fontSize: 12, cursor: 'pointer' }}>Отмена</button>
                <button type="submit"
                  style={{ background: C.accentDeep, border: 'none',
                    borderRadius: 6, padding: '5px 16px', color: C.white,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Отправить
                </button>
              </div>
            )}
            {!user && (
              <button type="button" onClick={() => nav('/login')}
                style={{ marginTop: 6, background: 'none',
                  border: `1px solid ${C.border}`, borderRadius: 6,
                  padding: '5px 14px', color: C.accent,
                  fontSize: 12, cursor: 'pointer' }}>
                Войти для комментариев →
              </button>
            )}
          </div>
        </div>
      </form>
      {loading ? (
        <div style={{ color: C.muted, fontSize: 13,
          textAlign: 'center', padding: '16px 0' }}>Загрузка...</div>
      ) : comments.length === 0 ? (
        <div style={{ color: C.muted, fontSize: 13, textAlign: 'center',
          padding: '16px 0', border: `1px dashed ${C.border}`,
          borderRadius: 8 }}>
          Комментариев пока нет. Будь первым! 👇
        </div>
      ) : (
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          {comments.map(c => (
            <CommentItem key={c.id} comment={c} animeId={animeId}
              user={user} onReload={load}/>
          ))}
        </div>
      )}
    </div>
  );
}

function AnimeCard({ anime, onSelect, inFav, onFav }) {
  const [hov, setHov] = useState(false);
  const statusColor = anime.status === 'ongoing' ? C.teal
    : anime.status === 'finished' ? C.muted : C.gold;
  const statusLabel = anime.status === 'ongoing' ? 'Выходит'
    : anime.status === 'finished' ? 'Завершён' : 'Анонс';

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? C.surface : C.bg2,
        border: `1px solid ${hov ? C.borderGlow : C.border}`,
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.25s', transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 12px 32px ${C.accentGlow}` : 'none',
        display: 'flex', flexDirection: 'column' }}>

      <div style={{ position: 'relative', paddingTop: '140%', background: C.bg3 }}
        onClick={() => onSelect(anime)}>
        {anime.poster ? (
          <img src={mediaUrl(anime.poster)} alt={anime.title}
            style={{ position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover' }}/>
        ) : (
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg,#7c3aed33,#06060f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 32,
              color: C.accent, opacity: 0.45 }}>
              {anime.title.slice(0, 2)}
            </span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, right: 8,
          background: '#00000099', border: `1px solid ${C.gold}44`,
          borderRadius: 6, padding: '3px 8px',
          fontFamily: FONT_MONO, fontSize: 12, color: C.gold }}>
          ★ {anime.score}
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
          <Badge color={statusColor}>{statusLabel}</Badge>
        </div>
        {hov && (
          <div style={{ position: 'absolute', inset: 0,
            background: 'rgba(124,58,237,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: C.accentDeep, borderRadius: '50%',
              width: 48, height: 48, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>▶</div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px', flex: 1 }} onClick={() => onSelect(anime)}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700,
          color: C.white, marginBottom: 6, lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {anime.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 6 }}>
          <Badge color={C.accent}>{anime.genre_name}</Badge>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11,
            color: C.muted }}>{anime.episodes} эп.</span>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: C.muted }}>
          <span>💬 {anime.comments_count || 0}</span>
          <span>❤️ {anime.favorites_count || 0}</span>
          <span style={{ marginLeft: 'auto' }}>{anime.year}</span>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`,
        padding: '8px 14px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={(e) => { e.stopPropagation(); onFav(anime); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: inFav ? C.pink : C.faint, fontSize: 18, padding: 0 }}>
          {inFav ? '♥' : '♡'}
        </button>
      </div>
    </div>
  );
}

function Modal({ anime, onClose, inFav, onFav, user }) {
  const [tab, setTab] = useState('player');
  const [showAllEps, setShowAllEps] = useState(false);
  const visibleEps = showAllEps ? anime.episodes : Math.min(anime.episodes, 26);
  const [ep, setEp] = useState(1);
  const statusLabel = anime.status === 'ongoing' ? 'Выходит'
    : anime.status === 'finished' ? 'Завершён' : 'Анонс';
  const statusColor = anime.status === 'ongoing' ? C.teal
    : anime.status === 'finished' ? C.muted : C.gold;

  const videoId = ANIME_VIDEOS[anime.title];
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(6,6,15,0.95)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: C.surface, border: `1px solid ${C.borderGlow}`,
        borderRadius: 16, maxWidth: 860, width: '100%',
        maxHeight: '94vh', overflowY: 'auto',
        boxShadow: `0 0 80px ${C.accentGlow}`,
        scrollbarWidth: 'thin', scrollbarColor: `${C.border} transparent` }}
        onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#7c3aed44,#06060f)',
          padding: '22px 24px 18px',
          display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          {anime.poster ? (
            <img src={mediaUrl(anime.poster)} alt={anime.title}
              style={{ width: 76, height: 107, borderRadius: 8, objectFit: 'cover',
                flexShrink: 0, border: `1px solid ${C.borderGlow}` }}/>
          ) : (
            <div style={{ width: 76, height: 107, borderRadius: 8, flexShrink: 0,
              background: '#7c3aed33', border: '1px solid #7c3aed55',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18,
                color: C.accent }}>{anime.title.slice(0, 3)}</span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11,
              color: C.muted, marginBottom: 4 }}>
              {anime.year} · {anime.episodes} эп.
            </div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20,
              color: C.white, margin: '0 0 8px', lineHeight: 1.2 }}>
              {anime.title}
            </h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <Badge color={C.accent}>{anime.genre_name}</Badge>
              <Badge color={statusColor}>{statusLabel}</Badge>
              <span style={{ color: C.gold, fontSize: 13, alignSelf: 'center' }}>
                ★ {anime.score}
              </span>
            </div>
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.muted,
              margin: 0, lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {anime.description}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: C.muted,
              fontSize: 22, cursor: 'pointer', padding: 0,
              lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`,
          padding: '0 24px' }}>
          {[['player','▶ Плеер'],['comments','💬 Комментарии']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                padding: '11px 16px 10px', fontFamily: FONT_MONO,
                fontSize: 12, letterSpacing: '0.08em',
                color: tab === k ? C.accent : C.muted,
                borderBottom: tab === k
                  ? `2px solid ${C.accent}` : '2px solid transparent',
                marginBottom: -1 }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── PLAYER TAB ── */}
        {tab === 'player' && (
          <div style={{ padding: '18px 24px 22px' }}>

            {/* Episode selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10,
                color: C.muted, letterSpacing: '0.12em', marginBottom: 10 }}>
                ЭПИЗОД
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Array.from({ length: visibleEps }, (_, i) => i + 1).map(n => (
                  (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setEp(n)}
                    style={{ width: 34, height: 34, borderRadius: 6,
                      border: `1px solid ${ep === n ? C.accent : C.border}`,
                      background: ep === n ? C.accentGlow : 'none',
                      color: ep === n ? C.accent : C.muted,
                      fontFamily: FONT_MONO, fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.15s' }}>
                    {n}
                  </button>
                ))}
                {!showAllEps && anime.episodes > 26 && (
                  <button onClick={() => setShowAllEps(true)}
                    style={{ height: 34, borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      background: 'none', color: C.accent,
                      fontFamily: FONT_MONO, fontSize: 11,
                      cursor: 'pointer', padding: '0 12px',
                      transition: 'all 0.15s' }}>
                    +{anime.episodes - 26} ещё ▼
                  </button>
                )}
                {showAllEps && anime.episodes > 26 && (
                  <button onClick={() => setShowAllEps(false)}
                    style={{ height: 34, borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      background: 'none', color: C.muted,
                      fontFamily: FONT_MONO, fontSize: 11,
                      cursor: 'pointer', padding: '0 12px' }}>
                    Свернуть ▲
                  </button>
                )}
              </div>

            {/* ── YouTube iframe ── */}
            <div style={{ borderRadius: 10, overflow: 'hidden',
              background: '#000', position: 'relative', paddingTop: '56.25%' }}>
              {embedUrl ? (
                <iframe
                  key={ep} // перезагружаем при смене эпизода
                  src={embedUrl}
                  title={`${anime.title} — эп. ${ep}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ position: 'absolute', inset: 0,
                    width: '100%', height: '100%', border: 'none' }}/>
              ) : (
                /* Аниме без прописанного видео — кнопки поиска */
                <div style={{ position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg,#7c3aed22,#06060f)', gap: 14 }}>
                  <div style={{ fontSize: 40 }}>🎌</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15,
                    color: C.white, textAlign: 'center' }}>
                    Трейлер для «{anime.title}»<br/>
                    <span style={{ fontSize: 12, color: C.muted,
                      fontFamily: FONT_BODY }}>
                      Найди на одном из сайтов:
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap',
                    justifyContent: 'center' }}>
                    {[
                      ['YouTube', `https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title + ' аниме трейлер')}`],
                      ['AnimeGO',  `https://animego.org/anime?q=${encodeURIComponent(anime.title)}`],
                      ['AniLibria',`https://www.anilibria.tv/search/?q=${encodeURIComponent(anime.title)}`],
                    ].map(([label, url]) => (
                      <a key={label} href={url} target="_blank" rel="noreferrer"
                        style={{ background: C.surface,
                          border: `1px solid ${C.border}`,
                          color: C.white, borderRadius: 8,
                          padding: '8px 16px', fontSize: 13,
                          textDecoration: 'none', fontFamily: FONT_BODY }}>
                        {label} →
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom row */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <div style={{ flex: 1, background: C.bg2, borderRadius: 8,
                padding: '10px 14px', display: 'flex',
                alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.muted }}>
                  ЭП. {ep} / {anime.episodes}
                </span>
                {ep > 1 && (
                  <button onClick={() => setEp(e => e - 1)}
                    style={{ background: 'none', border: `1px solid ${C.border}`,
                      borderRadius: 6, padding: '3px 10px', color: C.muted,
                      fontSize: 11, cursor: 'pointer', fontFamily: FONT_MONO }}>
                    ← Пред.
                  </button>
                )}
                {ep < anime.episodes && (
                  <button onClick={() => setEp(e => e + 1)}
                    style={{ background: 'none', border: `1px solid ${C.border}`,
                      borderRadius: 6, padding: '3px 10px', color: C.muted,
                      fontSize: 11, cursor: 'pointer', fontFamily: FONT_MONO,
                      marginLeft: 'auto' }}>
                    След. →
                  </button>
                )}
              </div>
              <button onClick={() => onFav(anime)}
                style={{ background: inFav ? '#f472b622' : C.bg2,
                  border: `1px solid ${inFav ? C.pink : C.border}`,
                  color: inFav ? C.pink : C.muted, borderRadius: 8,
                  padding: '10px 20px', fontFamily: FONT_BODY,
                  fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  whiteSpace: 'nowrap' }}>
                {inFav ? '♥ В избранном' : '♡ В избранное'}
              </button>
            </div>
          </div>
        )}

        {/* ── COMMENTS TAB ── */}
        {tab === 'comments' && (
          <div style={{ padding: '20px 24px 28px' }}>
            <CommentsPanel animeId={anime.id} user={user}/>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home({ user, onLogout }) {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('Все');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('score');
  const [selected, setSelected] = useState(null);
  const [favIds, setFavIds] = useState(new Set());
  const [favMap, setFavMap] = useState({});
  const nav = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (genre !== 'Все') params.genre = genre;
    if (query) params.search = query;
    animeAPI.getAll(params)
      .then(res => setAnimeList(res.data))
      .catch(() => setAnimeList([]))
      .finally(() => setLoading(false));
  }, [genre, query]);

  useEffect(() => {
    if (!user) { setFavIds(new Set()); setFavMap({}); return; }
    favoriteAPI.getAll().then(res => {
      const ids = new Set(res.data.map(f => f.anime));
      const map = {};
      res.data.forEach(f => { map[f.anime] = f.id; });
      setFavIds(ids); setFavMap(map);
    }).catch(() => {});
  }, [user]);

  const toggleFav = async (anime) => {
    if (!user) { nav('/login'); return; }
    if (favIds.has(anime.id)) {
      await favoriteAPI.remove(favMap[anime.id]);
      setFavIds(prev => { const n = new Set(prev); n.delete(anime.id); return n; });
      setFavMap(prev => { const n = { ...prev }; delete n[anime.id]; return n; });
    } else {
      const res = await favoriteAPI.add(anime.id);
      setFavIds(prev => new Set([...prev, anime.id]));
      setFavMap(prev => ({ ...prev, [anime.id]: res.data.id }));
    }
  };

  const sorted = [...animeList].sort((a, b) => {
    if (sort === 'score') return b.score - a.score;
    if (sort === 'year') return b.year - a.year;
    if (sort === 'comments') return (b.comments_count||0) - (a.comments_count||0);
    return a.title.localeCompare(b.title, 'ru');
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg,
      fontFamily: FONT_BODY, color: C.white }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30,
        background: C.bg + 'f2', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 24px', height: 58,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🌙</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20,
            fontWeight: 700, color: C.accent }}>AniMoon</span>
        </div>
        <nav style={{ display: 'flex', gap: 2 }}>
          <button onClick={() => nav('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 12px', borderRadius: 6,
              fontFamily: FONT_BODY, fontSize: 13, color: C.accent }}>
            Каталог
          </button>
          <button onClick={() => nav('/videos')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 12px', borderRadius: 6,
              fontFamily: FONT_BODY, fontSize: 13, color: C.muted }}>
            Видео
          </button>
        </nav>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <>
              <button onClick={() => nav('/upload')}
                style={{ background: C.accentDeep, border: 'none',
                  borderRadius: 8, padding: '6px 14px', color: C.white,
                  fontSize: 13, cursor: 'pointer', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 5 }}>
                📤 Загрузить
              </button>
              <button onClick={() => nav('/profile')}
                style={{ background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '5px 12px', color: C.white,
                  cursor: 'pointer', fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar profile={user.profile} username={user.username} size={22}/>
                <span style={{ maxWidth: 100, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.profile?.display_name || user.username}
                </span>
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
                  borderRadius: 8, padding: '6px 16px', color: C.white,
                  cursor: 'pointer', fontSize: 13 }}>Войти</button>
              <button onClick={() => nav('/register')}
                style={{ background: C.accentDeep, border: 'none',
                  borderRadius: 8, padding: '7px 16px', color: C.white,
                  cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                Регистрация
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{ padding: '44px 28px 32px', position: 'relative',
        background: 'radial-gradient(ellipse at 70% 50%,#7c3aed22 0%,transparent 60%)' }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.accent,
            letterSpacing: '0.2em', marginBottom: 10 }}>✦ АНИМЕ СТРИМИНГ ✦</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 42,
            lineHeight: 1.1, margin: '0 0 14px', color: C.white }}>
            Смотри аниме{' '}
            <span style={{ color: C.accent }}>бесплатно</span>
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7,
            margin: '0 0 22px', maxWidth: 400 }}>
            Сотни тайтлов, встроенный плеер YouTube, комментарии и список избранного.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => document.getElementById('catalog')
              ?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: C.accent, border: 'none', borderRadius: 8,
                padding: '11px 24px', color: '#0d0024',
                fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              ▶ Смотреть
            </button>
            {user ? (
              <button onClick={() => nav('/upload')}
                style={{ background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '11px 24px',
                  color: C.white, fontSize: 14, cursor: 'pointer' }}>
                📤 Загрузить видео
              </button>
            ) : (
              <button onClick={() => nav('/register')}
                style={{ background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '11px 24px',
                  color: C.white, fontSize: 14, cursor: 'pointer' }}>
                Регистрация →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div id="catalog" style={{ padding: '0 24px 18px',
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Поиск аниме..."
            style={{ width: '100%', background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 8,
              color: C.white, padding: '9px 14px 9px 36px',
              fontSize: 13, fontFamily: FONT_BODY, outline: 'none',
              boxSizing: 'border-box' }}/>
          <span style={{ position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: C.muted,
            fontSize: 14, pointerEvents: 'none' }}>🔍</span>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
          {GENRES.map(g => (
            <button key={g} onClick={() => setGenre(g)}
              style={{ background: genre === g ? C.accentDeep : 'none',
                border: `1px solid ${genre === g ? C.accent : C.border}`,
                color: genre === g ? C.white : C.muted,
                borderRadius: 99, padding: '5px 13px',
                fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
              {g}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ background: C.surface, border: `1px solid ${C.border}`,
            color: C.muted, borderRadius: 8, padding: '8px 12px',
            fontSize: 12, fontFamily: FONT_MONO, cursor: 'pointer',
            outline: 'none', flexShrink: 0 }}>
          <option value="score">По рейтингу</option>
          <option value="year">По году</option>
          <option value="comments">По комментариям</option>
          <option value="title">По названию</option>
        </select>
      </div>

      {/* ── GRID ── */}
      <main style={{ padding: '0 24px 60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🌙</div>
            <div style={{ fontSize: 14 }}>Загрузка...</div>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
            <div style={{ fontSize: 18, color: C.white, marginBottom: 8 }}>
              Ничего не найдено
            </div>
            <div style={{ fontSize: 13 }}>Попробуй изменить запрос или жанр</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.muted,
              letterSpacing: '0.12em', marginBottom: 16 }}>
              НАЙДЕНО {sorted.length} ТАЙТЛОВ
            </div>
            <div style={{ display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))',
              gap: 14 }}>
              {sorted.map(a => (
                <AnimeCard key={a.id} anime={a}
                  onSelect={setSelected}
                  inFav={favIds.has(a.id)}
                  onFav={toggleFav}/>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── FOOTER — только логотип ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`,
        padding: '16px 28px', display: 'flex',
        justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16,
          color: C.accent }}>🌙 AniMoon</span>
      </footer>

      {selected && (
        <Modal anime={selected} onClose={() => setSelected(null)}
          inFav={favIds.has(selected.id)} onFav={toggleFav} user={user}/>
      )}
    </div>
  );
}