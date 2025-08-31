// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Card from './Card.jsx';
import '../CssFiles/Form.css';
import '../CssFiles/LoginPage.css';
import axios from 'axios';
import Cookies from 'universal-cookie';
import OtpComponent from './OtpComponent.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    DASHBOARD_URL,
    REGISTER_URL,
    SERVER_URL,
    USER_NOT_EXIST,
    ERROR_PASSWORD
} from '../Utils/Constants.jsx';

export default function LoginPage() {
    // stage: 'login' | 'otp' | 'forgot' | 'reset'
    const [stage, setStage] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();
    const cookies = new Cookies();

    const loginUrl        = `${SERVER_URL}/login`;
    const otpUrl          = `${SERVER_URL}/check-otp`;
    const forgotPwdUrl    = `${SERVER_URL}/forgot-password`;
    const verifyCodeUrl   = `${SERVER_URL}/verify-recovery-code`;
    const resetPwdUrl     = `${SERVER_URL}/reset-password`;

    // אם כבר מחובר
    if (cookies.get('token')) {
        return <Navigate to="/home" replace />;
    }

    // ======================
    // 1) כניסת משתמש רגילה
    // ======================
    const handleLogin = async () => {
        setErrorMsg('');
        try {
            const res = await axios.get(loginUrl, { params: { username, password } });
            if (res.data.success) {
                setStage('otp');
            } else {
                switch (res.data.errorCode) {
                    case USER_NOT_EXIST:
                        setErrorMsg('המשתמש לא קיים');
                        break;
                    case ERROR_PASSWORD:
                        setErrorMsg('סיסמה שגויה');
                        break;
                    default:
                        setErrorMsg('התחברות נכשלה');
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('שגיאת שרת, נסה שוב מאוחר יותר');
        }
    };

    // ==================
    // 2) אימות בקוד SMS
    // ==================
    const handleOtp = async otp => {
        setErrorMsg('');
        try {
            const res = await axios.get(otpUrl, {
                params: { username, password, otp }
            });
            if (res.data.success) {
                cookies.set('token', res.data.token, { path: '/' });
                cookies.set('id',    res.data.id,    { path: '/' });
                navigate("/home");
                window.location.reload();
            } else {
                setErrorMsg('קוד לא תקין');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('שגיאת שרת, נסה שוב מאוחר יותר');
        }
    };

    // ========================
    // 3) שליחת SMS לשחזור סיסמה
    // ========================
    const handleForgot = async () => {
        setErrorMsg('');
        if (!username) {
            setErrorMsg('אנא הכנס שם משתמש');
            return;
        }
        try {
            const res = await axios.get(forgotPwdUrl, { params: { username } });
            if (res.data.success) {
                setStage('reset');
            } else {
                setErrorMsg('המשתמש לא קיים');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('שגיאת שרת, נסה שוב מאוחר יותר');
        }
    };

    // ============================
    // 4) אימות קוד + קביעת סיסמה חדשה
    // ============================
    const handleReset = async () => {
        setErrorMsg('');
        if (!recoveryCode || !newPassword) {
            setErrorMsg('אנא מלא קוד וסיסמה חדשה');
            return;
        }
        try {
            // אימות קוד
            const vres = await axios.post(verifyCodeUrl, null, {
                params: { username, recovery: recoveryCode }
            });
            if (!vres.data.success) {
                setErrorMsg('קוד שגוי');
                return;
            }
            // איפוס סיסמה
            const rres = await axios.post(resetPwdUrl, null, {
                params: { username, newPassword }
            });
            if (rres.data.success) {
                alert('הסיסמה שונתה! כעת תוכל להתחבר.');
                setStage('login');
                setRecoveryCode('');
                setNewPassword('');
                setErrorMsg('');
            } else {
                setErrorMsg('שגיאה באיפוס הסיסמה');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('שגיאת שרת, נסה שוב מאוחר יותר');
        }
    };

    return (
        <div className="login-page-container">
            <img
                className="login-logo"
                src="https://images.cdn-files-a.com/uploads/909407/400_5e876acdaa8d2.png"
                alt="PrimeSec Logo"
            />

            <Card width="30vw" height="auto" color="white">
                {stage === 'login' && (
                    <>
                        <h3 className="login-header">כניסה למערכת</h3>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="שם משתמש"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="input-group mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="סיסמה"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                        <button
                            className="btn btn-secondary w-100 mt-3"
                            onClick={handleLogin}
                            disabled={!username || !password}
                        >
                            התחבר
                        </button>
                        <div className="login-footer mt-2">
                            <span onClick={() => setStage('forgot')} className="link-like">
                                שכחתי סיסמה
                            </span>

                        </div>
                    </>
                )}

                {stage === 'otp' && (
                    <>
                        <h3 className="login-header">אימות בקוד SMS</h3>
                        <OtpComponent
                            arrayLength={6}
                            onOtpSubmit={handleOtp}
                            isVerified={false}
                            verifiedMessage="התחברת בהצלחה!"
                            unverifiedMessage="קוד שגוי, נסה שוב"
                        />
                        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                    </>
                )}

                {stage === 'forgot' && (
                    <>
                        <h3 className="login-header">שחזור סיסמה</h3>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="שם משתמש"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                        <button
                            className="btn btn-primary w-100"
                            onClick={handleForgot}
                        >
                            שלח קוד SMS
                        </button>
                        <div className="login-footer mt-2">
                            <span onClick={() => setStage('login')} className="link-like">
                                חזור להתחברות
                            </span>
                        </div>
                    </>
                )}

                {stage === 'reset' && (
                    <>
                        <h3 className="login-header">איפוס סיסמה</h3>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="קוד OTP"
                                value={recoveryCode}
                                onChange={e => setRecoveryCode(e.target.value)}
                            />
                        </div>
                        <div className="input-group mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="סיסמה חדשה"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                        <button
                            className="btn btn-success w-100"
                            onClick={handleReset}
                        >
                            אשר
                        </button>
                    </>
                )}
            </Card>
        </div>
    );
}
