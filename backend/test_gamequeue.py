"""
Group 10 - Team Iron Lung
Ayush Kafley, Muzzammil Nawab, 
Jake Emmert, Alec Delaurentis

To run: 
    pip install pytest
    pytest test_gamequeue.py -v


"""


import pytest   #unit test framework
from unittest.mock import patch, MagicMock  #create mock DB calls without directly affecting the DB
from collections import Counter #check for right counter amts

#import all the functs being tested
from Steam.parser import parser, total_playtime, parse_game_details
from algorithm.recommender import get_user_preferences, get_recommendations 

from algorithm.recommender import score_game

# TEST FOR PARSER

def test_total_playtime_sums_all_platform():
    #check that total_playtime() adds up numbers across:
        #windows, mac, Linux, Steam Deck, disconnected
    #updated to reflect the new playtime
    game = {"playtime_forever": 190,}

    #100+50+25+10+5 = 190
    assert total_playtime(game) == 190


def test_parser_returns_correctly():
    #check that parser properly isolates appid, name, total playtime
    #pass as raw Steam API response
    #updated to reflect the new playtime
    raw = [{
        "appid": 570, 
        "name": "Dota 2",
        "playtime_forever": 60,
    }]

    result = parser(raw)
    assert result[0] == {"appid": 570, "name": "Dota 2", "playtime_mins": 60}


def test_parser_can_return_genres():
    raw = {"genres": [{"id": "1", "description": "Action"}, {"id": "2", "description": "RPG"}]}
    result = parse_game_details(raw)
    assert result == [{"genre_id": 1, "genre_name": "Action"}, {"genre_id": 2, "genre_name": "RPG"}]

def test_parse_game_deets_can_return_empty():
    #verify that parse_game_details can handle None by just outputting empty
    assert parse_game_details(None) == []

# TEST FOR RECCOMENDING

#mock the input for get genres without making a real call
#a user who has played games with genre id: 1,2,1,1
@patch("algorithm.recommender.get_played_genres", return_value=[1, 2, 1, 1])
def test_user_pref_counts_genres(mock_genres):
    #check that the reccomendation's get user pref counts the frequency of genres properly
    result = get_user_preferences(user_id=1)
    assert result[1] == 3
    assert result[2] == 1

#Make a call that maps game 100 which maps to a user's prefrence of genere 1 and game 200 with genre 3 which does not
#updated to include get_games_by_ids
@patch("algorithm.recommender.get_all_backlog_genres", return_value={100: [1], 200: [3]})
@patch("algorithm.recommender.get_backlog_games", return_value=[{"appid": 100, "playtime_mins": 0, "title": "Game A"},{"appid": 200, "playtime_mins": 0, "title": "Game B"},])
@patch("algorithm.recommender.get_all_genre", return_value={1: 0, 2: 1, 3: 2})
@patch("algorithm.recommender.get_played_genres", return_value=[1, 1, 1])
@patch("algorithm.recommender.get_hltb_cache", return_value=None)
@patch("algorithm.recommender.get_games_by_ids", return_value=[{"appid": 100, "title": "Game A", "playtime_mins": 0}])
@patch("algorithm.recommender.get_saved_preferences", return_value=[])
def test_reccomendation_returns_list(mock_saved, mock_games, mock_hltb, mock_genres, mock_all_genres, mock_backlog, mock_backlog_genres):
    result = get_recommendations(user_id=1)
    assert isinstance(result, list)
    assert len(result) <= 5

#what happens when you call a rec on an empty backlog
@patch("algorithm.recommender.get_all_backlog_genres", return_value={})
@patch("algorithm.recommender.get_backlog_games", return_value=[])
@patch("algorithm.recommender.get_all_genre", return_value={})
@patch("algorithm.recommender.get_played_genres", return_value=[])
@patch("algorithm.recommender.get_hltb_cache", return_value=None)
def test_reccomendations_empty_backlog(mock_hltb, mock_genres, mock_all_genres, mock_backlog, mock_backlog_genres):
    #verify that an empty backlog returns an empty list
    assert get_recommendations(user_id=1) == []

#new tests -- HLTB scoring 

#user has played game for longer than hltb time so score +0.3
@patch("algorithm.recommender.get_hltb_cache", return_value = 600)
def test_score_game_t1_bonus(mock_hltb):
    game = {"appid": 100, "playtime_mins": 700, "title": "Game A"}
    prefrence = {1: 3}
    gener_index = {1: 0}
    gener_dict = {100: [1]}
    score = score_game(game, prefrence, gener_index, gener_dict)
    assert score > 0.3

#game with no playtime and no hltb time should have 0 bonus score
@patch("algorithm.recommender.get_hltb_cache", return_value =None)
def test_game_with_no_bonus(mock_hltb):
    game = {"appid": 100, "playtime_mins": 0, "title": "Game A"}
    prefrence = {1: 3}
    gener_index = {1: 0}
    gener_dict = {100: [1]}
    score = score_game(game, prefrence, gener_index, gener_dict)
    assert score == pytest.approx(1.0, abs=0.01)

#game genre doesnt match the user's saved prefs -- cosine algo should return 0
@patch("algorithm.recommender.get_hltb_cache", return_value=None)
def test_game_outside_pref(mock_hltb):
    game = {"appid": 200, "playtime_mins": 0, "title": "Game B"}
    prefrence = {1: 3}
    gener_index = {1: 0, 3:1}
    gener_dict = {200: [3]}
    score = score_game(game, prefrence, gener_index, gener_dict)
    assert score == 0.0

#test case for if the csv has no playtime
#edge case
def test_missing_playtime():
    game = {}
    assert total_playtime(game) == 0

#test what happens when game detail has no genere mapping
def test_game_has_no_saved_genres():
    result = parse_game_details({"name": "Some Nonexistant Game123"})
    assert result == []