import { useState } from "react";
import styles from './Landing.module.css'
import { importLibrary } from "../api/index.js";
import { useNavigate } from 'react-router-dom'

//Entry page for users to input Steam ID and import library
export default function Landing() {
    const [steamId, setSteamId] = useState('');
    //console.log(steamId);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    async function handleImport() {
        setLoading(true)
        setError('')
        try {
            const result = await importLibrary(steamId)
            //seperate new users and send to onboarding
            console.log("IMPORT RESULT:", result)
            if (result.is_new_user) {
                navigate('/genre-select', { state: { user_id: result.user_id } })
            } else {
                navigate('/library', { state: { user_id: result.user_id } })
            }
        } catch (e) {
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
                {/*Diable import button while importing to let only one request send at once */}
                <button className={styles.button} onClick={handleImport} disabled={loading}>
                    {loading ? 'Importing...' : 'Import Library'}
                </button>
                {/*Check if we get an error, if we do display to the user*/}
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.divider} />
                {/*Give the user a link to set their profile to public in the steam profile*/}
                <p className={styles.hint}>
                    Make sure your steam profile is set to{""}
                    <a href="https://steamcommunity.com/login" target="_blank" rel="noreferrer"> public</a>{""} before importing
                </p>
            </div>

        </div>
    );
}