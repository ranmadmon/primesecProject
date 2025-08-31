import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { SERVER_URL } from '../Utils/Constants.jsx';
import '../CssFiles/TaskAssignmentPage.css';

const ROLE_LABELS = {
    1: 'עובד רגיל',
    2: 'ראש צוות',
    3: 'אדמין',
    4: 'אדמין ראש צוות'
};

export default function TaskAssignmentPage() {
    const cookies = new Cookies();
    const token = cookies.get('token');

    const [tasks,             setTasks]             = useState([]);
    const [clients,           setClients]           = useState([]);
    const [available,         setAvailable]         = useState([]);
    const [loading,           setLoading]           = useState(true);
    const [taskId,            setTaskId]            = useState(null);
    const [clientId,          setClientId]          = useState(null);
    const [selectedUsers,     setSelectedUsers]     = useState([]);
    const [hours,             setHours]             = useState('');
    const [currentUserTeamId, setCurrentUserTeamId] = useState(null);

    // טעינת משימות, לקוחות וזהות המשתמש
    useEffect(() => {
        async function fetchData() {
            try {
                const [tRes, cRes, uRes] = await Promise.all([
                    axios.get(`${SERVER_URL}/tasks`,   { params: { token } }),
                    axios.get(`${SERVER_URL}/clients`, { params: { token } }),
                    axios.get(`${SERVER_URL}/get-username-by-token`, { params: { token } })
                ]);
                setTasks(tRes.data);
                setClients(cRes.data);

                // שליפת המידע על המשתמש הנוכחי כדי לדעת teamId
                const username = uRes.data;
                const workers = await axios.get(`${SERVER_URL}/workers`, { params: { token } });
                const me = workers.data.find(w => w.username === username);
                setCurrentUserTeamId(me?.teamId ?? null);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    // עדכון שעות ברירת מחדל בעת בחירת משימה
    useEffect(() => {
        if (taskId != null) {
            const task = tasks.find(t => t.id === +taskId);
            setHours(task?.averageTime ?? '');
            setAvailable([]);
            setSelectedUsers([]);
        }
    }, [taskId, tasks]);

    if (loading) return <p>טוען נתונים…</p>;
    if (!token)   return <h2>אנא התחבר/י</h2>;

    const handleFindWorkers = async () => {
        if (!taskId || !clientId) {
            alert('אנא בחר/י משימה ולקוח');
            return;
        }
        try {
            const res = await axios.get(
                `${SERVER_URL}/find-workers`,
                { params: { taskId, clientId, token } }
            );
            const reqs = tasks.find(t => t.id === +taskId)?.requires || [];
            const capable = res.data.filter(w =>
                reqs.every(r => (w.abilities || []).includes(r))
            );
            setAvailable(capable);
            setSelectedUsers([]);
        } catch (e) {
            console.error(e);
            alert('שגיאה בטעינת עובדים');
        }
    };

    const handleAssign = async () => {
        if (selectedUsers.length === 0) {
            alert('אנא בחר/י לפחות עובד אחד');
            return;
        }
        if (!hours || isNaN(hours) || hours <= 0) {
            alert('אנא הזן/י מספר שעות תקין');
            return;
        }
        const params = new URLSearchParams();
        params.append('token',    token);
        params.append('taskId',   taskId);
        params.append('clientId', clientId);
        params.append('hours',    hours);
        selectedUsers.forEach(u => params.append('usernames', u.value));

        try {
            await axios.post(`${SERVER_URL}/tasks/assign?${params.toString()}`);
            alert('המשימה הוקצתה בהצלחה');
            setTaskId(null);
            setClientId(null);
            setAvailable([]);
            setSelectedUsers([]);
            setHours('');
        } catch (e) {
            console.error(e);
            alert('שגיאה בהקצאת המשימה');
        }
    };

    return (
        <div className="task-assignment-background" dir="rtl">
            <div className="task-assignment-container">
                <h2 className="header-center">הקצאת משימה</h2>

                <Select
                    placeholder="● בחירת משימה ●"
                    options={tasks.map(t => ({ value: t.id, label: t.name }))}
                    onChange={o => setTaskId(o.value)}
                    value={taskId != null && { value: taskId, label: tasks.find(t => t.id === taskId)?.name }}
                />

                <Select
                    className="mt-3"
                    placeholder="● בחירת לקוח ●"
                    options={clients.map(c => ({ value: c.id, label: c.name }))}
                    onChange={o => setClientId(o.value)}
                    value={clientId != null && { value: clientId, label: clients.find(c => c.id === clientId)?.name }}
                />

                <button className="btn-primary-center mt-3" onClick={handleFindWorkers}>
                    🔍 איתור עובדים מתאימים
                </button>

                {available.length > 0 && (
                    <>
                        <Select
                            className="mt-4"
                            isMulti
                            placeholder="● בחרי/בחר עובדים להקצאה ●"
                            options={available.map(w => ({
                                value: w.username,
                                label: w.username,
                                data: {
                                    roleLabel: ROLE_LABELS[w.roleId],
                                    hoursWorked: w.hoursWorked,
                                    isTeamMember: w.teamId === currentUserTeamId
                                }
                            }))}
                            formatOptionLabel={opt => (
                                <div style={{ lineHeight: 1.2 }}>
                                    <div style={{ fontWeight: 600 }}>{opt.label}</div>
                                    <div style={{ fontSize: '0.85em', color: '#555' }}>
                                        תפקיד: {opt.data.roleLabel} | שעות שבוצעו: {opt.data.hoursWorked}h{' '}
                                        {opt.data.isTeamMember && '| חבר/ה בצוות שלי'}
                                    </div>
                                </div>
                            )}
                            value={selectedUsers}
                            onChange={setSelectedUsers}
                        />

                        <div className="mt-3">
                            <label style={{ fontWeight: 500 }}>שעות ברירת מחדל (ניתן לשינוי):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={hours}
                                onChange={e => setHours(e.target.value)}
                                min="1"
                                placeholder="הזן/י מספר שעות"
                            />
                        </div>

                        <button className="btn-success-center mt-4" onClick={handleAssign}>
                            ✅ אישור הקצאה
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
