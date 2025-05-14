import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';
import { UserContext } from '../context/UserContext';
import { AppDataContext } from '../context/AppDataContext';

function TaskAssignmentPage() {
    const { user, addTask } = useContext(UserContext);
    const { workers, setWorkers, tasks, clients } = useContext(AppDataContext);

    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedWorker, setSelectedWorker] = useState('');
    const [availableWorkers, setAvailableWorkers] = useState([]);
    const [customHours, setCustomHours] = useState('');

    // עדכון שעות ברירת מחדל כשבוחרים משימה
    useEffect(() => {
        const task = tasks.find(t => t.id === +selectedTaskId);
        if (task) setCustomHours(task.avgHours);
        else {
            setCustomHours('');
            setAvailableWorkers([]);
            setSelectedWorker('');
        }
    }, [selectedTaskId, tasks]);

    if (!user) return <div>טוען נתוני משתמש...</div>;
    if (user.role !== 'admin') return <h2>עמוד זה פתוח רק לאדמין</h2>;

    // הכנת ערכי Select (null מפעיל פלייסהולדר)
    const selectedTaskOption = (() => {
        const t = tasks.find(t => t.id === +selectedTaskId);
        return t ? { value: t.id, label: t.name } : null;
    })();
    const selectedClientOption = (() => {
        const c = clients.find(c => c.id === +selectedClientId);
        return c ? { value: c.id, label: c.name } : null;
    })();
    const selectedWorkerOption = (() => {
        const w = availableWorkers.find(w => w.username === selectedWorker);
        return w
            ? { value: w.username, label: w.username }
            : null;
    })();

    const handleFindWorkers = () => {
        const task = tasks.find(t => t.id === +selectedTaskId);
        const client = clients.find(c => c.id === +selectedClientId);
        if (!task || !client) {
            alert('יש לבחור גם משימה וגם לקוח');
            return;
        }

        const required = task.requires || [];
        const canDo = w => required.every(r => w.abilities.includes(r));
        const manager = workers.find(w => w.username === client.defaultManager);
        const teamMems = workers.filter(w => w.team === manager?.team);
        const notTeam = workers.filter(w => w.team !== manager?.team);

        const buildGroup = (list, isSameTeam, capability) =>
            list
                .filter(w => canDo(w) === capability)
                .sort((a, b) => a.hoursWorked - b.hoursWorked)
                .map(w => ({
                    ...w,
                    isManager: w.username === manager?.username,
                    isSameTeam,
                    isCapable: capability
                }));

        const group2 = buildGroup(teamMems, true, true);
        const group3 = buildGroup(teamMems, true, false);
        const group4 = buildGroup(notTeam, false, true);
        const group5 = buildGroup(notTeam, false, false);

        const sorted = [];
        if (manager && canDo(manager)) {
            sorted.push({
                ...manager,
                isManager: true,
                isSameTeam: false,
                isCapable: true
            });
            sorted.push(...group2.filter(w => w.username !== manager.username));
        } else {
            sorted.push(...group2);
        }
        sorted.push(...group3, ...group4, ...group5);

        setAvailableWorkers(sorted);
        setSelectedWorker(sorted[0]?.username || '');
    };

    const handleAssignTask = () => {
        const task = tasks.find(t => t.id === +selectedTaskId);
        const client = clients.find(c => c.id === +selectedClientId);
        const hours = parseFloat(customHours) || 0;
        if (!task || !client || !selectedWorker) {
            alert('חסר מידע');
            return;
        }

        const updated = workers.map(w =>
            w.username === selectedWorker
                ? { ...w, hoursWorked: w.hoursWorked + hours }
                : w
        );
        setWorkers(updated);

        addTask({
            taskId: task.id,
            title: task.name,
            clientId: client.id,
            client: client.name,
            assignedTo: selectedWorker,
            hoursRequired: hours
        });

        alert('המשימה נוספה בהצלחה');
        // ניקוי כל השדות בחזרה לברירת מחדל
        setSelectedTaskId('');
        setSelectedClientId('');
        setSelectedWorker('');
        setCustomHours('');
        setAvailableWorkers([]);
    };

    return (
        <div style={{ padding: '2rem' }} dir="rtl">
            <h2>סידור משימה</h2>

            <div className="mb-3">
                <label>בחר משימה:</label>
                <Select
                    options={tasks.map(t => ({ value: t.id, label: t.name }))}
                    value={selectedTaskOption}
                    onChange={e => setSelectedTaskId(e?.value || '')}
                    placeholder="בחר משימה..."
                />
            </div>

            <div className="mb-3">
                <label>בחר לקוח:</label>
                <Select
                    options={clients.map(c => ({ value: c.id, label: c.name }))}
                    value={selectedClientOption}
                    onChange={e => setSelectedClientId(e?.value || '')}
                    placeholder="בחר לקוח..."
                />
            </div>

            <button className="btn btn-primary" onClick={handleFindWorkers}>
                מצא עובדים מתאימים
            </button>

            {availableWorkers.length > 0 && (
                <>
                    <div className="mt-4">
                        <label>בחר עובד:</label>
                        <Select
                            options={availableWorkers.map(w => ({
                                value: w.username,
                                label: `${w.username} (${w.isManager ? 'מנהל לקוח' : w.isSameTeam ? 'חבר צוות' : 'לא חבר צוות'} | ${w.isCapable ? 'מתאים' : 'לא מתאים'} | ${w.hoursWorked} שעות)`
                            }))}
                            value={selectedWorkerOption}
                            onChange={e => setSelectedWorker(e?.value || '')}
                            placeholder="בחר עובד..."
                        />
                    </div>

                    <div className="mt-3">
                        <label>שעות משוער (ברירת מחדל {customHours}):</label>
                        <input
                            type="number"
                            className="form-control"
                            value={customHours}
                            onChange={e => setCustomHours(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-success mt-3" onClick={handleAssignTask}>
                        הוסף משימה
                    </button>
                </>
            )}
        </div>
    );
}

export default TaskAssignmentPage;
