import { useState } from "react";
export default function Landing(){
    const [steamId, setSteamId] = useState('');
    console.log(steamId);
    return (
        <div>
            <h1>Game Queue</h1>
            
            <input
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
            />

            <button onClick={() => console.log(steamId)}>
                Import Library
            </button>
        </div>


    );
}