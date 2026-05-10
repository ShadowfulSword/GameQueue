from collections import Counter
from DB.queries import get_played_genres, get_backlog_games, get_game_genres, get_all_genre, get_hltb_cache, get_all_backlog_genres, get_games_by_ids, get_saved_preferences
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

"""
    
"""

#make it so we have a fallback for user prefrences based on their saved prefrence games if the user has no playing or completed games
def get_user_preferences(user_id):
    played = get_played_genres(user_id)
    if played:
        preferences = {}
        for genre_id in played:
            preferences[genre_id] = preferences.get(genre_id, 0) + 1
        return preferences
    # cold start fallback
    saved = get_saved_preferences(user_id)
    return {genre_id: 1 for genre_id in saved}

#simple cosine sim algo:
#The user's preference vector refers to a genre in the database and teh value is how many times the user has played a game
#with that genre
#The game vector represents the game's genres, value is 1 if the game belongs to the genre that is in the user's prefrence
#Cosine Sim finds the angle between 2 vectors and the closer to 1 it is the more simmilar the game is
def score_game(game, user_prefrences, genre_index, genre_dict):
    if not genre_index:
        return 0.0
    user_vector = np.zeros(len(genre_index))
    for genre_id, count in user_prefrences.items():
        if genre_id in genre_index:
            user_vector[genre_index[genre_id]] = count
    
    game_vector = np.zeros(len(genre_index))
    game_genres = genre_dict.get(game["appid"], [])
    for genre_id in game_genres:
        if genre_id in genre_index:
            game_vector[genre_index[genre_id]] = 1
    sim = cosine_similarity([user_vector], [game_vector])[0][0]
    hltb_time = get_hltb_cache(game["appid"])
    if hltb_time is None:
        if (game["playtime_mins"] > 0):
            sim+= 0.1
    elif(game["playtime_mins"] >= hltb_time):
        sim += 0.3
    elif (game["playtime_mins"] >= hltb_time * 0.8):
        sim += 0.2
    elif (game["playtime_mins"] > 0):
        sim += 0.1
    elif (game["playtime_mins"] == 0):
        pass
    return sim

#get the games from the user's backlog and the genres theyve played and make a list of the unplayed game's scores
#return the top 5 most simmilar games
def get_recommendations(user_id):
    prefrences = get_user_preferences(user_id)
    genre_index = get_all_genre()
    if not genre_index:
        return []
    backlog = get_backlog_games(user_id)
    backlog_genre = get_all_backlog_genres(user_id)

    scored_game = []
    for game in backlog:
        score = score_game(game, prefrences, genre_index, backlog_genre)
        scored_game.append((game["appid"], score))

    sorted_game = sorted(scored_game, key=lambda x:x[1], reverse=True)
    top_ids = [appid for appid, score in sorted_game[:5]]
    return get_games_by_ids(top_ids)