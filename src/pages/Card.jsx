import React from 'react';

function Card({ width, height, color, children }) {
    const cardStyle = {
        width: width || '200px',           // ברירת מחדל של רוחב
        height: height || '300px',         // ברירת מחדל של גובה
        backgroundColor: color || '#fff',  // ברירת מחדל של צבע
        border: '1px solid #ccc',          // גבול דק סביב הכרטיס
        padding: '16px',                   // ריפוד פנימי
        boxSizing: 'border-box',           // כולל את הגבול ברוחב ובגובה
        borderRadius: '8px',               // פינות מעוגלות
        display: 'grid',                   // הצגת רכיבי הכרטיס ברשת
        gridTemplateRows: 'repeat(4, 1fr)',// הגדרת השורות בגובה שווה
        rowGap: '10px',                    // רווח בין השורות
        boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.5)', // צל אפור כהה יותר עם עוצמת הצל גבוהה יותר
    };

    return (
        <div style={cardStyle}>
            {children}
        </div>
    );
}

export default Card;
