import React from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './context/UserContext.jsx'; // ודא שהנתיב נכון
import './NavBar.css';

class NavBar extends React.Component {
    static contextType = UserContext;

    render() {
        const { user } = this.context;

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
                <div className="container-fluid">
                    <img
                        src="https://images.cdn-files-a.com/uploads/909407/400_5e876acdaa8d2.png"
                        alt="Logo"
                        style={{ width: '141px', height: '40px', marginRight: '10px' }}
                    />

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">



                            {user && user.role === 'admin' && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/admin-edit">עריכת פרטים</Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link className="nav-link" to="/task-assignment">סידור משימות</Link>
                                    </li>
                                </>
                            )}

                            {user && user.role === 'teamLeader' && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to= "/My-Team-Page" >הצוות שלי </Link>
                                    </li>
                                </>
                            )}

                            <li className="nav-item">
                                <Link className="nav-link" to="/Personal-Details-Page">פרטים אישיים</Link>
                            </li>


                            <li className="nav-item">
                                <Link className="nav-link" to="/home">בית</Link>
                            </li>
                            {/* אופציונלי: קישור ליציאה או לעמוד אחר */}
                            <li className="nav-item">
                                <Link className="nav-link" to="/">התנתקות</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

export default NavBar;
