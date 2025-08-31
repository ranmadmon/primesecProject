// src/components/NavBar.jsx
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import axios from 'axios';
import './NavBar.css';
import { SERVER_URL } from './Utils/Constants.jsx';

export default function NavBar() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const cookies = new Cookies();
    const profileImage = "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg";

    const fetchRole = async () => {
        const token = cookies.get('token');
        if (!token) {
            setRole(null);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${SERVER_URL}/get-permission`, { params: { token } });
            const id = parseInt(res.data, 10);
            if (id === 4) setRole('adminTeamLeader');
            else if (id === 3) setRole('admin');
            else if (id === 2) setRole('teamLeader');
            else setRole('worker');
        } catch {
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRole();
        const interval = setInterval(fetchRole, 3000); // בדיקה כל 3 שניות
        return () => clearInterval(interval);          // מנקה בזמן פירוק
    }, []);

    const handleLogout = () => {
        cookies.remove('token', { path: '/' });
        cookies.remove('id', { path: '/' });
        navigate('/', { replace: true });
        window.location.reload();
    };

    if (loading) return null;

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
                <div className="container-fluid">
                    <div className="nav-logo">
                        <img
                            src="https://images.cdn-files-a.com/uploads/909407/400_5e876acdaa8d2.png"
                            alt="Logo"
                        />
                    </div>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">

                            {(role === 'admin' || role === 'adminTeamLeader') && (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/admin-edit">
                                            עריכת פרטים
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/task-assignment">
                                            סידור משימות
                                        </NavLink>
                                    </li>
                                </>
                            )}

                            {(role === 'teamLeader' || role === 'adminTeamLeader') && (
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/my-team">
                                        הצוות שלי
                                    </NavLink>
                                </li>
                            )}

                            <li className="nav-item">
                                <NavLink className="nav-link" to="/home">
                                    בית
                                </NavLink>
                            </li>

                            <li className="nav-item dropdown">
                                <button
                                    className="btn nav-link dropdown-toggle p-0"
                                    id="profileDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ background: 'transparent', border: 'none' }}
                                >
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        width="40"
                                        height="40"
                                        className="rounded-circle"
                                    />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                    <li>
                                        <NavLink className="dropdown-item" to="/Personal-Details-Page">
                                            אזור אישי
                                        </NavLink>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item text-danger"
                                            data-bs-toggle="modal"
                                            data-bs-target="#logoutModal"
                                        >
                                            התנתקות
                                        </button>
                                    </li>
                                </ul>
                            </li>

                        </ul>
                    </div>
                </div>
            </nav>

            {/* התנתקות */}
            <div
                className="modal fade"
                id="logoutModal"
                tabIndex="-1"
                aria-labelledby="logoutModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="logoutModalLabel">אישור התנתקות</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">
                            האם אתה בטוח שברצונך להתנתק?
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                ביטול
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleLogout}
                            >
                                התנתק
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
