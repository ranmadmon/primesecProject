import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AppDataContext } from '../context/AppDataContext';
import { Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function HomePage() {
    const { user, tasks = [], completedTasks = [], markTaskCompleted } = useContext(UserContext);
    const { workers } = useContext(AppDataContext);
    const [navigateToAssignment, setNavigateToAssignment] = useState(false);
    const [filters, setFilters] = useState({ title: '', client: '', assignedTo: '' });
    const [openDropdown, setOpenDropdown] = useState(null);

    if (!user || !user.isLoggedIn) {
        return <h2 style={{ textAlign: 'center' }}>עליך להתחבר קודם</h2>;
    }
    if (navigateToAssignment) {
        return <Navigate to="/task-assignment" />;
    }

    // Determine tasks visible based on role
    const getVisible = list => {
        if (user.role === 'admin') {
            return list;
        }
        if (user.role === 'teamLeader') {
            // find team of current user
            const me = workers.find(w => w.username === user.username);
            const teamId = me?.team;
            const teamMembers = workers
                .filter(w => w.team === teamId)
                .map(w => w.username);
            return list.filter(t => t.assignedTo === user.username || teamMembers.includes(t.assignedTo));
        }
        // regular user
        return list.filter(t => t.assignedTo === user.username);
    };

    const pending = getVisible(tasks);
    const completedVisible = getVisible(completedTasks);

    const applyFilters = list => list.filter(task => {
        const name = task.title || `משימה ${task.taskId}`;
        const cli = task.client || `לקוח ${task.clientId}`;
        return (!filters.title || name === filters.title)
            && (!filters.client || cli === filters.client)
            && (!filters.assignedTo || task.assignedTo === filters.assignedTo);
    });

    const filteredPending = applyFilters(pending);
    const filteredCompleted = applyFilters(completedVisible);
    const showExport = user.role === 'admin' && filteredPending.length > 0;

    // options source for dropdowns
    const topHas = filteredPending.length > 0;
    const sourceList = topHas ? [...filteredPending, ...filteredCompleted] : filteredCompleted;

    const getOptions = (list, field) => list
        .map(task => {
            if (field === 'title') return task.title || `משימה ${task.taskId}`;
            if (field === 'client') return task.client || `לקוח ${task.clientId}`;
            return task.assignedTo;
        })
        .reduce((acc, val) => acc.includes(val) ? acc : [...acc, val], []);

    const titleOpts = getOptions(sourceList, 'title');
    const clientOpts = getOptions(sourceList, 'client');
    const workerOpts = getOptions(sourceList, 'assignedTo');

    const handleExport = () => {
        const data = applyFilters(tasks);
        if (!data.length) return alert('אין משימות לייצוא');
        const ws = XLSX.utils.json_to_sheet(
            data.map((task, i) => ({ '#': i + 1, 'שם משימה': task.title || `משימה ${task.taskId}`, 'לקוח': task.client || `לקוח ${task.clientId}`, 'מי מבצע': task.assignedTo }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'משימות');
        XLSX.writeFile(wb, 'tasks.xlsx');
    };

    const ddStyle = { position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #ccc', margin: '4px 0', padding: 0, zIndex: 1000, listStyle: 'none', maxHeight: '200px', overflowY: 'auto', width: 'max-content' };
    const liStyle = { padding: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'normal' };

    const renderHeader = (label, field, options) => (
        <th style={{ position: 'relative', cursor: 'pointer' }}>
            <div onClick={() => setOpenDropdown(openDropdown === field ? null : field)}>{label}</div>
            {openDropdown === field && (
                <ul style={ddStyle}>
                    <li style={liStyle} onClick={() => { setFilters({ ...filters, [field]: '' }); setOpenDropdown(null); }}>הכל</li>
                    {options.map((opt, idx) => (
                        <li key={idx} style={liStyle} onClick={() => { setFilters({ ...filters, [field]: opt }); setOpenDropdown(null); }}>{opt}</li>
                    ))}
                </ul>
            )}
        </th>
    );

    const renderPlain = text => <th>{text}</th>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', minHeight: '100vh', boxSizing: 'border-box' }} dir="rtl">
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>ברוך הבא, {user.username}</h1>
            <div style={{ width: '100%', maxWidth: 800 }}>
                <div style={{ display: 'flex', justifyContent: showExport ? 'space-between' : 'center', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, textAlign: showExport ? 'left' : 'center', flex: showExport ? 'none' : 1 }}>משימות לביצוע:</h3>
                    {showExport && <button className="btn btn-success" onClick={handleExport}>ייצוא לאקסל</button>}
                </div>
                {(filters.title || filters.client || filters.assignedTo) && (
                    <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilters({ title: '', client: '', assignedTo: '' })}>נקה סינונים</button>
                    </div>
                )}
                {filteredPending.length === 0 ? (
                    <>
                        <p style={{ textAlign: 'center' }}>אין משימות להצגה</p>
                        {user.role === 'admin' && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button className="btn btn-primary" onClick={() => setNavigateToAssignment(true)}>סידור משימות</button>
                            </div>
                        )}
                    </>
                ) : (
                    <table className="table table-bordered text-center">
                        <thead>
                        <tr>
                            <th>#</th>
                            {renderHeader('שם משימה', 'title', titleOpts)}
                            {renderHeader('לקוח', 'client', clientOpts)}
                            {renderHeader('מי מבצע', 'assignedTo', workerOpts)}
                            <th>פעולה</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPending.map((task, idx) => (
                            <tr key={task.id || idx}>
                                <td>{idx + 1}</td>
                                <td>{task.title || `משימה ${task.taskId}`}</td>
                                <td>{task.client || `לקוח ${task.clientId}`}</td>
                                <td>{task.assignedTo}</td>
                                <td><button className="btn btn-outline-success btn-sm" onClick={() => markTaskCompleted(task)}>סמן כבוצע</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                <h3 style={{ margin: '2rem 0 1rem', textAlign: 'center' }}>משימות שבוצעו:</h3>
                {filteredCompleted.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>אין משימות שבוצעו</p>
                ) : (
                    <table className="table table-bordered text-center">
                        <thead>
                        <tr>
                            <th>#</th>
                            {!topHas ? renderHeader('שם משימה', 'title', titleOpts) : renderPlain('שם משימה')}
                            {!topHas ? renderHeader('לקוח', 'client', clientOpts) : renderPlain('לקוח')}
                            {!topHas ? renderHeader('מי מבצע', 'assignedTo', workerOpts) : renderPlain('מי ביצע')}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCompleted.map((task, idx) => (
                            <tr key={task.id || idx}>
                                <td>{idx + 1}</td>
                                <td>{task.title || `משימה ${task.taskId}`}</td>
                                <td>{task.client || `לקוח ${task.clientId}`}</td>
                                <td>{task.assignedTo}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
