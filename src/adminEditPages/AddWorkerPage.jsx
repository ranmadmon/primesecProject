// src/components/AddWorkerPage.jsx
import React, { Component } from 'react'
import Select from 'react-select'
import '../CssFiles/page-layout.css'    // כאן מייבאים את העיצוב המשותף
import { SERVER_URL } from '../Utils/Constants.jsx'

export default class AddWorkerPage extends Component {
    state = {
        username: '',
        password: '',
        fullName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        selectedAbilities: [],
        abilities: [],
        selectedTeamId: '',
        teams: []
    }

    async componentDidMount() {
        await this.loadAbilities()
        await this.loadTeams()
    }

    loadAbilities = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/abilities`)
            const data = await res.json()
            this.setState({ abilities: data.map(a => a.name) })
        } catch (err) {
            console.error('שגיאה בטעינת יכולות מהשרת:', err)
        }
    }

    loadTeams = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/all-teams`)
            const teams = await res.json()
            this.setState({ teams })
        } catch (err) {
            console.error('שגיאה בטעינת צוותים מהשרת:', err)
        }
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleAbilityChange = selectedOptions => {
        this.setState({ selectedAbilities: selectedOptions || [] })
    }

    handleAddWorker = async () => {
        const {
            username, password, fullName, lastName,
            email, phoneNumber, selectedAbilities, selectedTeamId
        } = this.state

        if (
            !username ||
            !password ||
            !fullName ||
            !lastName ||
            !email ||
            !phoneNumber ||
            selectedAbilities.length === 0 ||
            !selectedTeamId
        ) {
            return alert('אנא מלא את כל השדות')
        }

        // בדיקת קיימות שם משתמש
        try {
            const resp = await fetch(
                `${SERVER_URL}/check-username?username=${encodeURIComponent(username)}`
            )
            const { taken } = await resp.json()
            if (taken) {
                return alert('שם המשתמש כבר קיים')
            }
        } catch (err) {
            console.error('שגיאה בבדיקת שם משתמש:', err)
            return alert('שגיאה בבדיקת זמינות שם המשתמש')
        }

        const abilitiesString = selectedAbilities.map(opt => opt.value).join(',')

        try {
            const response = await fetch(`${SERVER_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    userName: username,
                    password,
                    name: fullName,
                    lastName,
                    email,
                    role: 'worker',
                    phoneNumber,
                    teamId: selectedTeamId,
                    abilities: abilitiesString
                })
            })
            const data = await response.json()
            if (data.success) {
                alert('העובד נוסף בהצלחה!')
                this.setState({
                    username: '',
                    password: '',
                    fullName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                    selectedAbilities: [],
                    selectedTeamId: ''
                })
            } else {
                alert(data.message || 'הרישום נכשל - בדוק את הנתונים')
            }
        } catch (err) {
            console.error('שגיאה ברישום עובד:', err)
            alert('שגיאה בהוספת עובד')
        }
    }

    render() {
        const {
            username, password, fullName, lastName,
            email, phoneNumber, selectedAbilities,
            abilities, selectedTeamId, teams
        } = this.state

        const abilityOptions = abilities.map(a => ({ value: a, label: a }))
        const teamOptions    = teams.map(t => ({ value: t.id, label: t.name }))

        return (
            <div className="page-container" dir="rtl">
                <h2 className="page-header">הוספת עובד חדש</h2>

                <div className="form-section">
                    <label>שם משתמש:</label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={this.handleChange}
                        className="form-control"
                        placeholder="שם משתמש"
                    />
                </div>

                <div className="form-section">
                    <label>סיסמה:</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={this.handleChange}
                        className="form-control"
                        placeholder="סיסמה"
                    />
                </div>

                <div className="form-section">
                    <label>שם פרטי:</label>
                    <input
                        type="text"
                        name="fullName"
                        value={fullName}
                        onChange={this.handleChange}
                        className="form-control"
                        placeholder="שם פרטי"
                    />
                </div>

                <div className="form-section">
                    <label>שם משפחה:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={lastName}
                        onChange={this.handleChange}
                        className="form-control"
                        placeholder="שם משפחה"
                    />
                </div>

                <div className="form-section">
                    <label>אימייל:</label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={this.handleChange}
                        className="form-control"
                        placeholder="Email"
                    />
                </div>

                <div className="form-section">
                    <label>טלפון:</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={this.handleChange}
                        className="form-control"
                        placeholder="טלפון"
                    />
                </div>

                <div className="form-section">
                    <label>יכולות:</label>
                    <Select
                        isMulti
                        options={abilityOptions}
                        value={selectedAbilities}
                        onChange={this.handleAbilityChange}
                        placeholder="בחר יכולות..."
                    />
                </div>

                <div className="form-section">
                    <label>צוות:</label>
                    <Select
                        options={teamOptions}
                        value={teamOptions.find(t => t.value === parseInt(selectedTeamId)) || null}
                        onChange={opt => this.setState({ selectedTeamId: opt?.value || '' })}
                        placeholder="בחר צוות..."
                    />
                </div>

                <div className="actions-row">
                    <button className="btn-save" onClick={this.handleAddWorker}>
                        הוסף עובד
                    </button>
                </div>
            </div>
        )
    }
}
