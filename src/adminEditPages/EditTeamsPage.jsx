import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'universal-cookie';
import '../CssFiles/page-layout.css';
import { SERVER_URL } from '../Utils/Constants.jsx';

export default function EditTeamsPage() {
    const cookies = new Cookies();
    const token = cookies.get('token');

    const [teams, setTeams]               = useState([]);
    const [selectedTeamId, setSelectedId] = useState(null);
    const [detail, setDetail]             = useState(null);
    const [newMember, setNewMember]       = useState(null);
    const [newLeader, setNewLeader]       = useState(null);

    // 1. Load list of teams
    useEffect(() => {
        axios.get(`${SERVER_URL}/teams`, { params: { token } })
            .then(r => setTeams(r.data))
            .catch(console.error);
    }, [token]);

    // 2. Load team detail
    useEffect(() => {
        if (!selectedTeamId) {
            setDetail(null);
            return;
        }
        axios.get(`${SERVER_URL}/teams/${selectedTeamId}`, { params: { token } })
            .then(r => setDetail(r.data))
            .catch(console.error);
    }, [selectedTeamId, token]);

    if (!token) return <h2>אנא התחבר</h2>;

    const teamOptions = teams.map(t => ({ value: t.id, label: t.name }));

    const addMemberOpts = detail
        ? detail.availableWorkers
            .filter(u =>
                (u.roleId === 1 || u.roleId === 3)
                && !detail.memberUsernames.includes(u.username)
            )
            .map(u => ({ value: u.username, label: u.username }))
        : [];

    const leaderOpts = detail
        ? detail.availableWorkers
            .filter(u => u.username !== detail.leaderUsername)
            .map(u => ({
                value: u.username,
                label: `${u.username} (${
                    (u.roleId === 1 || u.roleId === 3)
                        ? 'עובד רגיל'
                        : `ראש צוות בקבוצה ${u.teamId}`
                })`
            }))
        : [];

    const handleAddMember = () => {
        if (!newMember || !selectedTeamId) return alert('יש לבחור עובד וצוות');
        axios.post(
            `${SERVER_URL}/teams/${selectedTeamId}/members`,
            null,
            { params: { token, username: newMember.value } }
        ).then(() => {
            setDetail(d => ({
                ...d,
                memberUsernames: [...d.memberUsernames, newMember.value]
            }));
            setNewMember(null);
            alert('העובד שויך לצוות בהצלחה');
        }).catch(err => {
            console.error(err);
            alert('שגיאה בשיוך עובד לצוות');
        });
    };

    const handleChangeLeader = () => {
        if (!newLeader) return alert('יש לבחור ראש צוות חדש');
        const confirmMsg = `ראשי הצוות ("${detail.leaderUsername}" ו־"${newLeader.value}") יוחלפו. להמשיך?`;
        if (!window.confirm(confirmMsg)) return;

        axios.post(
            `${SERVER_URL}/teams/${selectedTeamId}/leader`,
            null,
            { params: { token, newLeaderUsername: newLeader.value } }
        ).then(() => {
            setDetail(d => ({ ...d, leaderUsername: newLeader.value }));
            setNewLeader(null);
            alert('ראש הצוות עודכן');
        }).catch(err => {
            console.error(err);
            alert('שגיאה בעדכון ראש צוות');
        });
    };

    const handleDeleteTeam = () => {
        if (!detail || detail.memberUsernames.length > 0) {
            return alert('לא ניתן למחוק צוות עם עובדים');
        }
        if (!window.confirm(`למחוק את "${detail.name}"?`)) return;
        axios.delete(
            `${SERVER_URL}/teams/${selectedTeamId}`,
            { params: { token } }
        ).then(() => {
            setTeams(ts => ts.filter(t => t.id !== selectedTeamId));
            setSelectedId(null);
            alert('הצוות נמחק');
        }).catch(err => {
            console.error(err);
            alert('שגיאה במחיקת צוות');
        });
    };

    return (
        <div className="page-container" dir="rtl">
            <h2 className="page-header">עריכת צוות</h2>

            <div className="form-section">
                <label>בחר צוות:</label>
                <Select
                    options={teamOptions}
                    value={teamOptions.find(o => o.value === selectedTeamId)}
                    onChange={o => setSelectedId(o.value)}
                    placeholder="בחר..."
                />
            </div>

            {detail && (
                <>
                    <div className="form-section">
                        <label>ראש צוות נוכחי:</label>
                        <input
                            className="form-control"
                            value={detail.leaderUsername}
                            readOnly
                        />
                    </div>

                    <div className="form-section">
                        <label>בחר ראש צוות חדש:</label>
                        <Select
                            options={leaderOpts}
                            value={newLeader}
                            onChange={setNewLeader}
                            placeholder="ראש צוות..."
                        />
                        <div className="actions-row">
                            <button
                                className="btn-save"
                                onClick={handleChangeLeader}
                            >
                                אשר החלפת ראש צוות
                            </button>
                        </div>
                    </div>

                    <div className="form-section">
                        <label>חברי צוות:</label>
                        <ul>
                            {detail.memberUsernames.map(u => (
                                <li key={u}>{u}</li>
                            ))}
                        </ul>
                    </div>

                    <hr />
                    <div className="form-section">
                        <label>שייך עובד רגיל לצוות:</label>
                        <Select
                            options={addMemberOpts}
                            value={newMember}
                            onChange={setNewMember}
                            placeholder="בחר עובד רגיל..."
                        />
                        <div className="actions-row">
                            <button
                                className="btn-save"
                                onClick={handleAddMember}
                            >
                                שייך לצוות
                            </button>
                        </div>
                    </div>

                    <div className="actions-row">
                        <button className="btn-delete" onClick={handleDeleteTeam}>
                            מחק צוות (ריק בלבד)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
