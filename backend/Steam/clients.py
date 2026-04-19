import requests
from dotenv import load_dotenv
import os
import time
from howlongtobeatpy import HowLongToBeat

#load_dotenv()
#apikey = os.getenv("STEAM_API_KEY")
#steamid = os.getenv("STEAM_ID")


#make a call to the STEAM API, then if you get a response add games to a list of games, return games
    #raise the errors: 
        #try connect and return the error number for failed to connect
        #if games is empty, the steam profile is private
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
    except requests.exceptions.HTTPError as e:
        raise ValueError(f"Steam API error: {e}")
    data = response.json()

    games = data.get("response", {}) .get("games")

    if games is None:
        raise ValueError("Steam profile is private or Steam ID is invalid")
    if games and "playtime_forever" not in games[0]:
        raise ValueError("Steam game details are private - please set games to public")
    return games

#print(get_games(steamid, apikey))

#get the full game details from a game -- wait 1.5 seconds so you dont blow up the 200 requests 
#every 5 mins on steam api
def get_game_details(appid):
    time.sleep(1.5)
    url= f"https://store.steampowered.com/api/appdetails?appids={appid}"
    response = requests.get(url)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error: {e}")
        return None
    data = response.json()
    entry = data.get(str(appid))
    if not entry or not entry.get("success"):
        return None
    return entry.get("data")

    
#print(get_game_details(570))

def get_hltb_time(title):
    #print(f"fetching HTLY for {title}")
    result = HowLongToBeat().search(title)
    #print(f"Result: {result}")
    if result is not None and len(result)>0:
        best_element = max(result, key=lambda element: element.similarity)
        return(best_element.main_extra * 60)
    
    return None

