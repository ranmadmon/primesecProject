import React, { useState, useContext } from 'react';
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

    if (!user) return <div>טוען נתוני משתמש...</div>;
    if (user.role !== 'admin') return <h2>עמוד זה פתוח רק לאדמין</h2>;

    const handleFindWorkers = () => {
        const task = tasks.find(t => t.id === parseInt(selectedTaskId));
        const client = clients.find(c => c.id === parseInt(selectedClientId));
        if (!task || !client) return alert('יש לבחור גם משימה וגם לקוח');

        const requiredAbilities = task.requires;
        const defaultManager = workers.find(w => w.username === client.defaultManager);
        const hasAbilities = (w) => requiredAbilities.every(req => w.abilities.includes(req));

        const sorted = workers
            .map(w => {
                const isManager = w.username === defaultManager.username;
                const isSameTeam = w.team === defaultManager.team && !isManager;
                const isCapable = hasAbilities(w);
                let rank = 4;
                if (isManager && isCapable) rank = 1;
                else if (isSameTeam && isCapable) rank = 2;
                else if (isCapable) rank = 3;
                return { ...w, isManager, isSameTeam, isCapable, rank };
            })
            .sort((a, b) => a.rank - b.rank || a.hoursWorked - b.hoursWorked);

        setAvailableWorkers(sorted);
        setSelectedWorker(sorted[0]?.username || '');
    };

    const handleAssignTask = () => {
        const task = tasks.find(t => t.id === parseInt(selectedTaskId));
        const client = clients.find(c => c.id === parseInt(selectedClientId));
        if (!task || !client || !selectedWorker) return alert('חסר מידע');

        const updatedWorkers = workers.map(w =>
            w.username === selectedWorker
                ? { ...w, hoursWorked: w.hoursWorked + task.avgHours }
                : w
        );

        setWorkers(updatedWorkers);

        addTask({
            taskId: task.id,
            title: task.name,
            clientId: client.id,
            client: client.name,
            assignedTo: selectedWorker,
        });

        alert('המשימה נוספה בהצלחה');
        setSelectedTaskId('');
        setSelectedClientId('');
        setSelectedWorker('');
        setAvailableWorkers([]);
    };

    return (
        <div style={{ padding: '2rem' }} dir="rtl">
            <h2>סידור משימה</h2>

            <div className="mb-3">
                <label>בחר משימה:</label>
                <Select
                    options={tasks.map(t => ({ value: t.id, label: t.name }))}
                    value={tasks.find(t => t.id === parseInt(selectedTaskId)) ?
                        { value: selectedTaskId, label: tasks.find(t => t.id === parseInt(selectedTaskId)).name } : null}
                    onChange={(e) => setSelectedTaskId(e?.value || '')}
                    placeholder="בחר משימה..."
                />
            </div>

            <div className="mb-3">
                <label>בחר לקוח:</label>
                <Select
                    options={clients.map(c => ({ value: c.id, label: c.name }))}
                    value={clients.find(c => c.id === parseInt(selectedClientId)) ?
                        { value: selectedClientId, label: clients.find(c => c.id === parseInt(selectedClientId)).name } : null}
                    onChange={(e) => setSelectedClientId(e?.value || '')}
                    placeholder="בחר לקוח..."
                />
            </div>

            <button className="btn btn-primary" onClick={handleFindWorkers}>מצא עובדים מתאימים</button>

            {availableWorkers.length > 0 && (
                <>
                    <div className="mt-4">
                        <label>בחר עובד:</label>
                        <Select
                            options={availableWorkers.map(w => ({
                                value: w.username,
                                label: `${w.username} (${[
                                    w.isCapable ? 'מתאים' : 'לא מתאים',
                                    w.isManager ? 'מנהל לקוח' : w.isSameTeam ? 'חבר צוות' : '',
                                    `${w.hoursWorked} שעות`
                                ].filter(Boolean).join(' | ')})`
                            }))}
                            value={selectedWorker ? { value: selectedWorker, label: selectedWorker } : null}
                            onChange={(e) => setSelectedWorker(e?.value || '')}
                            placeholder="בחר עובד..."
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
