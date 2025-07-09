from rest_framework import serializers
from .models import CustomUser, SearchHistory,Song, UserSongInteraction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = '__all__'

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    saved_songs = serializers.SerializerMethodField()
    searched_songs = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'date_joined', 'saved_songs', 'searched_songs']

    def get_saved_songs(self, obj):
        return UserSongInteraction.objects.filter(
            user=obj,
            interaction_type='SAVE'
        ).count()

    def get_searched_songs(self, obj):
        return UserSongInteraction.objects.filter(
            user=obj,
            interaction_type='SEARCH'
        ).count()