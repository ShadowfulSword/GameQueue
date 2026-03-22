from DB.connections import get_connection
from datetime import datetime


#general layout:
    #connect, make sql query, execute, close connections 

def insert_user(steam_id):
    conn = get_connection()
    cursor = conn.cursor()
    
    sql = "INSERT IGNORE INTO Users (steam_id, created_at) VALUES (%s, %s)"
    cursor.execute(sql, (steam_id, datetime.now()))
    user_id = cursor.lastrowid

    conn.commit()
    cursor.close()
    conn.close()
    return user_id

def insert_game(game):
    conn = get_connection()
    cursor = conn.cursor()
    
    sql = "INSERT IGNORE INTO Games (app_id, title, avg_playtime) VALUES (%s, %s, %s)"
    cursor.execute(sql,(game["appid"], game["name"], game["playtime_mins"]) )

    conn.commit()
    cursor.close()
    conn.close()

def insert_user_library(user_id, app_id, playtime):
    conn = get_connection()
    cursor = conn.cursor()
    
    sql = "INSERT INTO UserLibrary (user_id, app_id, playtime_mins, status) VALUES (%s, %s, %s, 'backlog')"
    cursor.execute(sql, (user_id, app_id, playtime))

    conn.commit()
    cursor.close()
    conn.close()

def insert_genre(genre_id, genre_name):
    conn = get_connection()
    cursor = conn.cursor()
    
    sql = "INSERT IGNORE INTO Genres (genre_id, genre_name) VALUES (%s, %s)"
    cursor.execute(sql, (genre_id, genre_name))

    conn.commit()
    cursor.close()
    conn.close()

def insert_game_genre(game_id, genre_id):
    conn = get_connection()
    cursor = conn.cursor()
    
    sql = "INSERT IGNORE INTO GameGenres (game_id, genre_id) VALUES (%s, %s)"
    cursor.execute(sql, (game_id, genre_id))

    conn.commit()
    cursor.close()
    conn.close()