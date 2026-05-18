from rest_framework import viewsets, generics, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Anime, Genre, Favorite, Comment, Video, Like, UserProfile
from .serializers import (
    AnimeSerializer, GenreSerializer, UserSerializer,
    FavoriteSerializer, CommentSerializer, VideoSerializer,
    UserProfileSerializer, UserProfileUpdateSerializer,
)


class AnimeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnimeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Anime.objects.select_related('genre').all()
        genre = self.request.query_params.get('genre')
        search = self.request.query_params.get('search')
        if genre:
            queryset = queryset.filter(genre__name__icontains=genre)
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset


class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [AllowAny]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class VideoViewSet(viewsets.ModelViewSet):
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = Video.objects.select_related(
            'uploaded_by', 'uploaded_by__profile', 'anime'
        ).all()
        anime_id = self.request.query_params.get('anime')
        user_id = self.request.query_params.get('user')
        search = self.request.query_params.get('search')
        if anime_id:
            queryset = queryset.filter(anime_id=anime_id)
        if user_id:
            queryset = queryset.filter(uploaded_by_id=user_id)
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        video = self.get_object()
        like, created = Like.objects.get_or_create(
            user=request.user, video=video, comment=None
        )
        if not created:
            like.delete()
            return Response({'liked': False, 'likes': video.likes.count()})
        return Response({'liked': True, 'likes': video.likes.count()})


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        video_id = self.kwargs.get('video_pk')
        anime_id = self.kwargs.get('anime_pk')
        if video_id:
            return Comment.objects.filter(
                video_id=video_id, parent=None
            ).select_related('user', 'user__profile').prefetch_related('replies')
        if anime_id:
            return Comment.objects.filter(
                anime_id=anime_id, parent=None
            ).select_related('user', 'user__profile').prefetch_related('replies')
        return Comment.objects.none()

    def perform_create(self, serializer):
        video_id = self.kwargs.get('video_pk')
        anime_id = self.kwargs.get('anime_pk')
        serializer.save(
            user=self.request.user,
            video_id=video_id,
            anime_id=anime_id,
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, **kwargs):
        comment = self.get_object()
        like, created = Like.objects.get_or_create(
            user=request.user, comment=comment, video=None
        )
        if not created:
            like.delete()
            return Response({'liked': False, 'likes': comment.likes.count()})
        return Response({'liked': True, 'likes': comment.likes.count()})


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(
            user=self.request.user
        ).select_related('anime', 'anime__genre')


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class PublicProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = 'user__username'
    queryset = UserProfile.objects.select_related('user').all()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'profile': UserProfileSerializer(profile, context={'request': request}).data,
    })