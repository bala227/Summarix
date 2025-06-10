from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    streak_count = models.IntegerField(default=0)
    last_check_in = models.DateField(null=True, blank=True)
    max_streak = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} Profile"

class NewsItem(models.Model):
    url = models.URLField(unique=True)
    title = models.CharField(max_length=255)
    image = models.URLField(blank=True, null=True)  # Add this
    summary = models.TextField(blank=True, null=True)  # Optional
    created_at = models.DateTimeField(auto_now_add=True)

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    news = models.ForeignKey(NewsItem, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'news')  # Ensures one like per user per news


class Comment(models.Model):
    news = models.ForeignKey(NewsItem, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # must add this!
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
