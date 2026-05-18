import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Genre, Anime

genres_data = ['Сёнэн', 'Сёдзё', 'Исэкай', 'Меха', 'Романтика', 'Экшен', 'Триллер', 'Фэнтези']
genres = {}
for g in genres_data:
    obj, _ = Genre.objects.get_or_create(name=g)
    genres[g] = obj

anime_data = [
    dict(title='Атака Титанов', genre=genres['Сёнэн'], year=2013, episodes=87, score=9.1,
         status='finished', description='Человечество за стенами. Гигантские монстры снаружи.'),
    dict(title='Клинок, рассекающий демонов', genre=genres['Сёнэн'], year=2019, episodes=44,
         score=8.9, status='ongoing', description='Танджиро идёт по пути охотника на демонов.'),
    dict(title='Стальной Алхимик', genre=genres['Сёнэн'], year=2009, episodes=64, score=9.2,
         status='finished', description='Братья Элрик ищут Философский камень.'),
    dict(title='Violet Evergarden', genre=genres['Сёдзё'], year=2018, episodes=13, score=8.7,
         status='finished', description='Бывший солдат учится понимать, что такое чувства.'),
    dict(title='Хоримия', genre=genres['Романтика'], year=2021, episodes=13, score=8.4,
         status='finished', description='Школьная история о двух людях, которые совсем не такие.'),
    dict(title='Тетрадь смерти', genre=genres['Триллер'], year=2006, episodes=37, score=8.6,
         status='finished', description='Найденная тетрадь даёт право убивать.'),
    dict(title='Оверлорд', genre=genres['Исэкай'], year=2015, episodes=52, score=7.9,
         status='ongoing', description='Игрок застрял в виртуальном мире в теле скелета-повелителя.'),
    dict(title='Евангелион', genre=genres['Меха'], year=1995, episodes=26, score=8.5,
         status='finished', description='Подростки управляют гигантскими роботами против ангелов.'),
]

for data in anime_data:
    obj, created = Anime.objects.get_or_create(title=data['title'], defaults=data)
    status = 'создано' if created else 'уже есть'
    print(f'  {obj.title} — {status}')

print(f'\nИтого жанров: {Genre.objects.count()}')
print(f'Итого аниме: {Anime.objects.count()}')
print('Готово!')
