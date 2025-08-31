import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { User, Mail, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import '../cssFiles/PersonalDetailsPage.css';

export default function PersonalDetailsPage() {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [msg, setMsg] = useState('');

    const token = new Cookies().get('token');
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!token || hasFetched.current) return;
        hasFetched.current = true;

        axios.get('http://localhost:8080/my-details', { params: { token } })
            .then(resp => {
                const d = resp.data;
                setDetails(d);
                setNewUsername(d.username);
                setNewEmail(d.email);
                setNewPhone(d.phone);
            })
            .catch(() => setError('שגיאה בטעינת הפרטים ⚠️'))
            .finally(() => setLoading(false));
    }, [token]);

    if (!token) return <Navigate to="/login" replace />;
    if (loading) return <p className="loading"><Loader2 className="spin-icon"/> טוען...</p>;
    if (error) return <p className="error"><AlertCircle/> {error}</p>;

    const doUpdate = (field, value) => {
        setMsg('');
        const urlMap = {
            username: '/update-username',
            email: '/update-email',
            phone: '/update-phone',
        };
        axios.post(`http://localhost:8080${urlMap[field]}`, null, {
            params: {
                token,
                ['new' + field.charAt(0).toUpperCase() + field.slice(1)]: value
            }
        })
            .then(resp => {
                if (resp.data.success) {
                    setDetails(d => ({ ...d, [field]: value }));
                    setMsg('עודכן בהצלחה ✅');
                } else {
                    throw new Error();
                }
            })
            .catch(() => setMsg('השורה תפוסה או לא תקינה ⚠️'));
    };

    return (
        <div className="pd-main-container">
            <div className="pd-container" dir="rtl">
                <h2>📋 פרטים אישיים</h2>

                <div className="pd-section">
                    <label><User className="icon"/> שם משתמש:</label>
                    <input value={newUsername} onChange={e => setNewUsername(e.target.value)}/>
                    <button onClick={() => doUpdate('username', newUsername)}>עדכון שם</button>
                </div>

                <div className="pd-section">
                    <label><Mail className="icon"/> אימייל:</label>
                    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}/>
                    <button onClick={() => doUpdate('email', newEmail)}>עדכון אימייל</button>
                </div>

                <div className="pd-section">
                    <label><Phone className="icon"/> טלפון:</label>
                    <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="05xxxxxxxx"/>
                    <button onClick={() => doUpdate('phone', newPhone)}>עדכון טלפון</button>
                </div>

                <div className="pd-extra">
                    <div>
                        <h3>⭐ יכולות</h3>
                        <ul>{details.abilities.length ? details.abilities.map(a => <li key={a}>{a}</li>) : <li>אין יכולות</li>}</ul>
                    </div>
                    <div>
                        <h3>👥 לקוחות מנוהלים</h3>
                        <ul>{details.clients.length ? details.clients.map(c => <li key={c}>{c}</li>) : <li>אין לקוחות</li>}</ul>
                    </div>
                    <p>📌 <strong>שם צוות:</strong> {details.teamName || 'לא משויך'}</p>
                    <p>👔 <strong>ראש צוות:</strong> {details.isLeaderYesOrNo}</p>
                    <p>⏰ <strong>שעות עבודה:</strong> {details.hoursWorked}</p>
                </div>

                {msg && <p className="pd-msg"><CheckCircle/> {msg}</p>}
            </div>
        </div>
    );
}
