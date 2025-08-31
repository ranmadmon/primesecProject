// src/pages/EditTasksPage.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'universal-cookie';
import '../cssFiles/page-layout.css'; // העיצוב המשותף
import { SERVER_URL } from '../Utils/Constants.jsx';

export default function EditTasksPage() {
    const [tasks, setTasks]         = useState([]);
    const [abilities, setAbilities] = useState([]);

    const [selectedTask, setSelectedTask] = useState(null);
    const [name, setName]             = useState('');
    const [avgHours, setAvgHours]     = useState('');   // string לצורך התצוגה
    const [requires, setRequires]     = useState([]);

    const token = new Cookies().get('token');

    // טוען משימות ויכולות
    useEffect(() => {
        if (!token) return;
        Promise.all([
            axios.get(`${SERVER_URL}/tasks`,    { params: { token } }),
            axios.get(`${SERVER_URL}/abilities`,{ params: { token } })
        ])
            .then(([tRes, aRes]) => {
                setTasks(tRes.data);
                setAbilities(aRes.data.map(a => typeof a === 'string' ? a : a.name));
            })
            .catch(err => {
                console.error('Error loading tasks or abilities', err);
                alert('שגיאה בטעינת נתונים מהשרת');
            });
    }, [token]);

    // אתחול השדות כשבוחרים משימה
    useEffect(() => {
        if (!selectedTask) {
            setName('');
            setAvgHours('');
            setRequires([]);
            return;
        }
        const t = tasks.find(x => x.id === selectedTask.value);
        setName(t.name);
        setAvgHours(t.averageTime.toString());
        setRequires(t.requires.map(r => ({ value: r, label: r })));
    }, [selectedTask, tasks]);

    const taskOpts    = tasks.map(t => ({ value: t.id, label: t.name }));
    const abilityOpts = abilities.map(a => ({ value: a, label: a }));

    const handleSave = () => {
        if (!selectedTask) return alert('בחר משימה לפני שמירה');
        const trimmed = name.trim();
        if (!trimmed) return alert('יש להזין שם משימה');
        const hoursNum = parseFloat(avgHours);
        if (isNaN(hoursNum) || hoursNum <= 0) {
            return alert('יש להזין שעות ממוצעות תקינות');
        }
        const body = {
            id:           selectedTask.value,
            name:         trimmed,
            averageTime:  hoursNum,
            requires:     requires.map(r => r.value)
        };
        axios
            .post(`${SERVER_URL}/tasks/update`, body, { params: { token } })
            .then(resp => {
                if (resp.data.success) {
                    setTasks(prev => prev.map(t =>
                        t.id === body.id
                            ? { ...t, name: body.name, averageTime: body.averageTime, requires: body.requires }
                            : t
                    ));
                    alert('המשימה עודכנה בהצלחה');
                    setSelectedTask(null);
                } else {
                    throw new Error('Failed to update');
                }
            })
            .catch(err => {
                console.error('שגיאה בעדכון המשימה', err);
                alert('שגיאה בעדכון המשימה');
            });
    };

    const handleDelete = () => {
        if (!selectedTask) return alert('בחר משימה למחיקה');
        const t = tasks.find(x => x.id === selectedTask.value);
        if (!window.confirm(`האם למחוק את המשימה "${t.name}"?`)) return;

        // שימוש ב-POST במקום DELETE כדי לקרוא ל-@PostMapping("/tasks/{id}/delete")
        axios
            .post(
                `${SERVER_URL}/tasks/${t.id}/delete`,
                {},                  // גוף הבקשה ריק
                { params: { token } } // token כ-query param
            )
            .then(resp => {
                if (resp.data.success) {
                    setTasks(prev => prev.filter(x => x.id !== t.id));
                    alert('המשימה נמחקה');
                    setSelectedTask(null);
                } else {
                    throw new Error('Failed to delete');
                }
            })
            .catch(err => {
                console.error('שגיאה במחיקת המשימה', err);
                alert('שגיאה במחיקת המשימה');
            });
    };


    return (
        <div className="page-container" dir="rtl">
            <h2 className="page-header">עריכת משימה קיימת</h2>

            <div className="form-section">
                <label>בחר משימה:</label>
                <Select
                    options={taskOpts}
                    value={selectedTask}
                    onChange={opt => setSelectedTask(opt)}
                    placeholder="בחר משימה..."
                />
            </div>

            {selectedTask && (
                <>
                    <div className="form-section">
                        <label>שם משימה:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="שם משימה"
                        />
                    </div>

                    <div className="form-section">
                        <label>יכולות נדרשות:</label>
                        <Select
                            isMulti
                            options={abilityOpts}
                            value={requires}
                            onChange={setRequires}
                            placeholder="בחר יכולות..."
                        />
                    </div>

                    <div className="form-section">
                        <label>שעות ממוצעות:</label>
                        <input
                            type="number"
                            className="form-control"
                            value={avgHours}
                            onChange={e => setAvgHours(e.target.value)}
                        />
                    </div>

                    <div className="actions-row">
                        <button className="btn-delete" onClick={handleDelete}>
                            מחק משימה
                        </button>
                        <button className="btn-save" onClick={handleSave}>
                            שמור שינויים
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
