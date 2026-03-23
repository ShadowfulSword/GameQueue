from collections import Counter
from DB.queries import get_played_genres, get_backlog_games, get_game_genres, get_all_genre
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

#return how often and whcih genre appears in the user's backlog
def get_user_preferences(user_id):
    played_genres = get_played_genres(user_id)
    return Counter(played_genres)


def score_game(game, user_prefrences, genre_index):
    user_vector = np.zeros(len(genre_index))
    for genre_id, count in user_prefrences.items():
        if genre_id in genre_index:
            user_vector[genre_index[genre_id]] = count
    
    game_vector = np.zeros(len(genre_index))
    game_genres = get_game_genres(game["appid"])
    for genre_id in game_genres:
        if genre_id in genre_index:
            game_vector[genre_index[genre_id]] = 1
    
    sim = cosine_similarity([user_vector], [game_vector])[0][0]
    
    return sim + (0.2 if game["playtime_mins"] > 0 else 0)

def get_recommendations(user_id):
    prefrences = get_user_preferences(user_id)
    genre_index = get_all_genre()
    backlog = get_backlog_games(user_id)

    scored_game = []
    for game in backlog:
        score = score_game(game, prefrences, genre_index)
        scored_game.append((game["appid"], score))

    sorted_game = sorted(scored_game, key=lambda x:x[1], reverse=True)
    return [appid for appid, score in sorted_game[:5]]