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

class LyricsVote(models.Model):
    class VoteType(models.IntegerChoices):
        UPVOTE = 1, 'Upvote'
        DOWNVOTE = -1, 'Downvote'
        NEUTRAL = 0, 'Neutral'

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    song = models.ForeignKey('Song', on_delete=models.CASCADE)
    vote = models.SmallIntegerField(choices=VoteType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'song') 
        indexes = [
            models.Index(fields=['song', 'vote']),
        ]

    def __str__(self):
        return f"{self.user.username} voted {self.get_vote_display()} for {self.song.title}"

class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.CharField(max_length=255, blank=True, null=True)
    audio_file = models.FileField(upload_to='songs/', blank=True, null=True)
    audio_url = models.URLField(blank=True, null=True) 
    lyrics = models.TextField()
    release_year = models.PositiveIntegerField(blank=True, null=True)
    duration = models.DurationField(help_text="Duration in seconds")
    lyrics_timestamps = models.JSONField(
        blank=True,
        null=True,
        help_text="JSON array of objects with 'timestamp' and 'text' for lyric synchronization"
    )
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} by {self.artist}"
    @property
    def upvotes(self):
        return self.lyricsvote_set.filter(vote=LyricsVote.VoteType.UPVOTE).count()
    
    @property
    def downvotes(self):
        return self.lyricsvote_set.filter(vote=LyricsVote.VoteType.DOWNVOTE).count()
    
    @property
    def vote_score(self):
        return self.upvotes - self.downvotes

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
    
class Comment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}'s comment on {self.song.title}"