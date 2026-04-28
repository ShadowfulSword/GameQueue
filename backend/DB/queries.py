from DB.connections import get_connection
from datetime import datetime


def _cursor(conn):
    if conn is None:
        raise RuntimeError("Database connection could not be established – check MySQL is running and .env DB_* vars")
    # Buffered cursors avoid "Unread result found" when chaining statements on one cursor.
    return conn.cursor(buffered=True)


#general layout:
#get connection -> create cursor -> execute SQL command -> write to db if needed -> close cursor -> close connection 

def get_user_id_by_steam(steam_id):
    conn = get_connection()
    if conn is None:
        return None
    cursor = _cursor(conn)
    sql = "SELECT user_id FROM Users WHERE steam_id = %s"
    cursor.execute(sql, (steam_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row[0] if row else None


def insert_user(steam_id):
    conn = get_connection()
    cursor = _cursor(conn)
    
    #Add the incomming user into the DB
    sql = "INSERT IGNORE INTO Users (steam_id, created_at) VALUES (%s, %s)"
    cursor.execute(sql, (steam_id, datetime.now()))
    #in case the user already exists, grab it and send that id (ignoring repeats)
    cursor.execute("SELECT user_id FROM Users WHERE steam_id = %s", (steam_id,))
    user_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()
    conn.close()
    return user_id

#Insert a game into the Games Table only if it is not already in the table
def insert_game(game):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "INSERT IGNORE INTO Games (app_id, title, avg_playtime) VALUES (%s, %s, %s)"
    cursor.execute(sql,(game["appid"], game["name"], game["playtime_mins"]) )

    conn.commit()
    cursor.close()
    conn.close()

#Link a specific game a user and store it in UserLibrary
#set all incoming games as Backlog and leave it to be changed later
def insert_user_library(user_id, app_id, playtime):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "INSERT IGNORE INTO UserLibrary (user_id, app_id, playtime_mins, status) VALUES (%s, %s, %s, 'backlog')"
    cursor.execute(sql, (user_id, app_id, playtime))

    conn.commit()
    cursor.close()
    conn.close()

#Get unique genres from a game (id an name) and store it
def insert_genre(genre_id, genre_name):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "INSERT IGNORE INTO Genres (genre_id, genre_name) VALUES (%s, %s)"
    cursor.execute(sql, (genre_id, genre_name))

    conn.commit()
    cursor.close()
    conn.close()

#Link a game to a genre and insert into GameGenres table
#only ad uniqe links
def insert_game_genre(game_id, genre_id):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "INSERT IGNORE INTO GameGenres (game_id, genre_id) VALUES (%s, %s)"
    cursor.execute(sql, (game_id, genre_id))

    conn.commit()
    cursor.close()
    conn.close()

#check if we have game already before adding in genre
#used to reduce HLTB and Steam API calls as there is a hard limit
def game_exists(app_id):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "SELECT COUNT(*) FROM GameGenres WHERE game_id = %s"
    cursor.execute(sql, (app_id,))
    result = cursor.fetchone()[0] > 0

    cursor.close()
    conn.close()
    return result

#select the genre id and for this user, get the games played/playing and what genre they have in common
def get_played_genres(user_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT GameGenres.genre_id FROM UserLibrary JOIN GameGenres ON UserLibrary.app_id = GameGenres.game_id WHERE UserLibrary.user_id = %s AND UserLibrary.status IN ('playing', 'completed')"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return [row[0] for row in result]

#Select and return all the games that a user has in their backlog
#use it for getting reccomendations
def get_backlog_games(user_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT UserLibrary.app_id, UserLibrary.playtime_mins, Games.title FROM UserLibrary JOIN Games On UserLibrary.app_id = Games.app_id WHERE UserLibrary.user_id = %s AND UserLibrary.status = 'backlog'"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return [{"appid": row[0], "playtime_mins": row[1], "title": row[2]} for row in result]

#Get all geners tied to a specific game to be used to make the vector for a game
def get_game_genres(app_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT genre_id FROM GameGenres WHERE game_id =%s"
    cursor.execute(sql, (app_id,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return [row[0] for row in result]

#Select all the generes for a specific index and vector
#Used to make consistent vectors for reccomendation
def get_all_genre():
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT genre_id FROM Genres"
    cursor.execute(sql)
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return {genre_id: position for position, (genre_id,) in enumerate(result)}

#Get the full user library 
#Create and return a dict entry with for all the games an drelated info
def get_library(user_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT UserLibrary.app_id, UserLibrary.playtime_mins, UserLibrary.status, Games.title, Games.hltb_playtime, GROUP_CONCAT(Genres.genre_name ORDER BY Genres.genre_name SEPARATOR ',') as genres FROM UserLibrary JOIN Games ON UserLibrary.app_id = Games.app_id LEFT JOIN GameGenres ON Games.app_id = GameGenres.game_id LEFT JOIN Genres ON GameGenres.genre_id = Genres.genre_id WHERE UserLibrary.user_id = %s GROUP BY UserLibrary.app_id, UserLibrary.playtime_mins, UserLibrary.status, Games.title, Games.hltb_playtime"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return [{"appid": row[0], "playtime_mins": row[1], "status": row[2], "title": row[3], "hltb_playtime": row[4], "genres": row[5].split(",") if row[5] else []} for row in result]

#Update a status for a game to playing or completed (sanitized and force checked in the API)
def update_game_status(user_id, app_id, status):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "UPDATE UserLibrary SET status = %s WHERE user_id = %s AND app_id = %s"
    cursor.execute(sql, (status, user_id, app_id))

    conn.commit()
    cursor.close()
    conn.close()

#Check if a game is already cached in the DB
#Reutns the time we already cached or None so we can make an API call
def get_hltb_cache(app_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT hltb_playtime FROM Games WHERE app_id = %s"
    cursor.execute(sql, (app_id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()
    return result[0] if result else None

#Store a retrieved HLTB result for a game in ID
#used to cache already retrived times so we dont make too many api calls and get blocked
def update_hltb_cache(app_id, hltb_time):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "UPDATE Games SET hltb_playtime = %s WHERE app_id = %s"
    cursor.execute(sql, (hltb_time, app_id))


    conn.commit()
    cursor.close()
    conn.close()

#Get the geners for all the games that the user has in their library
#Simpler than getting in one and a time
#create and return a dict mapping gameId to gener IDS
#{10: [1, 12], 20: [2, 23]}
def get_all_backlog_genres(user_id):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "SELECT GameGenres.game_id, GameGenres.genre_id FROM UserLibrary JOIN GameGenres ON UserLibrary.app_id = GameGenres.game_id WHERE UserLibrary.user_id = %s AND UserLibrary.status = 'backlog'"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    #build the dict of an app_id and map it to gener ids
    result_dict = {}
    for app_id, genre_id in result:
        if app_id not in result_dict:
            result_dict[app_id] = []
        result_dict[app_id].append(genre_id)
    return result_dict


#Get all the generes of the games and reutn it as a dict
def get_library_genres(user_id):
    conn = get_connection()
    cursor = _cursor(conn)
    sql = """
        SELECT DISTINCT Genres.genre_id, Genres.genre_name
        FROM UserLibrary
        JOIN GameGenres ON UserLibrary.app_id = GameGenres.game_id
        JOIN Genres ON GameGenres.genre_id = Genres.genre_id
        WHERE UserLibrary.user_id = %s
        ORDER BY Genres.genre_name
    """
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"genre_id": row[0], "genre_name": row[1]} for row in result]