import requests
from dotenv import load_dotenv
import os

load_dotenv()
apikey = os.getenv("STEAM_API_KEY")
steamid = os.getenv("STEAM_ID")


def get_games(steamid, apikey):
    url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
    params = {
        "key": apikey,
        "steamid": steamid,
        "include_appinfo": True,
        "include_played_free_games": True
    }
    response = requests.get(url, params=params)
    try:
        response.raise_for_status()
    except response.exception.HTTPError as e:
        print(f"HTTP error: {e}")
        return []
    data = response.json()

    games = data.get("response", {}) .get("games")

    if games is None:
        print ("No games found, profile possibly private")
        return []
    return games

print(get_games(steamid, apikey))