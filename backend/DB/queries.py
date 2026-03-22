from DB.connections import get_connection
from datetime import datetime



def insert_user(steam_id):
    conn = get_connection()
    cursor = conn.cursor()
    
    sql = "INSERT INTO Users (steam_id, created_at) VALUES (%s, %s)"
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
    cursor.execute(sql,(game["app_id"], game["title"], game["playtime_mins"]) )

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
