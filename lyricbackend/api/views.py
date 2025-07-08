from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_201_CREATED
from rest_framework.authtoken.models import Token
from .models import CustomUser, SearchHistory
from .serializers import UserSerializer, SearchHistorySerializer
import json
from django.http import JsonResponse
import requests  

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
def search_lyrics(request):
    query = request.GET.get('q', '')
    SearchHistory.objects.create(user=request.user, query=query)
    #EXTERNAL API REQUIRED
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