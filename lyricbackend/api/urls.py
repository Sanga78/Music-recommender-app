from django.urls import path
from .views import register, login, search_history,search_lyrics

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('search-history/', search_history, name='search-history'),
    path('search/', search_lyrics, name='search-lyrics'),
]