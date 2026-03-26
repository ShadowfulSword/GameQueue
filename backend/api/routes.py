from fastapi import FastAPI
from DB.queries import get_library, update_game_status
from algorithm.recommender import get_recommendations
from main import import_user_library
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Literal
import os



load_dotenv()
apikey = os.getenv("STEAM_API_KEY")

app = FastAPI()


class StatusUpdate(BaseModel):
    status: Literal["backlog", "playing", "completed"]

@app.post("/importlib/{steam_id}")
def importlib(steam_id: int):
    import_user_library(steam_id, apikey)
    return {"message": "Library imported successfully"}

@app.get("/reccomendations/{user_id}")
def reccomendations(user_id: int):
    return {"recommendations": get_recommendations(user_id)}

@app.get("/library/{user_id}")
def library(user_id: int):
    return get_library(user_id)

@app.put("/library/{user_id}/{app_id}/status")
def update_game(user_id: int, app_id:int, body: StatusUpdate):
    update_game_status(user_id, app_id, body.status)
    return {"message": "Status updated successfully"}
