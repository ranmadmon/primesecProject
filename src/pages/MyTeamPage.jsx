import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AppDataContext } from '../context/AppDataContext';

export default function MyTeamPage() {
    const { user } = useContext(UserContext);
    const { workers, clients } = useContext(AppDataContext);
    const [selectedMember, setSelectedMember] = useState(null);

    // Only team leaders can view this page
    if (!user || user.role !== 'teamLeader') {
        return <h2 style={{ textAlign: 'center' }}>עמוד זה פתוח רק לראש צוות</h2>;
    }

    // Find user's team
    const me = workers.find(w => w.username === user.username) || {};
    const myTeamId = me.team;

    // Team members list
    const teamMembers = workers.filter(w => w.team === myTeamId);

    // On member click, load details
    const handleSelect = member => setSelectedMember(member);

    // Compute selected member details
    const memberClients = selectedMember
        ? clients.filter(c => c.defaultManager === selectedMember.username)
        : [];

    return (
        <div className="my-team-page" dir="rtl" style={{ padding: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>הצוות שלי</h2>
            <div className="team-container" style={{ display: 'flex', gap: '1rem' }}>
                <ul className="list-group" style={{ flex: 1, maxWidth: '250px' }}>
                    {teamMembers.map(member => (
                        <li
                            key={member.username}
                            className={`list-group-item ${selectedMember?.username === member.username ? 'active' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSelect(member)}
                        >
                            {member.username}
                        </li>
                    ))}
                </ul>

                {selectedMember && (
                    <div className="member-details" style={{ flex: 2 }}>
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title">{selectedMember.username}</h3>
                                <p><strong>שעות עבודה:</strong> {selectedMember.hoursWorked} שעות</p>
                                <p><strong>לקוחות מנוהלים:</strong></p>
                                {memberClients.length > 0 ? (
                                    <ul>
                                        {memberClients.map(c => <li key={c.id}>{c.name}</li>)}
                                    </ul>
                                ) : (
                                    <p>אין לקוחות מנוהלים</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}