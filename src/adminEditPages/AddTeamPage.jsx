// src/components/AddTeamPage.jsx
import React, { Component } from 'react';
import Select from 'react-select';
import '../CssFiles/page-layout.css';  // מייבא את עיצוב התבנית
import { SERVER_URL } from '../Utils/Constants.jsx';

export default class AddTeamPage extends Component {
    state = {
        teamName: '',
        teamLeader: null,
        memberSelections: [{ id: 1, selectedWorker: null }],
        workers: []
    };

    async componentDidMount() {
        try {
            const res = await fetch(`${SERVER_URL}/eligible-workers`);
            const data = await res.json();
            this.setState({ workers: data });
        } catch (err) {
            console.error('שגיאה בטעינת עובדים:', err);
        }
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleTeamLeaderChange = selected => {
        const selectedUsername = selected?.value;
        const filteredMembers = this.state.memberSelections.filter(
            ms => ms.selectedWorker?.value !== selectedUsername
        );
        this.setState({
            teamLeader: selected,
            memberSelections:
                filteredMembers.length > 0
                    ? filteredMembers
                    : [{ id: 1, selectedWorker: null }]
        });
    };

    handleAddMemberField = () => {
        const last = this.state.memberSelections.at(-1);
        if (!last || !last.selectedWorker) return;
        this.setState(prev => ({
            memberSelections: [
                ...prev.memberSelections,
                { id: prev.memberSelections.length + 1, selectedWorker: null }
            ]
        }));
    };

    handleMemberChange = (index, selectedWorker) => {
        const updated = [...this.state.memberSelections];
        updated[index].selectedWorker = selectedWorker;
        this.setState({ memberSelections: updated });
    };

    handleRemoveMemberField = index => {
        this.setState(prev => ({
            memberSelections: prev.memberSelections.filter((_, i) => i !== index)
        }));
    };

    getAvailableOptions = excludeList =>
        this.state.workers
            .filter(w => !excludeList.includes(w.username))
            .map(w => ({
                value: w.username,
                label: `${w.username} (צוות ${w.teamId})`
            }));

    handleCreateTeam = async () => {
        const { teamName, teamLeader, memberSelections } = this.state;
        if (!teamName || !teamLeader) {
            return alert('נא למלא שם צוות ולבחור ראש צוות');
        }
        const memberUsernames = memberSelections
            .map(ms => ms.selectedWorker?.value)
            .filter(Boolean);
        try {
            const resp = await fetch(`${SERVER_URL}/create-team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    name: teamName,
                    leaderUsername: teamLeader.value,
                    memberUsernames
                })
            });
            const data = await resp.json();
            if (data.success) {
                alert('צוות נוצר בהצלחה!');
                this.setState({
                    teamName: '',
                    teamLeader: null,
                    memberSelections: [{ id: 1, selectedWorker: null }]
                });
                this.componentDidMount();
            } else {
                alert(data.message || 'שגיאה ביצירת צוות');
            }
        } catch (err) {
            console.error('שגיאה ביצירת צוות:', err);
            alert('שגיאה בפנייה לשרת');
        }
    };

    render() {
        const { teamName, teamLeader, memberSelections } = this.state;
        const canRemove = memberSelections.length > 1;

        // אופציות לראש צוות (כל אחד שלא נבחר עדיין)
        const leaderOpts = this.getAvailableOptions([]);

        return (
            <div className="page-container" dir="rtl">
                <h2 className="page-header">יצירת צוות חדש</h2>

                <div className="form-section">
                    <label>שם הצוות:</label>
                    <input
                        type="text"
                        name="teamName"
                        value={teamName}
                        onChange={this.handleChange}
                        className="form-control"
                        placeholder="הכנס שם צוות"
                    />
                </div>

                <div className="form-section">
                    <label>ראש צוות:</label>
                    <Select
                        options={leaderOpts}
                        value={teamLeader}
                        onChange={this.handleTeamLeaderChange}
                        placeholder="בחר ראש צוות..."
                    />
                </div>

                <div className="form-section">
                    <label>חברי צוות:</label>
                    {memberSelections.map((field, idx) => {
                        const excluded = [
                            teamLeader?.value,
                            ...memberSelections
                                .filter((_, i) => i !== idx)
                                .map(ms => ms.selectedWorker?.value)
                        ].filter(Boolean);
                        const memberOpts = this.getAvailableOptions(excluded);
                        return (
                            <div key={field.id} className="member-row">
                                <Select
                                    options={memberOpts}
                                    value={field.selectedWorker}
                                    onChange={opt => this.handleMemberChange(idx, opt)}
                                    placeholder="בחר עובד..."
                                    className="flex-grow-1"
                                />
                                {canRemove && (
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => this.handleRemoveMemberField(idx)}
                                    >
                                        ×
                                    </button>
                                )}
                                {idx === memberSelections.length - 1 &&
                                    field.selectedWorker && (
                                        <button
                                            className="btn btn-outline-success btn-sm"
                                            onClick={this.handleAddMemberField}
                                        >
                                            ＋
                                        </button>
                                    )}
                            </div>
                        );
                    })}
                </div>

                <div className="actions-row">
                    <button className="btn-save" onClick={this.handleCreateTeam}>
                        צור צוות
                    </button>
                </div>
            </div>
        );
    }
}
