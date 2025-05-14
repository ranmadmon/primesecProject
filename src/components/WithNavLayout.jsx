// src/components/WithNavLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../NavBar.jsx'; // ודא שהנתיב נכון לפי המבנה שלך

function WithNavLayout() {
    return (
        <div>
            <NavBar />
            <Outlet />
        </div>
    );
}

export default WithNavLayout;
