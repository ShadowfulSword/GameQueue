from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from DB.queries import get_library, update_game_status, get_user_id_by_steam, get_library_genres, insert_user_preferences, bulk_update_status
from algorithm.recommender import get_recommendations
from main import import_user_library
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Literal
import os
from import_hltb import import_hltb


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
    is_new_user = get_user_id_by_steam(steam_id) is None
    result = import_user_library(steam_id, apikey)
    new_game_ids = result.get("new_game_ids", [])
    if not result:
        raise HTTPException(status_code=400, detail="Import failed")
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    user_id = result.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=500, detail="Import finished without user_id")
    if new_game_ids:
        import_hltb()
    print("IS NEW USER: ", is_new_user)
    return {
        "message": "Library imported successfully",
        "user_id": user_id,
        "is_new_user": is_new_user
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
import traceback
from fastapi import HTTPException

@app.get("/recommendations/{user_id}")
@app.get("/reccomendations/{user_id}")
def recommendations(user_id: int):
    try:
        return {"recommendations": get_recommendations(user_id)}
    except Exception as e:
        traceback.print_exc()  # 🔴 THIS is what you’re missing
        raise HTTPException(status_code=500, detail=str(e))

#Get all the generes for filtering
@app.get("/library/{user_id}/genres")
def library_generes(user_id:int):
    try:
        return get_library_genres(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail= str(e))
    
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


#onboarding process
#specify how you want to send the prefrences and the status (as a list that the user makes)
class PreferencesBody(BaseModel):
    genre_ids: list[int]

class StatusesBody(BaseModel):
    statuses: dict[int, Literal["backlog", "playing", "completed"]]

#Set the onboarding page for prefrences
@app.post("/onboarding/{user_id}/preferences")
def save_preferences(user_id: int, body: PreferencesBody):
    try:
        insert_user_preferences(user_id, body.genre_ids)
        return {"message": "Preferences saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#set the onboarding page for game status
@app.post("/onboarding/{user_id}/statuses")
def save_statuses(user_id: int, body: StatusesBody):
    try:
        bulk_update_status(user_id, body.statuses)
        return {"message": "Statuses saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/onboarding/{user_id}/preferences")
def get_preferences(user_id: int):
    try:
        from DB.queries import get_saved_preferences
        return get_saved_preferences(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))