from rest_framework import serializers
from .models import CustomUser, LyricsVote, SearchHistory,Song, UserSongInteraction,Comment

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
    audio_file = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    upvotes = serializers.IntegerField(read_only=True)
    downvotes = serializers.IntegerField(read_only=True)
    vote_score = serializers.IntegerField(read_only=True)
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = '__all__'
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = LyricsVote.objects.filter(
                user=request.user,
                song=obj
            ).first()
            return vote.vote if vote else 0
        return 0
    def get_audio_file(self, obj):
        if obj.audio_file:
            return self.context['request'].build_absolute_uri(obj.audio_file.url)
        return None
    def get_audio_url(self, obj):
        if obj.audio_file:
            return self.context['request'].build_absolute_uri(obj.audio_file.url)
        return obj.audio_url

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
    
class LyricsVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LyricsVote
        fields = ['id', 'user', 'song', 'vote', 'created_at']
        read_only_fields = ['user', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']
        read_only_fields = ['user', 'created_at']