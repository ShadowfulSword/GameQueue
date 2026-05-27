from pathlib import Path

from dotenv import load_dotenv
import os
import mysql.connector

#_REPO_ROOT = Path(__file__).resolve().parents[1]
#load_dotenv(_REPO_ROOT / ".env")
load_dotenv()


#load env file, try and connect to the DB, return said connection or error
def get_connection():
    #get the database creds and env vars
    host_name = os.getenv("DB_HOST")
    user_name = os.getenv("DB_USER")
    pwd = os.getenv("DB_PASSWORD")
    db = os.getenv("DB_NAME")
    port = int(os.getenv("DB_PORT", "3306"))

    try:
        #Try and connect to a MySQL database
        #On success return the connection
        conn = mysql.connector.connect(
            host=host_name,
            port=port,
            user=user_name,
            passwd=pwd,
            database=db,
        )
        return conn
    except mysql.connector.Error as err:
        #on failure, print the error and return None
        print(f"Error: {err}")
