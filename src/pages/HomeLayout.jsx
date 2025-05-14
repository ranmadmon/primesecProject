// HomeLayout.js
import React from 'react';
import NavBar from '../NavBar.jsx';  // לוודא שהנתיב נכון

const HomeLayout = ({ children }) => {
    return (
        <div>
            <NavBar />  {/* ה-NavBar יוצג רק בעמודים שדורשים אותו */}
            <div>{children}</div>  {/* התוכן של העמוד יופיע כאן */}
        </div>
    );
};

export default HomeLayout;
