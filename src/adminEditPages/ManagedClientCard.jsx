import React, { useState, useContext } from 'react';
import Select from 'react-select';
import Card from "../components/Card.jsx";
import { AppDataContext } from '../context/AppDataContext';

/**
 * רכיב כרטיס לקוח עם פונקציונליות להחלפת מנהל הלקוח.
 * משתמש ב־Card כעטיפה מבלי לשנות אותה.
 */
export default function ManagedClientCard({ client }) {
    const { workers, clients, setClients } = useContext(AppDataContext);
    const [showSelector, setShowSelector] = useState(false);
    const [newManager, setNewManager] = useState(null);

    const workerOptions = workers.map(w => ({ value: w.username, label: w.username }));

    const handleReplaceClick = () => {
        setShowSelector(true);
    };

    const handleConfirm = () => {
        if (!newManager) {
            alert('בחר מנהל חדש לפני האישור.');
            return;
        }
        // עדכון לקוח עם מנהל חדש
        setClients(
            clients.map(c =>
                c.id === client.id ? { ...c, defaultManager: newManager.value } : c
            )
        );
        setShowSelector(false);
        setNewManager(null);
    };

    return (
        <Card width="300px" color="#f0f0f0">
            <h5>{client.name}</h5>
            <p><strong>מנהל נוכחי:</strong> {client.defaultManager || 'לא נקבע'}</p>

            {showSelector ? (
                <>
                    <Select
                        options={workerOptions}
                        value={newManager}
                        onChange={setNewManager}
                        placeholder="בחר מנהל חדש..."
                    />
                    <button className="btn btn-sm btn-primary mt-2" onClick={handleConfirm}>
                        אשר
                    </button>
                </>
            ) : (
                <button className="btn btn-sm btn-outline-secondary" onClick={handleReplaceClick}>
                    החלף מנהל
                </button>
            )}
        </Card>
    );
}
