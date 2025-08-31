// src/pages/AdminEditPage.jsx
import React, { Component } from 'react';
import AddWorkerPage from "../adminEditPages/AddWorkerPage.jsx";
import AddClientPage from "../adminEditPages/AddClientPage.jsx";
import AddTeamPage from "../adminEditPages/AddTeamPage.jsx";
import EditWorkersPage from "../adminEditPages/EditWorkersPage.jsx";
import AbilityEditPage from "../adminEditPages/AbilityEditPage.jsx";
import TaskCreationPage from "../adminEditPages/TaskCreationPage.jsx";
import EditClientsPage from "../adminEditPages/EditClientsPage.jsx";
import EditTasksPage from "../adminEditPages/EditTasksPage.jsx";
import EditTeamsPage from "../adminEditPages/EditTeamsPage.jsx";

class AdminEditPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: null,
            options: [
                { value: 'addUser', label: 'הוספת עובד חדש' },
                { value: 'addClient', label: 'הוספת לקוח חדש' },
                { value: 'createNewTeam', label: 'יצירת צוות חדש' },
                { value: 'createNewTask', label: 'יצירת משימה חדשה' },
                { value: 'createAbilities', label: 'עריכת יכולות' },
                { value: 'editWorkers', label: 'עריכת עובדים' },
                { value: 'editClients', label: 'עריכת לקוחות קיימים' },
                { value: 'editTeams', label: 'עריכת צוותים' },
                { value: 'editTasks', label: 'עריכת משימות' },
            ],
        };
    }

    renderSelectedSection() {
        const { selectedOption } = this.state;
        switch (selectedOption?.value) {
            case 'addUser':
                return <AddWorkerPage />;
            case 'addClient':
                return <AddClientPage />;
            case 'createAbilities':
                return <AbilityEditPage />;
            case 'createNewTeam':
                return <AddTeamPage />;
            case 'createNewTask':
                return <TaskCreationPage />;
            case 'editWorkers':
                return <EditWorkersPage />;
            case 'editClients':
                return <EditClientsPage />;
            case 'editTeams':
                return <EditTeamsPage />;
            case 'editTasks':
                return <EditTasksPage />;
            default:
                return <div>בחר פעולה מהתפריט הימני</div>;
        }
    }

    render() {
        const { selectedOption, options } = this.state;

        return (
            <div style={{ display: 'flex', direction: 'rtl', height: '100vh' }}>
                {/* Sidebar */}
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        alignSelf: 'flex-start',
                        width: '220px',
                        background: '#f8f9fa',
                        borderLeft: '1px solid #ddd',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        height: '100vh',
                    }}
                >
                    <h5 style={{ marginBottom: '1rem' }}>ניהול מערכת</h5>
                    {options.map(option => (
                        <button
                            key={option.value}
                            className={`btn ${selectedOption?.value === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => this.setState({ selectedOption: option })}
                            style={{ textAlign: 'right' }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {this.renderSelectedSection()}
                </div>
            </div>
        );
    }
}

export default AdminEditPage;
