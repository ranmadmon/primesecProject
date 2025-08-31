import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Card from '../pages/Card.jsx';
import '../CssFiles/EditWorkersPage.css';

export default function EditWorkersPage() {
    const [workers, setWorkers] = useState([]);
    const [abilities, setAbilities] = useState([]);
    const [clients, setClients] = useState([]);

    const [eligible, setEligible] = useState([]);           // עובדים כשירים לניהול לקוחות (role 1/3, Active)
    const [currentUser, setCurrentUser] = useState(null);   // שם המשתמש המחובר

    const [selectedWorker, setSelectedWorker] = useState(null);
    const [selectedAbilities, setSelectedAbilities] = useState([]);

    const [managedClientIds, setManagedClientIds] = useState([]);
    const [availableClientIds, setAvailableClientIds] = useState([]);

    const [clientModal, setClientModal] = useState(null); // 'add' או clientId
    const [modalValue, setModalValue] = useState(null);

    const [makeAdmin, setMakeAdmin] = useState(false);     // ✅ חדש – קידום לאדמין
    const [loading, setLoading] = useState(false);

    const token = new Cookies().get('token');

    // ------- Helpers to server --------
    const api = axios.create({ baseURL: 'http://localhost:8080' });

    const fetchData = useCallback(async () => {
        if (!token) return;
        try {
            const [wRes, aRes, cRes] = await Promise.all([
                api.get('/workers'),
                api.get('/abilities'),
                api.get('/clients'),
            ]);
            setWorkers(wRes.data || []);
            setAbilities((aRes.data || []).map(a => (typeof a === 'string' ? a : a.name)));
            setClients(cRes.data || []);
        } catch (err) {
            console.error('טעינת נתונים נכשלה', err);
            alert('שגיאה בטעינת נתונים מהשרת');
        }
    }, [token]);

    const fetchCurrentUser = useCallback(async () => {
        if (!token) return;
        try {
            const r = await api.get('/get-username-by-token', { params: { token } });
            setCurrentUser(r.data || null);
        } catch {
            setCurrentUser(null);
        }
    }, [token]);

    const fetchEligible = useCallback(async () => {
        if (!token) return;
        try {
            const r = await api.get('/eligible-workers', { params: { token } });
            setEligible(r.data || []);
        } catch {
            setEligible([]);
        }
    }, [token]);

    // ------- Effects --------
    useEffect(() => {
        fetchData();
        fetchCurrentUser();
        fetchEligible();
    }, [fetchData, fetchCurrentUser, fetchEligible]);

    // ------- Select options --------
    const workerOpts = useMemo(
        () => workers.map(w => ({ value: w.username, label: w.username })),
        [workers]
    );

    const abilityOpts = useMemo(
        () => abilities.map(a => ({ value: a, label: a })),
        [abilities]
    );

    const clientOpts = useMemo(
        () => clients.map(c => ({ value: c.id, label: c.name })),
        [clients]
    );

    const eligibleOpts = useMemo(
        () => eligible.map(e => ({ value: e.username, label: e.username })),
        [eligible]
    );

    // ------- Handlers --------
    const handleWorkerChange = opt => {
        setSelectedWorker(opt);
        const w = workers.find(x => x.username === opt.value);
        setSelectedAbilities(w?.abilities || []);

        const managed = clients
            .filter(c => c.managerUsername === w?.username)
            .map(c => c.id);

        const available = clients
            .filter(c => !managed.includes(c.id))
            .map(c => c.id);

        setManagedClientIds(managed);
        setAvailableClientIds(available);

        setClientModal(null);
        setModalValue(null);
        setMakeAdmin(false); // אתחול ברירת מחדל בכל בחירת עובד חדשה
    };

    const handleAbilitiesChange = opts => {
        setSelectedAbilities((opts || []).map(o => o.value));
    };

    // מודל לקוחות
    const openAddClient = () => {
        if (availableClientIds.length === 0) {
            alert('אין לקוחות זמינים להוספה');
            return;
        }
        setClientModal('add');
        setModalValue(null);
    };
    const openReassignClient = id => {
        setClientModal(id);
        setModalValue(null);
    };
    const closeModal = () => {
        setClientModal(null);
        setModalValue(null);
    };
    const handleModalChange = opt => setModalValue(opt);

    const handleModalConfirm = async () => {
        if (!modalValue) return alert('בחר פריט לפני אישור');

        const clientId = clientModal === 'add' ? modalValue.value : clientModal;
        const managerUsername =
            clientModal === 'add' ? selectedWorker.value : modalValue.value;

        const client = clients.find(c => c.id === clientId);
        if (!client) {
            return alert('לא נמצא לקוח מתאים');
        }

        try {
            setLoading(true);
            const { data } = await api.post(
                '/clients/update-by-username',
                null,
                { params: { token, clientId, name: client.name, managerUsername } }
            );

            if (!data?.success) {
                return alert(data?.message || 'שגיאה בעדכון מנהל הלקוח');
            }

            await fetchData();
            closeModal();
        } catch (err) {
            console.error('שגיאה בעדכון מנהל הלקוח', err);
            alert('שגיאה בעדכון מנהל הלקוח');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedWorker) return alert('בחר עובד לפני שמירה');
        const worker = workers.find(w => w.username === selectedWorker.value);
        if (!worker) return alert('עובד לא נמצא');

        try {
            setLoading(true);
            const { data } = await api.post(
                '/update-worker',
                {
                    username: selectedWorker.value,
                    abilities: selectedAbilities,
                    teamId: worker.teamId,     // אם השרת מתעלם – זה לא מזיק
                    makeAdmin,                 // ✅ שולח דגל קידום לאדמין (1→3, 2→4)
                },
                { params: { token } }
            );

            if (!data?.success) {
                return alert(data?.message || 'שמירה נכשלה');
            }

            alert('השינויים נשמרו בהצלחה!');
            await fetchData();

            setSelectedWorker(null);
            setSelectedAbilities([]);
            setManagedClientIds([]);
            setAvailableClientIds([]);
            setMakeAdmin(false);
        } catch (err) {
            console.error('שגיאה בשמירת השינויים', err);
            alert('שגיאה בשמירת השינויים');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWorker = async () => {
        if (!selectedWorker) return alert('בחר עובד לפני מחיקה');

        // מחיקה עצמית — חסימה בצד לקוח (בנוסף לשרת)
        if (currentUser && selectedWorker.value === currentUser) {
            return alert('אי אפשר למחוק את המשתמש המחובר');
        }

        if (managedClientIds.length) {
            return alert('יש להעביר קודם את הלקוחות שלו לעובד אחר');
        }

        if (!window.confirm(`למחוק את העובד "${selectedWorker.value}"?`)) return;

        try {
            setLoading(true);
            const { data } = await api.delete('/delete-worker', {
                params: { token, username: selectedWorker.value },
            });

            if (!data?.success) {
                return alert(data?.message || 'מחיקה נכשלה');
            }

            alert('העובד נמחק בהצלחה');
            await fetchData();

            setSelectedWorker(null);
            setSelectedAbilities([]);
            setManagedClientIds([]);
            setAvailableClientIds([]);
            setMakeAdmin(false);
        } catch (err) {
            console.error('שגיאה במחיקת העובד', err);
            alert('שגיאה במחיקת העובד');
        } finally {
            setLoading(false);
        }
    };

    const isSelf = useMemo(
        () => !!(currentUser && selectedWorker && currentUser === selectedWorker.value),
        [currentUser, selectedWorker]
    );

    const selectedRoleId = useMemo(() => {
        if (!selectedWorker) return null;
        const w = workers.find(x => x.username === selectedWorker.value);
        return w?.roleId ?? null; // WorkerDto מחזיר roleId
    }, [selectedWorker, workers]);

    const canPromote = useMemo(() => {
        // ניתן לקדם רק אם התפקיד הנוכחי 1 או 2
        return selectedRoleId === 1 || selectedRoleId === 2;
    }, [selectedRoleId]);

    const roleLabel = (rid) =>
        rid === 1 ? 'עובד'
            : rid === 2 ? 'ראש צוות'
                : rid === 3 ? 'אדמין'
                    : rid === 4 ? 'מנהל־על'
                        : rid ?? '';

    return (
        <div className="edit-workers-page" dir="rtl">
            <h3>עריכת עובד</h3>

            <Select
                options={workerOpts}
                value={selectedWorker}
                onChange={handleWorkerChange}
                placeholder="בחר עובד..."
                isDisabled={loading}
            />

            {selectedWorker && (
                <>
                    <div className="role-row">
                        <small>
                            תפקיד נוכחי: <b>{roleLabel(selectedRoleId)}</b>
                        </small>
                    </div>

                    <Select
                        isMulti
                        options={abilityOpts}
                        value={abilityOpts.filter(o => selectedAbilities.includes(o.value))}
                        onChange={handleAbilitiesChange}
                        placeholder="יכולות נוכחיות..."
                        isDisabled={loading}
                    />

                    {/* ✅ קידום לאדמין */}
                    <div className="admin-toggle">
                        <label>
                            <input
                                type="checkbox"
                                checked={makeAdmin}
                                onChange={e => setMakeAdmin(e.target.checked)}
                                disabled={loading || !canPromote}
                            />
                            {' '}
                            הפוך לאדמין (1→3, 2→4)
                        </label>
                        {!canPromote && (
                            <small className="hint">לא ניתן לקדם תפקידים 3/4</small>
                        )}
                    </div>

                    <section className="clients-section">
                        <h5>לקוחות מנוהלים:</h5>
                        {managedClientIds.length === 0 && (
                            <div className="empty-state">אין לקוחות בניהולו</div>
                        )}
                        {managedClientIds.map(id => (
                            <div key={id} className="client-row">
                                <span>{clients.find(c => c.id === id)?.name || id}</span>
                                <button onClick={() => openReassignClient(id)} disabled={loading}>
                                    החלף מנהל
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={openAddClient}
                            disabled={loading || availableClientIds.length === 0}
                            title={
                                availableClientIds.length === 0
                                    ? 'אין לקוחות זמינים להוספה'
                                    : undefined
                            }
                        >
                            הוסף לקוח
                        </button>
                    </section>

                    <div className="actions-row">
                        <button
                            className="btn-delete"
                            onClick={handleDeleteWorker}
                            disabled={
                                loading ||
                                !selectedWorker ||
                                managedClientIds.length > 0 ||
                                isSelf
                            }
                            title={
                                isSelf
                                    ? 'אי אפשר למחוק את המשתמש המחובר'
                                    : managedClientIds.length > 0
                                        ? 'יש להעביר קודם את הלקוחות שלו לעובד אחר'
                                        : undefined
                            }
                        >
                            {isSelf ? 'אי אפשר למחוק את עצמך' : (loading ? 'מבצע...' : 'מחק עובד')}
                        </button>
                        <button
                            className="btn-save"
                            onClick={handleSave}
                            disabled={loading || !selectedWorker}
                        >
                            {loading ? 'שומר...' : 'שמור שינויים'}
                        </button>
                    </div>

                    {clientModal && (
                        <div className="modal-backdrop">
                            <Card width="400px">
                                <h5>
                                    {clientModal === 'add'
                                        ? 'הוספת לקוח מנוהל'
                                        : `החלפת מנהל עבור ${
                                            clients.find(c => c.id === clientModal)?.name || clientModal
                                        }`}
                                </h5>

                                <Select
                                    options={
                                        clientModal === 'add'
                                            ? clientOpts.filter(o => availableClientIds.includes(o.value))
                                            : eligibleOpts
                                    }
                                    value={modalValue}
                                    onChange={handleModalChange}
                                    placeholder="בחר פריט..."
                                    isDisabled={loading}
                                />

                                <div className="modal-actions">
                                    <button onClick={closeModal} disabled={loading}>בטל</button>
                                    <button onClick={handleModalConfirm} disabled={loading || !modalValue}>
                                        {loading ? 'מעדכן...' : 'אישור'}
                                    </button>
                                </div>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
