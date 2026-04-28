import { useState } from "react";
import styles from './Landing.module.css'
import { importLibrary } from "../api/index.js";
import { useNavigate } from 'react-router-dom'
export default function Landing(){
    const [steamId, setSteamId] = useState('');
    console.log(steamId);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    async function handleImport() {
        setLoading(true)
        setError('')
        try{
            const result = await importLibrary(steamId)
            navigate('/library', {state: {user_id: result.user_id}})
        }catch(e){
            setError('Import failed. Check your Steam ID and try again')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <img src="/GameQueueLogo.png" className={styles.logo} alt="GameQueue logo" />
                <h1 className={styles.title}>GameQueue</h1>
                <p className={styles.subtitle}>Enter your Steam ID to get started</p>
                    <input
                        className={styles.input}
                        value={steamId}
                        onChange={(e) => setSteamId(e.target.value)}
                        placeholder="eg. 7661198XXXXXXXXX"
                    />
                <button className={styles.button} onClick={handleImport} disabled={loading}>
                    {loading ? 'Importing...': 'Import Library'}
                </button>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.divider}/>
                <p className={styles.hint}>
                Make sure your steam profile is set to{""} 
                    <a href="https://steamcommunity.com/login" target="_blank" rel="noreferrer"> public</a>{""} before importing
                </p>
            </div>

        </div>
    );
}