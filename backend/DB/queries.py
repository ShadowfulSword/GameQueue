from DB.connections import get_connection
from datetime import datetime


def _cursor(conn):
    if conn is None:
        raise RuntimeError("Database connection could not be established – check MySQL is running and .env DB_* vars")
    # Buffered cursors avoid "Unread result found" when chaining statements on one cursor.
    return conn.cursor(buffered=True)


#general layout:
    #connect, make sql query, execute, close connections 

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
    
    sql = "INSERT IGNORE INTO Users (steam_id, created_at) VALUES (%s, %s)"
    cursor.execute(sql, (steam_id, datetime.now()))
    cursor.execute("SELECT user_id FROM Users WHERE steam_id = %s", (steam_id,))
    user_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()
    conn.close()
    return user_id

def insert_game(game):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "INSERT IGNORE INTO Games (app_id, title, avg_playtime) VALUES (%s, %s, %s)"
    cursor.execute(sql,(game["appid"], game["name"], game["playtime_mins"]) )

    conn.commit()
    cursor.close()
    conn.close()

def insert_user_library(user_id, app_id, playtime):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "INSERT IGNORE INTO UserLibrary (user_id, app_id, playtime_mins, status) VALUES (%s, %s, %s, 'backlog')"
    cursor.execute(sql, (user_id, app_id, playtime))

    conn.commit()
    cursor.close()
    conn.close()

def insert_genre(genre_id, genre_name):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "INSERT IGNORE INTO Genres (genre_id, genre_name) VALUES (%s, %s)"
    cursor.execute(sql, (genre_id, genre_name))

    conn.commit()
    cursor.close()
    conn.close()

def insert_game_genre(game_id, genre_id):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "INSERT IGNORE INTO GameGenres (game_id, genre_id) VALUES (%s, %s)"
    cursor.execute(sql, (game_id, genre_id))

    conn.commit()
    cursor.close()
    conn.close()

#check if we have game already before adding in genre
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

def get_backlog_games(user_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT UserLibrary.app_id, UserLibrary.playtime_mins, Games.title FROM UserLibrary JOIN Games On UserLibrary.app_id = Games.app_id WHERE UserLibrary.user_id = %s AND UserLibrary.status = 'backlog'"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return [{"appid": row[0], "playtime_mins": row[1], "title": row[2]} for row in result]

def get_game_genres(app_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT genre_id FROM GameGenres WHERE game_id =%s"
    cursor.execute(sql, (app_id,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return [row[0] for row in result]

def get_all_genre():
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT genre_id FROM Genres"
    cursor.execute(sql)
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return {genre_id: position for position, (genre_id,) in enumerate(result)}

def get_library(user_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT UserLibrary.app_id, UserLibrary.playtime_mins, UserLibrary.status, Games.title FROM UserLibrary JOIN Games ON UserLibrary.app_id = Games.app_id WHERE user_id = %s"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return [{"appid": row[0], "title": row[3], "playtime_mins": row[1], "status": row[2]} for row in result]


def update_game_status(user_id, app_id, status):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "UPDATE UserLibrary SET status = %s WHERE user_id = %s AND app_id = %s"
    cursor.execute(sql, (status, user_id, app_id))

    conn.commit()
    cursor.close()
    conn.close()

def get_hltb_cache(app_id):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "SELECT hltb_playtime FROM Games WHERE app_id = %s"
    cursor.execute(sql, (app_id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()
    return result[0] if result else None

def update_hltb_cache(app_id, hltb_time):
    conn = get_connection()
    cursor = _cursor(conn)

    sql = "UPDATE Games SET hltb_playtime = %s WHERE app_id = %s"
    cursor.execute(sql, (hltb_time, app_id))


    conn.commit()
    cursor.close()
    conn.close()

def get_all_backlog_genres(user_id):
    conn = get_connection()
    cursor = _cursor(conn)
    
    sql = "SELECT GameGenres.game_id, GameGenres.genre_id FROM UserLibrary JOIN GameGenres ON UserLibrary.app_id = GameGenres.game_id WHERE UserLibrary.user_id = %s AND UserLibrary.status = 'backlog'"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    result_dict = {}
    for app_id, genre_id in result:
        if app_id not in result_dict:
            result_dict[app_id] = []
        result_dict[app_id].append(genre_id)
    return result_dict