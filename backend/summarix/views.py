from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import NewsItem, Like, Comment, UserProfile
import json
import logging
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from newspaper import Article
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import nltk
from datetime import date, timedelta
nltk.download('punkt')

logger = logging.getLogger(__name__)

#register
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not email or not password:
        return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'detail': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({'detail': 'User registered successfully.'}, status=status.HTTP_201_CREATED)


#login 
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'email': user.email,
        })
    else:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


#get the details of each user (profile page)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
    })


#summarizing news
@csrf_exempt  # disable CSRF for testing; remove or secure in production!
def summarize_article(request):
    if request.method != 'POST':
        return HttpResponseBadRequest(json.dumps({'error': 'POST method required'}),
                                      content_type="application/json")

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    url = data.get('url')
    logger.info(f"Received URL: {url}")

    if not url:
        return JsonResponse({'error': 'URL is required'}, status=400)

    try:
        article = Article(url)
        logger.info("Downloading article...")
        article.download()
        article.parse()
        logger.info("Article downloaded and parsed")

        parser = PlaintextParser.from_string(article.text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, 10)
        summary_text = ' '.join([str(sentence) for sentence in summary])
        logger.info("Summary generated")

        return JsonResponse({
            'title': article.title,
            'summary': summary_text,
            'image': article.top_image
        })

    except Exception as e:
        logger.error(f"Error in summarizing article: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_news(request):
    url = request.data.get('url')
    title = request.data.get('title', '')

    if not url:
        return Response({'error': 'Missing URL'}, status=400)

    news, created = NewsItem.objects.get_or_create(url=url)

    if created or not news.title or not news.image or not news.summary:
        try:
            article = Article(url)
            article.download()
            article.parse()
            news.title = article.title or title
            news.image = article.top_image or None

            # Generate summary
            parser = PlaintextParser.from_string(article.text, Tokenizer("english"))
            summarizer = LsaSummarizer()
            summary_sentences = summarizer(parser.document, 10)
            summary_text = ' '.join(str(sentence) for sentence in summary_sentences)
            news.summary = summary_text

            news.save()
        except Exception as e:
            logger.warning(f"Failed to fetch article details or summary: {e}")
            if not news.title:
                news.title = title
                news.save()

    existing_like = Like.objects.filter(user=request.user, news=news).first()

    if existing_like:
        existing_like.delete()
        return Response({'message': 'Unliked'})
    else:
        Like.objects.create(user=request.user, news=news)
        return Response({'message': 'Liked'})


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_likes_comments(request):
    url = request.query_params.get('url')
    if not url:
        return Response({'error': 'Missing URL'}, status=400)

    news = NewsItem.objects.filter(url=url).first()
    if not news:
        return Response({"likes": 0, "comments": [], "has_liked": False})

    likes_count = Like.objects.filter(news=news).count()
    comments = Comment.objects.filter(news=news).values(
        'user__username', 'text', 'created_at'
    )

    has_liked = False
    if request.user and request.user.is_authenticated:
        has_liked = Like.objects.filter(news=news, user=request.user).exists()

    return Response({
        "likes": likes_count,
        "comments": list(comments),
        "has_liked": has_liked
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request):
    url = request.data.get('url')
    title = request.data.get('title', '')
    text = request.data.get('text')

    if not url or not text:
        return Response({'error': 'URL and text are required'}, status=400)

    news, _ = NewsItem.objects.get_or_create(url=url, defaults={'title': title})

    Comment.objects.create(news=news, user=request.user, text=text)

    return Response({"message": "Comment added successfully"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liked_news_list(request):
    likes = Like.objects.filter(user=request.user).select_related('news')
    liked_news = [
        {
            "url": like.news.url,
            "title": like.news.title,
            "image": like.news.image,
            "description": like.news.summary,
        }
        for like in likes
    ]
    return Response(liked_news)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    user = request.user
    total_favorites = Like.objects.filter(user=user).count()
    total_comments = Comment.objects.filter(user=user).count()

    return Response({
        "favorites": total_favorites,
        "comments": total_comments,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def daily_check_in(request):
    profile = request.user.userprofile
    today = date.today()

    if profile.last_check_in == today:
        return Response({'message': 'Already checked in today!', 'streak': profile.streak_count})

    yesterday = today - timedelta(days=1)
    if profile.last_check_in == yesterday:
        profile.streak_count += 1
    else:
        profile.streak_count = 1  # Reset

    profile.last_check_in = today

    # Update max streak
    if profile.streak_count > profile.max_streak:
        profile.max_streak = profile.streak_count

    profile.save()

    return Response({
        'message': 'Check-in successful!',
        'streak': profile.streak_count,
        'max_streak': profile.max_streak,
        'last_check_in': str(profile.last_check_in),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_streak(request):
    profile = request.user.userprofile

    return Response({
        'streak': profile.streak_count,
        'max_streak': profile.max_streak,
        'last_check_in': str(profile.last_check_in),
    })
