from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated,IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_201_CREATED
from rest_framework.authtoken.models import Token
from .models import CustomUser, LyricsVote, SearchHistory,Song, UserSongInteraction
from .serializers import CommentSerializer, LyricsVoteSerializer, UserSerializer, SearchHistorySerializer,UserProfileSerializer, SongSerializer
import json
from django.http import JsonResponse
import requests  
from django.db.models import Count,Q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    return Response({'status': 'valid'}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = Token.objects.create(user=user)
            return Response({
                'user': serializer.data,
                'token': token.key
            }, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        }, status=HTTP_200_OK)
    return Response({'error': 'Invalid Credentials'}, status=HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_lyrics(request):
    query = request.GET.get('q', '')
    SearchHistory.objects.create(user=request.user, query=query)
    headers = {
        'Authorization': 'Bearer YOUR_GENIUS_API_KEY'
    }
    try:
        response = requests.get(
            f'https://api.genius.com/search?q={query}',
            headers=headers
        )
        results = response.json()['response']['hits']
        
        formatted_results = [{
            'title': hit['result']['title'],
            'artist': hit['result']['primary_artist']['name'],
            'url': hit['result']['url'],
            'image': hit['result']['song_art_image_url']
        } for hit in results]
        
        return JsonResponse({'results': formatted_results})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def song_list(request):
    songs = Song.objects.annotate(
        upvotes_count=Count('lyricsvote', filter=Q(lyricsvote__vote=1)),
        downvotes_count=Count('lyricsvote', filter=Q(lyricsvote__vote=-1))
    ).order_by('-upvotes_count')[:50] 
    
    serializer = SongSerializer(songs, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def song_detail(request, pk):
    try:
        song = Song.objects.get(pk=pk)
        serializer = SongSerializer(song, context={'request': request})
        return Response(serializer.data)
    except Song.DoesNotExist:
        return Response({"error": "Song not found"}, status=404)

@api_view(['GET'])
def player_data(request, pk):
    try:
        song = Song.objects.get(pk=pk)
        
        if request.user.is_authenticated:
            UserSongInteraction.objects.create(
                user=request.user,
                song=song,
                interaction_type='VIEW'
            )
        
        serializer = SongSerializer(song, context={'request': request})
        return Response(serializer.data)
    except Song.DoesNotExist:
        return Response({"error": "Song not found"}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def search_history(request):
    if request.method == 'GET':
        history = SearchHistory.objects.filter(user=request.user)
        serializer = SearchHistorySerializer(history, many=True)
        return Response(serializer.data) 
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = SearchHistorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_interaction(request):
    song_id = request.data.get('song_id')
    interaction_type = request.data.get('interaction_type')
    
    try:
        song = Song.objects.get(pk=song_id)
        interaction = UserSongInteraction.objects.create(
            user=request.user,
            song=song,
            interaction_type=interaction_type
        )
        return Response({"status": "success"})
    except Song.DoesNotExist:
        return Response({"error": "Song not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_lyrics(request, song_id):
    try:
        song = Song.objects.get(pk=song_id)
        vote_value = int(request.data.get('vote', 0))

        if vote_value not in [-1, 0, 1]:
            return Response({"error": "Invalid vote value"}, status=400)

        vote, created = LyricsVote.objects.get_or_create(
            user=request.user,
            song=song,
            defaults={'vote': vote_value}
        )
        
        if not created and vote.vote != vote_value:
            vote.vote = vote_value
            vote.save()
        
        serializer = LyricsVoteSerializer(vote)
        return Response(serializer.data)
    
    except Song.DoesNotExist:
        return Response({"error": "Song not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def song_comments(request, song_id):
    try:
        song = Song.objects.get(pk=song_id)
    except Song.DoesNotExist:
        return Response({"error": "Song not found"}, status=404)

    if request.method == 'GET':
        comments = song.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, song=song)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)