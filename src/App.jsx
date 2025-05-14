import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WithNavLayout from './components/WithNavLayout.jsx';
import { UserProvider } from './context/UserContext.jsx';
import TaskAssignmentPage from "./pages/TaskAssignmentPage.jsx"; // הנתיב תלוי במיקום
import AdminEditPage from './pages/AdminEditPage';
import { AppDataProvider } from './context/AppDataContext';
import { UserContext } from './context/UserContext.jsx';
import PersonalDetailsPage from "./pages/PersonalDetailsPage.jsx";
import MyTeamPage from "./pages/MyTeamPage.jsx";





function App() {
    return (
        <AppDataProvider>
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route element={<WithNavLayout />}>
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/task-assignment" element={<TaskAssignmentPage />} />
                        <Route path="/admin-edit" element={<AdminEditPage />} />
                        <Route path="/Personal-Details-Page" element={<PersonalDetailsPage />} />
                        <Route path="/My-Team-Page" element={<MyTeamPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </UserProvider>
        </AppDataProvider>


    );
}

export default App;
