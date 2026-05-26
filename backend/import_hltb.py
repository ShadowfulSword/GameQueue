from pathlib import Path
import pandas as pd
from DB.queries import update_hltb_cache, update_game_details
from DB.connections import get_connection
from dotenv import load_dotenv
import re

"""
    Written by: Ayush & Ali
    Tested by: Ayush & Ali
    Debugged by: Ayush & Ali
    Commented and refactored by: Ayush & Ali
"""

_REPO_ROOT = Path(__file__).resolve().parent
load_dotenv(_REPO_ROOT / ".env")
load_dotenv()

#get all games from the DB where the HLTB doesnt have a time associated with it
def get_all_games():
    conn = get_connection()
    cursor = conn.cursor(buffered=True)
    cursor.execute("SELECT app_id, title FROM Games")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return [(row[0], row[1].lower().strip()) for row in result]


#make clean titles to cross refrence with our csv
def clean(s):
    if not isinstance(s, str):
        return ''
    s = s.lower().strip()
    s = re.sub(r'[®™©]', '', s)        # remove special symbols
    s = re.sub(r'\(\d{4}\)', '', s)     # remove year like (2005)
    s = re.sub(r'[^\w\s]', '', s)       # remove all punctuation
    s = re.sub(r'\s+', ' ', s).strip()  # collapse whitespace
    return s

def is_valid(val):
    return val is not None and not (isinstance(val, float) and pd.isna(val))


#from the csv get the times and add it to the backend
def import_hltb(csv_path=None):
    if(csv_path is None):
        csv_path = _REPO_ROOT / "hltb_data.csv"
    df = pd.read_csv(csv_path, low_memory=False)
    df['name_clean'] = df['game_game_name'].apply(clean)

    games = get_all_games()
    print(f"Found {len(games)} games with no HLTB data")

    matched = 0
    not_matched = []

    for app_id, title in games:
        title_clean = clean(title)
        #got a clean hit
        row = df[df['name_clean'] == title_clean]

        if row.empty: #if no match try without punctuation with regex matching
            short = title_clean[:15]
            candidates = df[df['name_clean'].str.startswith(short, na=False)]
            if not candidates.empty:
                row = candidates.iloc[[0]]
        
        if row.empty: #if still no match try contains instead
            row = df[df['name_clean'].str.contains(re.escape(title_clean[:20]), na=False)]
        
        if row.empty: #we just have no entry
            not_matched.append(title)
            continue
        
        row = row.iloc[0]
        time = row.get('game_comp_plus') or row.get('game_comp_main')
        summary = row.get('game_profile_summary')
        developer = row.get('game_profile_dev')
        publisher = row.get('game_profile_pub')
        #print(f"{title} : {summary}, {developer}, {publisher}")
        if is_valid(time) and time > 0:
            update_hltb_cache(app_id, int(time) // 60)
            matched += 1
            print(f"✓ {title}: {round(int(time) / 3600, 1)} hrs")



        if not pd.isna(summary) or not pd.isna(developer) or not pd.isna(publisher):
            update_game_details(
                app_id,
                summary if not pd.isna(summary) else None,
                developer if not pd.isna(developer) else None,
                publisher if not pd.isna(publisher) else None
            )

    #print(f"\nMatched: {matched} / {len(games)}")
    #print(f"Unmatched ({len(not_matched)}):")
    #for t in not_matched:
        #print(f"  - {t}")
    
if __name__ == "__main__":
    import_hltb("hltb_data.csv")

