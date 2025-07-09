from django.urls import path
from .views import register, login, search_history,search_lyrics,user_profile,update_profile,song_detail,log_interaction

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('profile/', user_profile, name='user-profile'),
    path('profile/update/', update_profile, name='update-profile'),
    path('search-history/', search_history, name='search-history'),
    path('search/', search_lyrics, name='search-lyrics'),
    path('songs/<int:song_id>/', song_detail, name='song-detail'),
    path('interactions/', log_interaction, name='log-interaction'),
]