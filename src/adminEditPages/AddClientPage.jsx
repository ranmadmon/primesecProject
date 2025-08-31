// src/components/AddClientPage.jsx
import React, { Component } from 'react';
import Select from 'react-select';
import '../CssFiles/page-layout.css';  // מייבא את הסגנונות
import { SERVER_URL } from '../Utils/Constants.jsx';

class AddClientPage extends Component {
    state = {
        name: '',
        defaultManager: '',
        users: [] // מגיע מהשרת
    };

    componentDidMount = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/all-users`);
            const data = await response.json();
            this.setState({ users: data });
        } catch (err) {
            console.error("שגיאה בטעינת משתמשים:", err);
        }
    };

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleSelectManager = selectedOption => {
        this.setState({ defaultManager: selectedOption?.value || '' });
    };

    handleAddClient = async () => {
        const { name, defaultManager } = this.state;
        if (!name || !defaultManager) {
            alert('נא למלא את כל השדות');
            return;
        }
        try {
            const response = await fetch(`${SERVER_URL}/add-client`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ name, managerUsername: defaultManager })
            });
            const data = await response.json();
            if (data.success) {
                alert('הלקוח נוסף בהצלחה!');
                this.setState({ name: '', defaultManager: '' });
            } else {
                alert(data.message || 'הוספת לקוח נכשלה');
            }
        } catch (err) {
            console.error("שגיאה בהוספת לקוח:", err);
            alert('שגיאה בעת שליחת הבקשה');
        }
    };

    render() {
        const { name, defaultManager, users } = this.state;
        const managerOptions = users.map(u => ({ value: u.username, label: u.username }));

        return (
            <div className="page-container" dir="rtl">
                <h2 className="page-header">הוספת לקוח חדש</h2>

                <div className="form-section">
                    <label>שם הלקוח:</label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={this.handleChange}
                        className="form-control"
                        placeholder="הזן שם לקוח..."
                    />
                </div>

                <div className="form-section">
                    <label>מנהל דיפולטי:</label>
                    <Select
                        options={managerOptions}
                        value={managerOptions.find(opt => opt.value === defaultManager) || null}
                        onChange={this.handleSelectManager}
                        placeholder="בחר מנהל..."
                    />
                </div>

                <div className="actions-row">
                    <button className="btn-primary" onClick={this.handleAddClient}>
                        הוסף לקוח
                    </button>
                </div>
            </div>
        );
    }
}

export default AddClientPage;
