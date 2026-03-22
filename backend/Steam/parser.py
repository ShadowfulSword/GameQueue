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


def total_playtime(game):
    windows = game.get("playtime_windows_forever")
    mac = game.get("playtime_mac_forever")
    linux = game.get("playtime_linux_forever")
    deck = game.get("playtime_deck_forever")
    disc = game.get("playtime_disconnected")

    return (windows + mac + linux + deck + disc)