from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class CustomUser(AbstractUser):
    bio = models.TextField(blank=True)

class SearchHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    query = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.CharField(max_length=255, blank=True, null=True)
    release_year = models.PositiveIntegerField(blank=True, null=True)
    lyrics = models.TextField()
    duration = models.DurationField(help_text="Duration in seconds")
    spotify_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    genius_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.artist}"

class UserSongInteraction(models.Model):
    class InteractionType(models.TextChoices):
        SEARCH = 'SEARCH', 'Search'
        VIEW = 'VIEW', 'View'
        SAVE = 'SAVE', 'Save'

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=10, choices=InteractionType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'interaction_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} {self.get_interaction_type_display()} {self.song.title}"