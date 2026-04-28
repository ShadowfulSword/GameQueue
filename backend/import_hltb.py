from pathlib import Path
import pandas as pd
from DB.queries import update_hltb_cache
from DB.connections import get_connection
from dotenv import load_dotenv

_REPO_ROOT = Path(__file__).resolve().parent
load_dotenv(_REPO_ROOT / ".env")
load_dotenv()

#get all games from the DB where the HLTB doesnt have a time associated with it
def get_all_games():
    conn = get_connection()
    cursor = conn.cursor(buffered=True)
    cursor.execute("SELECT app_id, title FROM Games WHERE hltb_playtime IS NULL")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return [(row[0], row[1].lower().strip()) for row in result]

#from the csv get the times and add it to the backend
def import_hltb(csv_path=None):
    if csv_path is None:
        csv_path = _REPO_ROOT / "hltb_data.csv"
    df = pd.read_csv(csv_path)
    df['name_lower'] = df['game_game_name'].str.lower().str.strip()

    games = get_all_games()
    print(f"Found{len(games)} games with no HLTB data")
    
    matched = 0
    not_matched = []

    for app_id, title in games:
        row = df[df['name_lower'] == title]
        if row.empty:
            not_matched.append(title)
            continue
        
        row = row.iloc[0]
        time = row.get('game_comp_plus') or row.get('game_comp_main')

        if pd.isna(time) or time == 0:
            not_matched.append(title)
            continue
        
        update_hltb_cache(app_id, int(time) // 60)
        matched += 1
        print(f"✓ {title}: {round(int(time) / 3600, 1)} hrs")
    
    print(f"\nMatched: {matched} / {len(games)}")
    print(f"Unmatched ({len(not_matched)}):")
    for t in not_matched:
        print(f"  - {t}")
    
if __name__ == "__main__":
    import_hltb("hltb_data.csv")