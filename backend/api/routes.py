from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from DB.queries import get_library, update_game_status, get_user_id_by_steam
from algorithm.recommender import get_recommendations
from main import import_user_library
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Literal
import os


_REPO_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(_REPO_ROOT / ".env")
load_dotenv()
apikey = os.getenv("STEAM_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Request the body for the status
#Literal will make it so only our specific statuses are accepted
class StatusUpdate(BaseModel):
    status: Literal["backlog", "playing", "completed"]

#Trigger the import command for a given user -- gather the user's (steam_id) library
#steam_id is sent as a url
@app.post("/importlib/{steam_id}")
def importlib(steam_id: str):
    result = import_user_library(steam_id, apikey)
    if not result:
        raise HTTPException(status_code=400, detail="Import failed")
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    user_id = result.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=500, detail="Import finished without user_id")
    return {
        "message": "Library imported successfully",
        "user_id": user_id,
    }

@app.get("/user/by-steam/{steam_id}")
def user_by_steam(steam_id: str):
    try:
        uid = get_user_id_by_steam(steam_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    if uid is None:
        raise HTTPException(status_code=404, detail="Steam user not found")
    return {"user_id": uid}

#Return the top 5 recommended games for a user
@app.get("/recommendations/{user_id}")
@app.get("/reccomendations/{user_id}")
def recommendations(user_id: int):
    try:
        return {"recommendations": get_recommendations(user_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#Return the user's full lib
@app.get("/library/{user_id}")
def library(user_id: int):
    try:
        return get_library(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#Update the status for a game
@app.put("/library/{user_id}/{app_id}/status")
def update_game(user_id: int, app_id:int, body: StatusUpdate):
    try:
        update_game_status(user_id, app_id, body.status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Status updated successfully"}
