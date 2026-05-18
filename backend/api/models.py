from django.db import models
from django.contrib.auth.models import User


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Жанр'
        verbose_name_plural = 'Жанры'


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, max_length=500)
    display_name = models.CharField(max_length=100, blank=True)
    banner_color = models.CharField(max_length=7, default='#7c3aed')
    favorite_genre = models.ForeignKey(
        Genre, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Профиль {self.user.username}'

    class Meta:
        verbose_name = 'Профиль'


class Anime(models.Model):
    STATUS_CHOICES = [
        ('ongoing', 'Выходит'),
        ('finished', 'Завершён'),
        ('announced', 'Анонсирован'),
    ]

    title = models.CharField(max_length=200)
    title_en = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True)
    year = models.IntegerField()
    episodes = models.IntegerField(default=0)
    score = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ongoing')
    poster = models.ImageField(upload_to='posters/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-score']


class Video(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to='videos/')
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='videos'
    )
    anime = models.ForeignKey(
        Anime, on_delete=models.SET_NULL, null=True, blank=True, related_name='videos'
    )
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name='likes', null=True, blank=True
    )
    comment = models.ForeignKey(
        'Comment', on_delete=models.CASCADE,
        related_name='likes', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'video'), ('user', 'comment')]

    def __str__(self):
        return f'{self.user.username} лайкнул'


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    video = models.ForeignKey(
        Video, on_delete=models.CASCADE,
        related_name='comments', null=True, blank=True
    )
    anime = models.ForeignKey(
        Anime, on_delete=models.CASCADE,
        related_name='comments', null=True, blank=True
    )
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        null=True, blank=True, related_name='replies'
    )
    text = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username}: {self.text[:40]}'


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'anime')