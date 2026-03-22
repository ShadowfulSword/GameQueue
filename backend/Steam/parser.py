
#take in all of the pased games and make it a list of dictionaries with only name, app_id and playtime
def parser(passed_games):
    parsed_games = []

    for game in passed_games:
        parsed_game = {
            "appid": game.get("appid"),
            "name": game.get("name"),
            "playtime_mins": total_playtime(game)
        }
        parsed_games.append(parsed_game)
    return parsed_games


#total_playtime is the combination of all playtime forevber across all platofrms
def total_playtime(game):
    windows = game.get("playtime_windows_forever")
    mac = game.get("playtime_mac_forever")
    linux = game.get("playtime_linux_forever")
    deck = game.get("playtime_deck_forever")
    disc = game.get("playtime_disconnected")

    return (windows + mac + linux + deck + disc)

#if you GET a raw_details AND it has genres listed return the list of id and details
def parse_game_details(raw_details):
    if(raw_details is None):
        return[]
    if(raw_details.get("genres") is not None):
        parsed_details = []
        for genres in raw_details["genres"]:
            parsed_genre = {
                "genre_id": int(genres["id"]),
                "genre_name": genres["description"]
            }
            parsed_details.append(parsed_genre)
        return parsed_details
    else:
        return []