// src/components/AbilityEditPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CssFiles/page-layout.css';  // מייבאים את הסגנונות
import { SERVER_URL } from '../Utils/Constants.jsx';

export default function AbilityEditPage() {
    const [abilities, setAbilities] = useState([]);
    const [newAbility, setNewAbility] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAbilities();
    }, []);

    const loadAbilities = () => {
        setLoading(true);
        axios
            .get(`${SERVER_URL}/abilities`)
            .then(res => setAbilities(res.data))
            .catch(err => {
                console.error('Failed to load abilities:', err);
                setAbilities([]);
            })
            .finally(() => setLoading(false));
    };

    const handleAddAbility = () => {
        const name = newAbility.trim();
        if (!name) return;
        axios
            .post(`${SERVER_URL}/abilities`, { name })
            .then(() => {
                setNewAbility('');
                loadAbilities();
            })
            .catch(err => {
                console.error('Error creating ability:', err);
                alert('שגיאה ביצירת היכולת');
            });
    };

    const handleDeleteAbility = name => {
        if (!window.confirm(`האם למחוק את היכולת "${name}"?`)) return;
        axios
            .post(`${SERVER_URL}/deleteAbility`, null, { params: { name } })
            .then(() => loadAbilities())
            .catch(err => {
                console.error('Error deleting ability:', err);
                alert('שגיאה במחיקת היכולת');
            });
    };

    return (
        <div className="page-container">
            <h2 className="page-header">ניהול יכולות</h2>

            <div className="form-section">
                <label>יכולת חדשה:</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="הזן שם יכולת..."
                    value={newAbility}
                    onChange={e => setNewAbility(e.target.value)}
                />

                <div className="actions-row">
                    <button
                        className="btn-primary"
                        onClick={handleAddAbility}
                        disabled={!newAbility.trim()}
                    >
                        הוסף יכולת
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="placeholder-text">טוען יכולות…</p>
            ) : abilities.length === 0 ? (
                <p className="placeholder-text">אין יכולות להציג</p>
            ) : (
                <ul className="list-group">
                    {abilities.map(a => (
                        <li key={a.id} className="list-group-item">
                            <span>{a.name}</span>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteAbility(a.name)}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
