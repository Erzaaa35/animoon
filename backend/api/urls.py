from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register('anime', views.AnimeViewSet, basename='anime')
router.register('genres', views.GenreViewSet, basename='genre')
router.register('favorites', views.FavoriteViewSet, basename='favorite')
router.register('videos', views.VideoViewSet, basename='video')

# Комментарии к видео
video_comments = views.CommentViewSet.as_view({
    'get': 'list', 'post': 'create'
})
video_comment_detail = views.CommentViewSet.as_view({
    'get': 'retrieve', 'delete': 'destroy'
})
video_comment_like = views.CommentViewSet.as_view({'post': 'like'})

# Комментарии к аниме
anime_comments = views.CommentViewSet.as_view({
    'get': 'list', 'post': 'create'
})
anime_comment_like = views.CommentViewSet.as_view({'post': 'like'})

urlpatterns = [
    path('', include(router.urls)),

    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.me, name='me'),

    # Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/<str:user__username>/', views.PublicProfileView.as_view(), name='public_profile'),

    # Video comments
    path('videos/<int:video_pk>/comments/', video_comments, name='video-comments'),
    path('videos/<int:video_pk>/comments/<int:pk>/', video_comment_detail),
    path('videos/<int:video_pk>/comments/<int:pk>/like/', video_comment_like),

    # Anime comments
    path('anime/<int:anime_pk>/comments/', anime_comments, name='anime-comments'),
    path('anime/<int:anime_pk>/comments/<int:pk>/like/', anime_comment_like),
]