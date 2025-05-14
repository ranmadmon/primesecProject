import React, { createContext, useContext, useState } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    const addTask = (newTask) => {
        setTasks((prev) => [...prev, newTask]);
    };

    const markTaskCompleted = (task) => {
        setCompletedTasks((prev) => [...prev, task]);
        setTasks((prev) => prev.filter((t) => t !== task));
    };

    return (
        <UserContext.Provider value={{ user, setUser, tasks, addTask, completedTasks, markTaskCompleted }}>
            {children}
        </UserContext.Provider>
    );
}
