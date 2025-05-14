import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // תקן נתיב אם צריך

const AdminRoute = ({ children }) => {
    const { user } = useContext(UserContext);

    // בזמן שה-user עדיין לא נטען – לא לעשות כלום
    if (user === null) {
        return <div>טוען...</div>;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;
