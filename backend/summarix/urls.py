from django.urls import path
from .views import register, login_view,current_user,summarize_article,like_news, add_comment, get_likes_comments,liked_news_list,user_stats,daily_check_in,get_streak

urlpatterns = [
    path('register/', register),
    path('login/', login_view),
    path('me/',current_user),
    path('news-summarize/',summarize_article),
    path('like/', like_news),
    path('comment/', add_comment),
    path('news-meta/', get_likes_comments),
    path('favorites/', liked_news_list, name='liked_news_list'),
    path('user-stats/', user_stats, name='user_stats'),
    path('daily-check-in/', daily_check_in, name='daily_check_in'),
    path('streak/', get_streak, name='get_streak'),
]
