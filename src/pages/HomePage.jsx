import React, { Component } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { Navigate } from 'react-router-dom';

class HomePage extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            navigateToAssignment: false,
        };
    }

    handleExport = () => {
        alert('כאן יבוצע ייצוא לקובץ אקסל - נבנה בהמשך');
    };

    handleMarkCompleted = (task) => {
        const { markTaskCompleted } = this.context;
        markTaskCompleted(task);
    };

    render() {
        // ברירת מחדל לרשימות כדי למנוע undefined
        const { user, tasks = [], completedTasks = [], userList = [] } = this.context;
        const { navigateToAssignment } = this.state;

        if (!user || !user.isLoggedIn) {
            return <h2 style={{ textAlign: 'center' }}>עליך להתחבר קודם</h2>;
        }

        if (navigateToAssignment) {
            return <Navigate to="/task-assignment" />;
        }

        // סינון רשימות באופן דינמי, עם default ל-array ריק
        const getVisible = (list = []) => {
            if (user.role === 'admin') {
                return list;
            }
            if (user.role === 'teamLeader') {
                // חברי צוות דינמיים מתוך userList
                const teamMembers = userList
                    .filter(u => u.role === 'worker' && u.team === user.team)
                    .map(u => u.username);
                return list.filter(
                    t => t.assignedTo === user.username || teamMembers.includes(t.assignedTo)
                );
            }
            // עובד רגיל רואה רק משימות שהוקצו לו
            return list.filter(t => t.assignedTo === user.username);
        };

        const visiblePending = getVisible(tasks);
        const visibleCompleted = getVisible(completedTasks);
        const showExport = user.role === 'admin' && visiblePending.length > 0;

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2rem',
                    minHeight: '100vh',
                    boxSizing: 'border-box',
                }}
                dir="rtl"
            >
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    ברוך הבא, {user.username}
                </h1>

                <div style={{ width: '100%', maxWidth: 800 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: showExport ? 'space-between' : 'center',
                            alignItems: 'center',
                            marginBottom: '1rem',
                        }}
                    >
                        <h3 style={{ margin: 0, textAlign: showExport ? 'left' : 'center', flex: showExport ? 'none' : 1 }}>
                            משימות לביצוע:
                        </h3>
                        {showExport && (
                            <button
                                className="btn btn-success"
                                onClick={this.handleExport}
                            >
                                ייצוא לאקסל
                            </button>
                        )}
                    </div>

                    {visiblePending.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>אין משימות להצגה</p>
                    ) : (
                        <table className="table table-bordered text-center">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>שם משימה</th>
                                <th>לקוח</th>
                                <th>מי מבצע</th>
                                <th>פעולה</th>
                            </tr>
                            </thead>
                            <tbody>
                            {visiblePending.map((task, idx) => (
                                <tr key={task.id || idx}>
                                    <td>{idx + 1}</td>
                                    <td>{task.title || `משימה ${task.taskId}`}</td>
                                    <td>{task.client || `לקוח ${task.clientId}`}</td>
                                    <td>{task.assignedTo}</td>
                                    <td>
                                        <button
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => this.handleMarkCompleted(task)}
                                        >
                                            סמן כבוצע
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}

                    <h3 style={{ margin: '2rem 0 1rem', textAlign: 'center' }}>
                        משימות שבוצעו:
                    </h3>
                    {visibleCompleted.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>אין משימות שבוצעו</p>
                    ) : (
                        <table className="table table-bordered text-center">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>שם משימה</th>
                                <th>לקוח</th>
                                <th>מי ביצע</th>
                            </tr>
                            </thead>
                            <tbody>
                            {visibleCompleted.map((task, idx) => (
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

                    {user.role === 'admin' && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => this.setState({ navigateToAssignment: true })}
                            >
                                סידור משימות
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default HomePage;
