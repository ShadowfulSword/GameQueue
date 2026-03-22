from Steam.clients import get_games, get_game_details
from Steam.parser import parser, parse_game_details
from DB.queries import insert_user, insert_game, insert_user_library, insert_genre, insert_game_genre, game_exists
from dotenv import load_dotenv
import os

load_dotenv()
apikey = os.getenv("STEAM_API_KEY")
steamid = os.getenv("STEAM_ID")

def import_user_library(steamid,apikey):
    games = get_games(steamid, apikey)
    parsed_games = parser(games)
    user_id = insert_user(steamid)

    for game in parsed_games:
        insert_game(game)
        if not game_exists(game.get("appid")):
            game_deets = get_game_details(game.get("appid"))
            parsed_deets = parse_game_details(game_deets)
            for genre in parsed_deets:
                insert_genre(genre.get("genre_id"), genre.get("genre_name"))
                insert_game_genre(game.get("appid"), genre.get("genre_id"))
        insert_user_library(user_id, game.get("appid"), game.get("playtime_mins"))

if __name__ == "__main__":
    import_user_library(steamid, apikey)