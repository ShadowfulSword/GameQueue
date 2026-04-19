from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv() #load the env once rather than on every call

#load env file, try and connect to the DB, return said connection or error
def get_connection():
    #get the database creds and env vars
    host_name = os.getenv("DB_HOST")
    user_name = os.getenv("DB_USER")
    pwd = os.getenv("DB_PASSWORD")
    db = os.getenv("DB_NAME")

    try:
        #Try and connect to a MySQL database
        #On success return the connection
        conn = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=pwd,
            database=db
        )
        return conn
    except mysql.connector.Error as err:
        #on failure, print the error and return None
        print(f"Error: {err}")#