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