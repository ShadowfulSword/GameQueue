from pathlib import Path

from Steam.clients import get_games, get_game_details, get_hltb_time
from Steam.parser import parser, parse_game_details
from DB.queries import insert_user, insert_game, insert_user_library, insert_genre, insert_game_genre, game_exists, get_hltb_cache, update_hltb_cache
from algorithm.recommender import get_recommendations
from dotenv import load_dotenv
import os

_REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_REPO_ROOT / ".env")
load_dotenv()
apikey = os.getenv("STEAM_API_KEY")
steamid = os.getenv("STEAM_ID")

def import_user_library(steamid, apikey):
    try:
        games = get_games(steamid, apikey)
        parsed_games = parser(games)
        user_id = insert_user(steamid)

        for game in parsed_games:
            insert_game(game)
            if not game_exists(game.get("appid")):
                update_hltb_cache(game["appid"], get_hltb_time(game["name"]))
                game_deets = get_game_details(game.get("appid"))
                parsed_deets = parse_game_details(game_deets)
                for genre in parsed_deets:
                    insert_genre(genre.get("genre_id"), genre.get("genre_name"))
                    insert_game_genre(game.get("appid"), genre.get("genre_id"))
            insert_user_library(user_id, game.get("appid"), game.get("playtime_mins"))
        return {"user_id": user_id}
    except ValueError as e:
        print(f"Error: {e}")
        return {"error": str(e)}
    except Exception as e:
        print(f"Import library error: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    result = import_user_library(steamid, apikey)
    if result and "error" in result:
        print(result["error"])
    else:
        recommendations = get_recommendations(6)
        print(recommendations)