from Steam.clients import get_games
from Steam.parser import parser
from DB.queries import insert_user, insert_game, insert_user_library
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
        insert_user_library(user_id, game.get("appid"), game.get("playtime_mins"))

if __name__ == "__main__":
    import_user_library(steamid, apikey)