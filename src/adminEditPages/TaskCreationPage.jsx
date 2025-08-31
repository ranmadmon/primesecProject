// src/components/TaskCreationPage.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAppData } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CssFiles/page-layout.css'; // כיתת CSS משותפת
import { SERVER_URL } from '../Utils/Constants.jsx';

export default function TaskCreationPage() {
    const { tasks, setTasks } = useAppData();
    const [abilities, setAbilities] = useState([]);
    const [name, setName] = useState('');
    const [selectedReqs, setSelectedReqs] = useState([]);
    const [avgHours, setAvgHours] = useState('');
    const navigate = useNavigate();

    // Load abilities
    useEffect(() => {
        axios
            .get(`${SERVER_URL}/abilities`)
            .then(res => setAbilities(res.data.map(a => a.name)))
            .catch(err => {
                console.error('Failed to fetch abilities:', err);
                setAbilities([]);
            });
    }, []);

    const handleCreate = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            alert('יש להזין שם משימה');
            return;
        }
        const hours = parseInt(avgHours, 10);
        if (isNaN(hours) || hours <= 0) {
            alert('יש להזין שעות ממוצעות תקינות');
            return;
        }

        const payload = {
            name: trimmed,
            averageTime: hours,
            requires: selectedReqs.map(r => r.value),
        };

        try {
            const res = await axios.post(`${SERVER_URL}/tasks`, payload);
            setTasks([...tasks, res.data]);
            alert('המשימה נוצרה בהצלחה');
            setName('');
            setSelectedReqs([]);
            setAvgHours('');
            navigate('/home');
        } catch (err) {
            console.error('Error creating task:', err);
            alert('שגיאה ביצירת המשימה, נסה שוב');
        }
    };

    const options = abilities.map(a => ({ value: a, label: a }));

    return (
        <div className="page-container" dir="rtl">
            <h2 className="page-header">יצירת משימה חדשה</h2>

            <div className="form-section">
                <label>שם משימה:</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="הזן שם משימה..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </div>

            <div className="form-section">
                <label>דרישות (יכולות נדרשות):</label>
                <Select
                    isMulti
                    options={options}
                    value={selectedReqs}
                    onChange={setSelectedReqs}
                    placeholder="בחר דרישות..."
                />
            </div>

            <div className="form-section">
                <label>שעות ממוצעות:</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder="הזן שעות ממוצעות..."
                    value={avgHours}
                    onChange={e => setAvgHours(e.target.value)}
                />
            </div>

            <div className="actions-row">
                <button className="btn-save" onClick={handleCreate}>
                    צור משימה
                </button>
            </div>
        </div>
    );
}
