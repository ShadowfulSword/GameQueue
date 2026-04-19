from fastapi import FastAPI
from DB.queries import get_library, update_game_status
from algorithm.recommender import get_recommendations
from main import import_user_library
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Literal
import os


#laod env variables
load_dotenv()
apikey = os.getenv("STEAM_API_KEY")

app = FastAPI()

#Request the body for the status
#Literal will make it so only our specific statuses are accepted
class StatusUpdate(BaseModel):
    status: Literal["backlog", "playing", "completed"]

#Trigger the import command for a given user -- gather the user's (steam_id) libary
#steam_id is sent as a url
@app.post("/importlib/{steam_id}")
def importlib(steam_id: int):
    import_user_library(steam_id, apikey)
    return {"message": "Library imported successfully"}

#Return the top 5 reccomended games for a user
@app.get("/reccomendations/{user_id}")
def reccomendations(user_id: int):
    return {"recommendations": get_recommendations(user_id)}

#Return the user's full lib
@app.get("/library/{user_id}")
def library(user_id: int):
    return get_library(user_id)

#Update teh status for a game 
@app.put("/library/{user_id}/{app_id}/status")
def update_game(user_id: int, app_id:int, body: StatusUpdate):
    update_game_status(user_id, app_id, body.status)
    return {"message": "Status updated successfully"}
