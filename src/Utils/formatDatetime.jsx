function formatDatetime(datetimeString) {
    const datetimeObj = new Date(datetimeString);
    return datetimeObj.toLocaleString('eng-Uk', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour12: false
    }).replace(',',' ');
}

export default formatDatetime;