import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Добавляем JWT токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Если токен истёк — обновляем
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${BASE_URL}/auth/token/refresh/`, { refresh }
          );
          localStorage.setItem('access_token', data.access);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const animeAPI = {
  getAll: (params) => api.get('/anime/', { params }),
  getOne: (id) => api.get(`/anime/${id}/`),
};

export const genreAPI = {
  getAll: () => api.get('/genres/'),
};

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/token/', data),
  me: () => api.get('/auth/me/'),
};

export const favoriteAPI = {
  getAll: () => api.get('/favorites/'),
  add: (animeId) => api.post('/favorites/', { anime: animeId }),
  remove: (id) => api.delete(`/favorites/${id}/`),
};

export const videoAPI = {
  getAll: (params) => api.get('/videos/', { params }),
  getOne: (id) => api.get(`/videos/${id}/`),
  upload: (formData) => api.post('/videos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/videos/${id}/`),
  like: (id) => api.post(`/videos/${id}/like/`),
};

export const commentAPI = {
  getAnimeComments: (animeId) =>
    api.get(`/anime/${animeId}/comments/`),
  addAnimeComment: (animeId, data) =>
    api.post(`/anime/${animeId}/comments/`, data),
  likeAnimeComment: (animeId, commentId) =>
    api.post(`/anime/${animeId}/comments/${commentId}/like/`),
  deleteAnimeComment: (animeId, commentId) =>
    api.delete(`/anime/${animeId}/comments/${commentId}/`),
  getVideoComments: (videoId) =>
    api.get(`/videos/${videoId}/comments/`),
  addVideoComment: (videoId, data) =>
    api.post(`/videos/${videoId}/comments/`, data),
  likeComment: (videoId, commentId) =>
    api.post(`/videos/${videoId}/comments/${commentId}/like/`),
  deleteComment: (videoId, commentId) =>
    api.delete(`/videos/${videoId}/comments/${commentId}/`),
};

export const profileAPI = {
  getMe: () => api.get('/profile/'),
  update: (formData) => api.patch('/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPublic: (username) => api.get(`/profile/${username}/`),
};

export default api;