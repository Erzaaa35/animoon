from django.contrib import admin
from .models import Anime, Genre, Favorite, Comment


@admin.register(Anime)
class AnimeAdmin(admin.ModelAdmin):
    list_display = ['title', 'genre', 'year', 'score', 'status']
    list_filter = ['genre', 'status', 'year']
    search_fields = ['title', 'description']


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'anime', 'added_at']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'anime', 'created_at']
    list_filter = ['anime']