from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Anime, Genre, Favorite, Comment, Video, Like, UserProfile


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    videos_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'display_name',
            'bio', 'avatar', 'banner_color',
            'favorite_genre', 'created_at',
            'videos_count', 'likes_count',
        ]

    def get_videos_count(self, obj):
        return obj.user.videos.count()

    def get_likes_count(self, obj):
        return obj.user.likes.count()


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['display_name', 'bio', 'avatar', 'banner_color', 'favorite_genre']


class AnimeSerializer(serializers.ModelSerializer):
    genre_name = serializers.CharField(source='genre.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    comments_count = serializers.SerializerMethodField()
    favorites_count = serializers.SerializerMethodField()

    class Meta:
        model = Anime
        fields = [
            'id', 'title', 'title_en', 'description',
            'genre', 'genre_name', 'year', 'episodes',
            'score', 'status', 'status_display', 'poster',
            'created_at', 'comments_count', 'favorites_count',
        ]

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_favorites_count(self, obj):
        return obj.favorited_by.count()


class VideoSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(
        source='uploaded_by.username', read_only=True
    )
    uploader_display = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    anime_title = serializers.CharField(source='anime.title', read_only=True)

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'video_file', 'thumbnail',
            'uploaded_by', 'uploader_name', 'uploader_display',
            'anime', 'anime_title', 'views',
            'likes_count', 'comments_count', 'is_liked', 'created_at',
        ]
        read_only_fields = ['uploaded_by', 'views']

    def get_uploader_display(self, obj):
        try:
            return obj.uploaded_by.profile.display_name or obj.uploaded_by.username
        except Exception:
            return obj.uploaded_by.username

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    display_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'username', 'display_name', 'avatar',
            'text', 'created_at', 'likes_count', 'is_liked',
            'parent', 'replies',
        ]
        read_only_fields = ['user']

    def get_display_name(self, obj):
        try:
            return obj.user.profile.display_name or obj.user.username
        except Exception:
            return obj.user.username

    def get_avatar(self, obj):
        try:
            if obj.user.profile.avatar:
                request = self.context.get('request')
                return request.build_absolute_uri(obj.user.profile.avatar.url)
        except Exception:
            pass
        return None

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.all()
            return CommentSerializer(replies, many=True, context=self.context).data
        return []


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user)
        return user


class FavoriteSerializer(serializers.ModelSerializer):
    anime_detail = AnimeSerializer(source='anime', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'anime', 'anime_detail', 'added_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)