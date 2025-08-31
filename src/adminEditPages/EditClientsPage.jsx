// src/pages/EditClientsPage.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'universal-cookie';
import '../CssFiles/page-layout.css';   // <-- כאן העיצוב המשותף
import { SERVER_URL } from '../Utils/Constants.jsx';

export default function EditClientsPage() {
    const cookies = new Cookies();
    const token   = cookies.get('token');

    const [clients,            setClients]            = useState([]);
    const [workers,            setWorkers]            = useState([]);
    const [loading,            setLoading]            = useState(true);

    const [selectedClient,     setSelectedClient]     = useState(null);
    const [name,               setName]               = useState('');
    const [originalManager,    setOriginalManager]    = useState(null);
    const [managerSelectValue, setManagerSelectValue] = useState(null);
    const [saving,             setSaving]             = useState(false);
    const [deleting,           setDeleting]           = useState(false);

    // 1. Load clients + workers
    useEffect(() => {
        async function fetchData() {
            try {
                const [cRes, wRes] = await Promise.all([
                    axios.get(`${SERVER_URL}/clients`, { params: { token } }),
                    axios.get(`${SERVER_URL}/workers`, { params: { token } })
                ]);
                setClients(cRes.data);
                setWorkers(wRes.data);
            } catch (err) {
                console.error(err);
                alert('שגיאה בטעינת נתונים');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    // 2. When select changes, init fields
    useEffect(() => {
        if (!selectedClient) {
            setName('');
            setOriginalManager(null);
            setManagerSelectValue(null);
            return;
        }
        const c = clients.find(x => x.id === selectedClient.value);
        setName(c.name);
        setOriginalManager(c.managerUsername);
        setManagerSelectValue(
            c.managerUsername
                ? { value: c.managerUsername, label: c.managerUsername }
                : null
        );
    }, [selectedClient, clients]);

    if (loading) return <p>טוען…</p>;
    if (!token)  return <h2>אנא התחבר מחדש</h2>;

    const clientOptions  = clients.map(c => ({ value: c.id,       label: c.name }));
    const managerOptions = workers.map(w => ({ value: w.username, label: w.username }));

    // 3. Save (updateClient)
    const handleSave = async () => {
        if (!selectedClient)       return alert('בחר לקוח קודם');
        if (!name.trim())          return alert('יש להזין שם לקוח');
        if (!managerSelectValue)   return alert('יש לבחור מנהל');

        setSaving(true);
        try {
            await axios.post(
                `${SERVER_URL}/clients/update`,
                null,
                { params: {
                        token,
                        clientId:   selectedClient.value,
                        name:       name.trim(),
                        managerId:  managerSelectValue.value
                    }}
            );
            // עדכון מקומי:
            setClients(cs =>
                cs.map(c =>
                    c.id === selectedClient.value
                        ? {
                            ...c,
                            name:            name.trim(),
                            managerUsername: managerSelectValue.label,
                            managerId:       managerSelectValue.value
                        }
                        : c
                )
            );
            alert('הלקוח עודכן בהצלחה');
        } catch (err) {
            console.error(err);
            alert('שגיאה בעדכון הלקוח');
        } finally {
            setSaving(false);
        }
    };

    // 4. Delete (deleteClient)
    const handleDelete = async () => {
        if (!selectedClient) return alert('בחר לקוח למחיקה');
        const c = clients.find(x => x.id === selectedClient.value);
        if (!window.confirm(`למחוק את הלקוח "${c.name}"?`)) return;

        setDeleting(true);
        try {
            const res = await axios.post(
                `${SERVER_URL}/deleteClient`,
                null,
                { params: { token, clientId: selectedClient.value } }
            );
            if (res.status >= 200 && res.status < 300) {
                setClients(cs => cs.filter(x => x.id !== selectedClient.value));
                setSelectedClient(null);
                alert('הלקוח נמחק בהצלחה');
            } else {
                throw new Error('Unexpected status ' + res.status);
            }
        } catch (err) {
            console.error(err);
            alert('שגיאה במחיקת הלקוח');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="page-container" dir="rtl">
            <h2 className="page-header">עריכת לקוחות</h2>

            <div className="form-section">
                <label>בחר לקוח:</label>
                <Select
                    options={clientOptions}
                    value={selectedClient}
                    onChange={setSelectedClient}
                    placeholder="בחר לקוח..."
                    isDisabled={saving || deleting}
                />
            </div>

            {selectedClient && (
                <>
                    <div className="form-section">
                        <label>שם לקוח:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={saving || deleting}
                        />
                    </div>

                    <div className="form-section">
                        <label>מנהל נוכחי:</label>
                        <span className="ms-2">{originalManager || 'לא נקבע'}</span>
                    </div>

                    <div className="form-section">
                        <label>שנה מנהל לקוח:</label>
                        <Select
                            options={managerOptions}
                            value={managerSelectValue}
                            onChange={setManagerSelectValue}
                            placeholder="בחר מנהל חדש..."
                            isDisabled={saving || deleting}
                        />
                    </div>

                    <div className="actions-row">
                        <button
                            className="btn-delete"
                            onClick={handleDelete}
                            disabled={saving || deleting}
                        >
                            {deleting ? 'מוחק…' : 'מחק לקוח'}
                        </button>
                        <button
                            className="btn-save"
                            onClick={handleSave}
                            disabled={saving || deleting}
                        >
                            {saving ? 'שומר…' : 'שמור שינויים'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
