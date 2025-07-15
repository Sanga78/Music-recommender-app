from django.urls import path
from .views import register, login, search_history,search_lyrics, song_comments, song_list,user_profile,update_profile,song_detail,log_interaction, vote_lyrics,player_data

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('profile/', user_profile, name='user-profile'),
    path('profile/update/', update_profile, name='update-profile'),
    path('search-history/', search_history, name='search-history'),
    path('search/', search_lyrics, name='search-lyrics'),
    path('songs/', song_list, name='song-list'),
    path('songs/<int:pk>/', song_detail, name='song-detail'),
    path('songs/<int:pk>/player/', player_data, name='player-data'),
    path('songs/<int:song_id>/vote/', vote_lyrics, name='vote-lyrics'),
    path('interactions/', log_interaction, name='log-interaction'),
    path('songs/<int:song_id>/comments/', song_comments, name='song-comments'),
]