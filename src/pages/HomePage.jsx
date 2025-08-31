// client/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Select from 'react-select';
import { SERVER_URL } from '../Utils/Constants.jsx';
import '../CssFiles/homepage.css';
import '../CssFiles/filterModal.css';
import '../CssFiles/taskCard.css';

const PAGE_SIZE = 4;

export default function HomePage() {
    const cookies = new Cookies();
    const token = cookies.get('token');

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ title: '', client: '', participant: '' });
    const [modalField, setModalField] = useState(null);

    const [pendingPage, setPendingPage] = useState(1);
    const [completedPage, setCompletedPage] = useState(1);

    const [showPartModal, setShowPartModal] = useState(false);
    const [participants, setParticipants] = useState([]);

    const [showLogModal, setShowLogModal] = useState(false);
    const [logAssignmentId, setLogAssignmentId] = useState(null);
    const [logUsers, setLogUsers] = useState([]);
    const [logUser, setLogUser] = useState(null);
    const [logHours, setLogHours] = useState('');
    const [maxLogHours, setMaxLogHours] = useState(0);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetch(`${SERVER_URL}/get-tasks?token=${encodeURIComponent(token)}`)
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(setTasks)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    if (!token) return <Navigate to="/login" replace />;
    if (loading) return <p className="loading">טוען משימות…</p>;

    const applyFilters = list =>
        list.filter(t =>
            (!filters.title || t.taskName === filters.title) &&
            (!filters.client || t.clientName === filters.client) &&
            (!filters.participant || (t.participants || []).some(p => p.username === filters.participant))
        );

    const pendingAll = applyFilters(tasks.filter(t => t.status === 'assigned'));
    const completedAll = applyFilters(tasks.filter(t => t.status === 'completed'));

    const allParticipants = [...new Set(tasks.flatMap(t => (t.participants || []).map(p => p.username)))];

    const paginate = (list, page) => list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = list => Math.max(1, Math.ceil(list.length / PAGE_SIZE));

    const openParticipants = async id => {
        const res = await fetch(`${SERVER_URL}/tasks/${id}/participants?token=${encodeURIComponent(token)}`);
        if (!res.ok) return alert('שגיאה בטעינת משתתפים');
        setParticipants(await res.json());
        setShowPartModal(true);
    };

    const openLogModal = async (id, hoursRemaining) => {
        const res = await fetch(`${SERVER_URL}/tasks/${id}/participants?token=${encodeURIComponent(token)}`);
        if (!res.ok) return alert('שגיאה בטעינת עובדים');
        setLogUsers((await res.json()).map(p => ({ value: p.username, label: p.username })));
        setLogAssignmentId(id);
        setLogHours('');
        setMaxLogHours(hoursRemaining);
        setShowLogModal(true);
    };

    const submitLog = async () => {
        if (!logUser || !logHours || logHours <= 0 || logHours > maxLogHours) return alert('אנא הזן שעות תקינות');
        const url = `${SERVER_URL}/tasks/${logAssignmentId}/log-hours?token=${encodeURIComponent(token)}&username=${encodeURIComponent(logUser.value)}&hours=${logHours}`;
        const res = await fetch(url, { method: 'POST' });
        if (!res.ok) return alert('שגיאה ברישום');
        setShowLogModal(false);
        setLoading(true);
        setTasks(await (await fetch(`${SERVER_URL}/get-tasks?token=${encodeURIComponent(token)}`)).json());
        setLoading(false);
    };

    const exportExcel = async () => {
        try {
            const toExport = [...pendingAll, ...completedAll];
            if (!toExport.length) return alert('אין נתונים לייצוא');

            const participantsMap = {};
            await Promise.all(
                toExport.map(async (t) => {
                    const embedded = Array.isArray(t.participants) ? t.participants : null;
                    if (embedded && embedded.length) {
                        participantsMap[t.id] = embedded.map(p => ({
                            username: p.username,
                            hours:
                                typeof p.hours === 'number'
                                    ? p.hours
                                    : (typeof p.hoursAssigned === 'number' ? p.hoursAssigned : 0),
                        }));
                        return;
                    }
                    try {
                        const res = await fetch(
                            `${SERVER_URL}/tasks/${t.id}/participants?token=${encodeURIComponent(token)}`
                        );
                        if (!res.ok) throw new Error('participants fetch failed');
                        const arr = await res.json();
                        participantsMap[t.id] = arr.map(p => ({
                            username: p.username,
                            hours:
                                typeof p.hours === 'number'
                                    ? p.hours
                                    : (typeof p.hoursAssigned === 'number' ? p.hoursAssigned : 0),
                        }));
                    } catch {
                        participantsMap[t.id] = [];
                    }
                })
            );

            const fmt = (v) => {
                if (!v) return '';
                const d = typeof v === 'string' || typeof v === 'number' ? new Date(v) : v;
                if (Number.isNaN(d.getTime())) return '';
                return d.toLocaleString('he-IL');
            };

            const buildRows = (list) => {
                const rows = [];
                for (const t of list) {
                    const parts = participantsMap[t.id] || [];
                    const startAt =
                        t.assignedDate || t.assignedAt || t.startDate || t.startAt || null;

                    if (!parts.length) {
                        rows.push({
                            'מזהה': t.id,
                            'סטטוס': t.status === 'assigned' ? 'לביצוע' : 'בוצע',
                            'שם משימה': t.taskName,
                            'לקוח': t.clientName,
                            'תאריך התחלה': fmt(startAt),
                            'סה״כ נדרשות': t.hoursRequired,
                            'סה״כ דווחו': t.hoursLogged,
                            'נותרו': t.hoursRemaining,
                            'משתתף': '',
                            'שעות למשתתף': 0,
                        });
                    } else {
                        for (const p of parts) {
                            rows.push({
                                'מזהה': t.id,
                                'סטטוס': t.status === 'assigned' ? 'לביצוע' : 'בוצע',
                                'שם משימה': t.taskName,
                                'לקוח': t.clientName,
                                'תאריך התחלה': fmt(startAt),
                                'סה״כ נדרשות': t.hoursRequired,
                                'סה״כ דווחו': t.hoursLogged,
                                'נותרו': t.hoursRemaining,
                                'משתתף': p.username,
                                'שעות למשתתף': p.hours,
                            });
                        }
                    }
                }
                return rows;
            };

            const allRows = buildRows(toExport);

            const totalByUser = {};
            for (const t of toExport) {
                const parts = participantsMap[t.id] || [];
                for (const p of parts) {
                    totalByUser[p.username] = (totalByUser[p.username] || 0) + (p.hours || 0);
                }
            }
            const summaryRows = Object.entries(totalByUser)
                .sort((a, b) => b[1] - a[1])
                .map(([username, hours], i) => ({
                    '#': i + 1,
                    'עובד': username,
                    'סה״כ שעות': hours,
                }));

            const wb = XLSX.utils.book_new();
            const wsAll = XLSX.utils.json_to_sheet(allRows);
            XLSX.utils.book_append_sheet(wb, wsAll, 'כל המשימות');

            const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'סיכום לפי עובד');

            XLSX.writeFile(wb, 'tasks.xlsx');
        } catch (err) {
            console.error('Export Excel error:', err);
            alert('שגיאה בייצוא האקסל');
        }
    };




    return (
        <div className="home-cards-container">
            <div className="top-bar">
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-icon pending-icon">⏳</div>
                        <div>
                            <div className="stat-number">{pendingAll.length}</div>
                            <div className="stat-label">משימות לביצוע</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon completed-icon">✔️</div>
                        <div>
                            <div className="stat-number">{completedAll.length}</div>
                            <div className="stat-label">משימות שבוצעו</div>
                        </div>
                    </div>
                </div>
                <div className="cards-filter-bar">
                    <FilterButton label="📝 שם משימה" active={modalField === 'title'} onClick={() => setModalField('title')} />
                    <FilterButton label="🏢 לקוח" active={modalField === 'client'} onClick={() => setModalField('client')} />
                    <FilterButton label="👥 משתתפים" active={modalField === 'participant'} onClick={() => setModalField('participant')} />
                    {modalField && (
                        <FilterModal
                            title={modalField === 'title' ? 'שם משימה' : modalField === 'client' ? 'לקוח' : 'משתתפים'}
                            opts={modalField === 'title' ? [...new Set(tasks.map(t => t.taskName))] : modalField === 'client' ? [...new Set(tasks.map(t => t.clientName))] : allParticipants}
                            value={filters[modalField]}
                            onSelect={v => { setFilters(f => ({ ...f, [modalField]: v })); setModalField(null); }}
                            onClose={() => setModalField(null)}
                        />
                    )}
                </div>
            </div>

            <section className="cards-section">
                <h2 className="section-title">משימות לביצוע</h2>
                <button className="excel-btn" onClick={exportExcel}>📥 ייצוא אקסל</button>
                <div className="cards-grid">
                    {paginate(pendingAll, pendingPage).map(t => (
                        <TaskCard key={t.id} task={t} onView={() => openParticipants(t.id)} onLog={() => openLogModal(t.id, t.hoursRemaining)} />
                    ))}
                </div>
                <Pagination current={pendingPage} total={totalPages(pendingAll)} onChange={setPendingPage} />
            </section>

            <section className="cards-section">
                <h2 className="section-title">משימות שבוצעו</h2>
                <div className="cards-grid">
                    {paginate(completedAll, completedPage).map(t => (
                        <TaskCard key={t.id} task={t} completed onView={() => openParticipants(t.id)} />
                    ))}
                </div>
                <Pagination current={completedPage} total={totalPages(completedAll)} onChange={setCompletedPage} />
            </section>

            {showPartModal && <ParticipantsModal participants={participants} onClose={() => setShowPartModal(false)} />}
            {showLogModal && <LogHoursModal users={logUsers} value={logUser} hours={logHours} maxHours={maxLogHours} onUserChange={setLogUser} onHoursChange={setLogHours} onSubmit={submitLog} onClose={() => setShowLogModal(false)} />}
        </div>
    );
}

function FilterButton({ label, active, onClick }) {
    return <button className={`filter-button ${active ? 'active' : ''}`} onClick={onClick}>{label}</button>;
}

function FilterModal({ title, opts, value, onSelect, onClose }) {
    const [search, setSearch] = useState('');
    const filtered = opts.filter(o => o.toLowerCase().includes(search.toLowerCase()));
    return (
        <div className="filter-modal-backdrop" onClick={onClose}>
            <div className="filter-modal" onClick={e => e.stopPropagation()}>
                <h4>סינון לפי {title}</h4>
                <input className="filter-search" placeholder="🔍 חיפוש..." value={search} onChange={e => setSearch(e.target.value)} />
                <ul className="filter-list">
                    <li className={!value ? 'active' : ''} onClick={() => onSelect('')}>הכל</li>
                    {filtered.map(o => <li key={o} className={value === o ? 'active' : ''} onClick={() => onSelect(o)}>{o}</li>)}
                </ul>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
        </div>
    );
}

function TaskCard({ task, completed, onView, onLog }) {
    return (
        <div className={`task-card ${completed ? 'completed' : ''}`}>
            <h3 className="card-title" onClick={onView} style={{ cursor: 'pointer' }}>{task.taskName}</h3>
            <p className="card-client">{task.clientName}</p>
            <div className="card-participants">
                {(task.participants || []).slice(0, 3).map(p => <span key={p.username} className="badge">{p.username}</span>)}
                {(task.participants || []).length > 3 && <button className="more-btn" onClick={onView}>+{task.participants.length - 3}</button>}
            </div>
            {!completed && <div className="card-progress"><div className="progress-bar"><div className="filled" style={{ width: `${100 * (task.hoursLogged / task.hoursRequired)}%` }} /></div><small>{task.hoursLogged} / {task.hoursRequired} שעות</small></div>}
            <div className="card-actions">
                {completed ? <button onClick={onView} className="btn btn-sm">צפייה</button> : <button onClick={onLog} className="btn btn-sm">רישום שעות</button>}
            </div>
        </div>
    );
}

function Pagination({ current, total, onChange }) {
    if (total <= 1) return null;
    return (
        <div className="pagination-cards">
            {Array.from({ length: total }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-button ${p === current ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
            ))}
        </div>
    );
}

function ParticipantsModal({ participants, onClose }) {
    return (
        <div className="filter-modal-backdrop" onClick={onClose}>
            <div className="filter-modal" onClick={e => e.stopPropagation()}>
                <h4>משתתפי המשימה</h4>
                <ul className="filter-list">
                    {participants.map(p => <li key={p.username}>{p.username} — {p.hoursAssigned}h</li>)}
                </ul>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
        </div>
    );
}

function LogHoursModal({ users, value, hours, maxHours, onUserChange, onHoursChange, onSubmit, onClose }) {
    return (
        <div className="filter-modal-backdrop" onClick={onClose}>
            <div className="filter-modal" onClick={e => e.stopPropagation()}>
                <h4>רישום שעות למשימה</h4>
                <Select options={users} value={value} onChange={onUserChange} placeholder="בחר עובד…" />
                <input type="number" className="filter-search" placeholder={`מספר שעות (נותרו ${maxHours})`} min="1" max={maxHours} value={hours} onChange={e => onHoursChange(Math.min(Number(e.target.value), maxHours))} />
                <div className="modal-actions">
                    <button className="btn-outline-blue" onClick={onSubmit}>שמור</button>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
            </div>
        </div>
    );
}
