import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AppDataContext } from '../context/AppDataContext';

export default function PersonalDetailsPage() {
    const { user, setUser } = useContext(UserContext);
    const { workers, setWorkers, clients, setClients, tasks, setTasks, userList, setUserList, teams } = useContext(AppDataContext);

    // Redirect if not logged in
    if (!user || !user.isLoggedIn) {
        return <h2 style={{ textAlign: 'center' }}>עליך להתחבר קודם</h2>;
    }

    // Form state
    const [username, setUsername] = useState(user.username);
    // get initial password from userList in AppDataContext
    const initialPassword = userList.find(u => u.username === user.username)?.password || '';
    const [password, setPassword] = useState(initialPassword);
    const [showPassword, setShowPassword] = useState(false);

    // Mouse handlers for hover reveal
    const handleMouseEnter = () => setShowPassword(true);
    const handleMouseLeave = () => setShowPassword(false);

    // Save personal changes
    const handleSave = () => {
        if (!username.trim()) return alert('יש להזין שם משתמש');
        if (!password) return alert('יש להזין סיסמה');

        const oldUsername = user.username;
        const newUsername = username.trim();

        // Update userList
        setUserList(
            userList.map(u =>
                u.username === oldUsername
                    ? { ...u, username: newUsername, password }
                    : u
            )
        );

        // Update UserContext
        setUser({ ...user, username: newUsername, password });

        // Update workers
        setWorkers(
            workers.map(w =>
                w.username === oldUsername
                    ? { ...w, username: newUsername }
                    : w
            )
        );

        // Update clients
        setClients(
            clients.map(c =>
                c.defaultManager === oldUsername
                    ? { ...c, defaultManager: newUsername }
                    : c
            )
        );

        // Update tasks
        setTasks(
            tasks.map(t =>
                t.assignedTo === oldUsername
                    ? { ...t, assignedTo: newUsername }
                    : t
            )
        );

        alert('הפרטים נשמרו בהצלחה');
    };

    // Data for display
    const meWorker = workers.find(w => w.username === user.username) || {};
    const hoursWorked = meWorker.hoursWorked || 0;
    const abilities = meWorker.abilities || [];
    const myClients = clients.filter(c => c.defaultManager === user.username).map(c => c.name);
    const myTeam = teams.find(t => t.id === meWorker.team);
    const teamMembers = workers.filter(w => w.team === meWorker.team).map(w => w.username);
    const isLeader = user.role === 'teamLeader';

    return (
        <div style={{ padding: '2rem' }} dir="rtl">
            <h2>פרטים אישיים</h2>

            <div className="mb-3">
                <label>שם משתמש:</label>
                <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
            </div>

            <div className="mb-3" style={{ position: 'relative' }}>
                <label>סיסמה:</label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingLeft: '2rem' }}
                />
                <span
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '8px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
          👁️
        </span>
            </div>

            <button className="btn btn-primary mb-4" onClick={handleSave}>
                שמור שינויים
            </button>

            <h3>תחומי ההתמחות שלי</h3>
            <ul>
                {abilities.length > 0
                    ? abilities.map(a => <li key={a}>{a}</li>)
                    : <li>אין נתונים</li>}
            </ul>

            <h3>לקוחות קבועים שלי</h3>
            <ul>
                {myClients.length > 0
                    ? myClients.map(c => <li key={c}>{c}</li>)
                    : <li>אין לקוחות קבועים</li>}
            </ul>

            <h3>הצוות שלי</h3>
            <p><strong>שם צוות:</strong> {myTeam?.name || 'לא משויך'}</p>
            <p><strong>תפקיד:</strong> {isLeader ? 'ראש צוות' : 'חבר צוות'}</p>
            <ul>
                {teamMembers.length > 0
                    ? teamMembers.map(m => <li key={m}>{m}</li>)
                    : <li>אין חברים</li>}
            </ul>

            <h3>שעות עבודה</h3>
            <p>{hoursWorked} שעות</p>
        </div>
    );
}
