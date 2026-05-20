# 🌙 AniMoon — аниме платформа

Учебный проект РГЗ. Видеоплатформа для просмотра аниме.

## Ссылки
- 🌐 Сайт: https://animoon-delta.vercel.app/
- 🔧 Admin: https://animoon-production.up.railway.app/admin/api/anime/

## Стек технологий
- **Frontend**: React 18, Axios
- **Backend**: Django 4.2, Django REST Framework, SimpleJWT
- **Database**: PostgreSQL (Railway)
- **Deploy**: Vercel (frontend) + Railway (backend)

## Запуск локально

### Бэкенд
cd backend
python3 -m venv venv && source venv/bin/activate
python manage.py migrate
python manage.py runserver

### Фронтенд
cd frontend
npm start

