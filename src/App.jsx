// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import TaskAssignmentPage from './pages/TaskAssignmentPage.jsx';
import AdminEditPage from './pages/AdminEditPage.jsx';
import PersonalDetailsPage from './pages/PersonalDetailsPage.jsx';
import MyTeamPage from './pages/MyTeamPage.jsx';
import ErrorPage from './ErrorPages/ErrorPage.jsx';

import WithNavLayout from './components/WithNavLayout.jsx';
import { AppDataProvider } from './context/AppDataContext.jsx';
import { UserProvider } from './context/UserContext.jsx';

function App() {
    const cookies = new Cookies();
    const token = cookies.get('token');

    return (
        <AppDataProvider>
            <UserProvider>
                <Router>
                    <Routes>
                        {!token ? (
                            // no token → only allow login
                            <Route path="/" element={<LoginPage />} />
                        ) : (
                            // with token → wrap protected pages in your nav layout
                            <Route element={<WithNavLayout />}>
                                <Route path="/" element={<Navigate to="/home" replace />} />
                                <Route path="/home" element={<HomePage />} />
                                <Route path="/task-assignment" element={<TaskAssignmentPage />} />
                                <Route path="/admin-edit" element={<AdminEditPage />} />
                                <Route path="/Personal-Details-Page" element={<PersonalDetailsPage />} />
                                <Route path="/my-team" element={<MyTeamPage />} />
                            </Route>
                        )}

                        {/* catch-all for unknown routes */}
                        <Route path="*" element={<ErrorPage />} />
                    </Routes>
                </Router>
            </UserProvider>
        </AppDataProvider>
    );
}

export default App;
