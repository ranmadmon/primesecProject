// client/src/pages/MyTeamPage.jsx

import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { Navigate } from 'react-router-dom';
import '../CssFiles/MyTeamPage.css';

export default function MyTeamPage() {
    const [me, setMe]            = useState(null);    // { username, roleId }
    const [members, setMembers]  = useState(null);    // TeamMemberDTO[] or null while loading
    const [selected, setSelected]= useState(null);
    const [error, setError]      = useState(null);

    const token = new Cookies().get('token');
    if (!token) return <Navigate to="/login" replace />;

    // 1. get current user info
    useEffect(() => {
        Promise.all([
            fetch(`http://localhost:8080/get-username-by-token?token=${encodeURIComponent(token)}`)
                .then(r => r.text()),
            fetch(`http://localhost:8080/get-permission?token=${encodeURIComponent(token)}`)
                .then(r => {
                    if (!r.ok) throw new Error();
                    return r.json();
                })
        ])
            .then(([username, roleId]) => {
                setMe({ username, roleId });
                if (roleId !== 2 && roleId !== 4) {
                    setError('עמוד זה פתוח רק לראש צוות');
                }
            })
            .catch(() => setError('שגיאה בקבלת פרטי משתמש'));
    }, [token]);

    // 2. once we know “me”, load the team and auto-select the leader
    useEffect(() => {
        if (!me || error) return;
        fetch(`http://localhost:8080/my-team?token=${encodeURIComponent(token)}`)
            .then(r => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then(data => {
                setMembers(data);
                // find and auto-select the team leader (yourself)
                const leader = data.find(m => m.username === me.username);
                if (leader) setSelected(leader);
            })
            .catch(() => setError('שגיאה בטעינת חברי צוות'));
    }, [me, error, token]);

    if (error) {
        return <h2 className="text-center">{error}</h2>;
    }
    if (!me || members === null) {
        return <p className="text-center">טוען...</p>;
    }

    return (
        <div dir="rtl" className="my-team-page">
            <h2 className="page-title">הצוות שלי</h2>
            <p className="welcome">
                מנהל צוות: <strong>{me.username}</strong>
            </p>
            <div className="team-wrapper">
                <ul className="team-list">
                    {members.map(m => {
                        const isLeader = m.roleId === 2 || m.roleId === 4;
                        const isSel    = selected?.username === m.username;
                        const itemCls  = [
                            'team-item',
                            isLeader && 'leader',
                            isSel && 'selected'
                        ].filter(Boolean).join(' ');
                        return (
                            <li
                                key={m.username}
                                className={itemCls}
                                onClick={() => setSelected(m)}
                            >
                                {m.username}
                            </li>
                        );
                    })}
                </ul>
                {selected && (
                    <div className="member-details-card">
                        <h3>{selected.username}</h3>
                        <p><strong>שעות עבודה:</strong> {selected.hoursWorked} שעות</p>
                        <p><strong>לקוחות מנוהלים:</strong></p>
                        {selected.clients.length > 0 ? (
                            <ul>
                                {selected.clients.map(c => <li key={c}>{c}</li>)}
                            </ul>
                        ) : (
                            <p>אין לקוחות מנוהלים</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
