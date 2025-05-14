import React, { useState } from 'react';
import Select from 'react-select';
import { useAppData } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';

export default function TaskCreationPage() {
    const { tasks, setTasks, abilities, setAbilities } = useAppData();
    const [name, setName] = useState('');
    const [selectedReqs, setSelectedReqs] = useState([]);
    const [avgHours, setAvgHours] = useState('');
    const navigate = useNavigate();

    const handleCreate = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            alert('יש להזין שם משימה');
            return;
        }
        if (!avgHours || isNaN(avgHours) || avgHours <= 0) {
            alert('יש להזין שעות ממוצעות תקינות');
            return;
        }
        const newId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        const newTask = {
            id: newId,
            name: trimmed,
            requires: selectedReqs.map(r => r.value),
            avgHours: parseFloat(avgHours),
        };
        setTasks([...tasks, newTask]);
        alert('המשימה נוצרה בהצלחה');
        // נקה שדות
        setName('');
        setSelectedReqs([]);
        setAvgHours('');
        navigate('/home');
    };

    const options = abilities.map(a => ({ value: a, label: a }));

    return (
        <div style={{ padding: '2rem' }} dir="rtl">
            <h2>יצירת משימה חדשה</h2>

            <div className="mb-3">
                <label>שם משימה:</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="הזן שם משימה..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label>דרישות (יכולות נדרשות):</label>
                <Select
                    isMulti
                    options={options}
                    value={selectedReqs}
                    onChange={setSelectedReqs}
                    placeholder="בחר דרישות..."
                />
            </div>

            <div className="mb-3">
                <label>שעות ממוצעות:</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder="הזן שעות ממוצעות..."
                    value={avgHours}
                    onChange={e => setAvgHours(e.target.value)}
                />
            </div>

            <button className="btn btn-primary" onClick={handleCreate}>
                צור משימה
            </button>
        </div>
    );
}
