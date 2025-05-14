import React, { Component } from 'react';
import AddWorkerPage from "../adminEditPages/AddWorkerPage.jsx";
import { UserContext } from '../context/UserContext'; // או הנתיב הרלוונטי
import AddClientPage from "../adminEditPages/AddClientPage.jsx";
import AddTeamPage from "../adminEditPages/AddTeamPage.jsx";
import EditWorkersPage from "../adminEditPages/EditWorkersPage.jsx";

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
                { value: 'createAbilities', label: 'יצירת יכולות' },
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
                return <div>
                    <AddWorkerPage/>
                </div>;
            case 'addClient':
                return <div>
                    <AddClientPage/>
                </div>;
            case 'createAbilities':
                return <div>
                    פה יוצג עמוד יצירת יכולות
                </div>;
            case 'createNewTeam':
                return <div>
                    <AddTeamPage/>
                </div>;
            case 'createNewTask':
                return <div>
                    כאן תוצג טבלת יצירת משימות
                </div>;
            case 'editWorkers':
                return <div>
                    <EditWorkersPage/>.
                </div>;
            case 'editClients':
                return <div>כאן ניתן לערוך את פרטי הלקוחות או למחוק</div>;
            case 'editTeams':
                return <div>כאן ניתן לערוך צוותים, להעביר עובדים, לשנות מנהלים</div>;
            case 'editTasks':
                return <div>כאן תוצג עריכת המשימות</div>;
            default:
                return <div>בחר פעולה מהתפריט הימני</div>;
        }
    }

    render() {
        const { selectedOption, options } = this.state;

        return (
            <div style={{ display: 'flex', direction: 'rtl', height: '100vh' }}>
                {/* Sidebar */}
                <div style={{
                    width: '220px',
                    background: '#f8f9fa',
                    borderLeft: '1px solid #ddd',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <h5 style={{ marginBottom: '1rem' }}>ניהול מערכת</h5>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`btn ${selectedOption?.value === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => this.setState({ selectedOption: option })}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* תוכן */}
                <div style={{ flex: 1, padding: '2rem' }}>
                    {this.renderSelectedSection()}
                </div>
            </div>
        );
    }
}

export default AdminEditPage;
