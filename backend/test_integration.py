"""
Group 10 - Team Iron Lung
Ayush Kafley, Muzzammil Nawab, 
Jake Emmert, Alec Delaurentis

To run: 
    pip install pytest
    pytest integration.py -v
"""

import pytest
from unittest.mock import patch, MagicMock
from Steam.parser import parser, parse_game_details
from algorithm.recommender import get_recommendations, score_game

#test a full parse to game getting scored
@patch("algorithm.recommender.get_hltb_cache", return_value=None)
def test_parse_and_score(mock):
    #simmulate what response we get from steam
    steam_return=[{
        "appid": 570,
        "name": "Dota 2",
        "playtime_forever": 120,
    }]

    parsed_result = parser(steam_return)
    assert len(parsed_result) == 1 #make sure we get a parsed result 

    game = parsed_result[0]
    prefrences = {1: 5}
    genre_index = {1: 0}
    genre_dict = {570: [1]}
    score = score_game(game, prefrences, genre_index, genre_dict)
    assert score >= 0.0

#test getting the full reccomendation making use of a mock DB
@patch("algorithm.recommender.get_games_by_ids", return_value=[{"appid": 100, "title": "Game A", "playtime_mins": 0}])
@patch("algorithm.recommender.get_all_backlog_genres", return_value={100: [1], 200: [3]})
@patch("algorithm.recommender.get_backlog_games", return_value=[{"appid": 100, "playtime_mins": 60, "title": "Game A"},{"appid": 200, "playtime_mins": 0, "title": "Game B"},])
@patch("algorithm.recommender.get_all_genre", return_value={1: 0, 2: 1, 3: 2})
@patch("algorithm.recommender.get_played_genres", return_value=[1, 1, 1])
@patch("algorithm.recommender.get_hltb_cache", return_value=300)
@patch("algorithm.recommender.get_saved_preferences", return_value=[])
def test_full_recommendation_pipeline(mock_prefs, mock_hltb, mock_genres, mock_all_genres, mock_backlog, mock_backlog_genres, mock_games):
    result = get_recommendations(user_id=1)
    #make sure you got a LIST of 5 or less recs (in case of lib not full)
    assert isinstance(result, list)  
    assert len(result) <= 5
    #check that game 100 is scored highest -- set to match pref and has already gotten playtime
    if(len(result) > 0):
        assert result[0]["appid"] == 100


#test that once you parsse a game's genre it goes straight and properly into the scoring
@patch("algorithm.recommender.get_hltb_cache", return_value=None)
def test_genre_parse_to_score(mock):
    steam_return = {"genres": [{"id": "1", "description": "Action"}]}
    genres = parse_game_details(steam_return)

    assert len(genres) == 1
    assert genres[0]["genre_id"] == 1

    game = {"appid": 999, "playtime_mins": 0, "title": "Some Random Gmae"}
    prefs = {1:2}
    genre_index = {1: 0}
    genre_dict = {999: [1]}

    score = score_game(game, prefs, genre_index, genre_dict)
    assert score > 0.0 #cosine sim should give a number match more than 0