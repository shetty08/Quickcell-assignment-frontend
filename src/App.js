// App.js
import React, { useState, useEffect } from 'react';

import './App.css';

const priorityLabels = {
  4: 'Urgent',
  3: 'High',
  2: 'Medium',
  1: 'Low',
  0: 'No priority',
};

const statusIcons = {
  'Todo': '🔵',
  'In progress': '🟡',
  'Backlog': '⚪',
  'Done': '🟢',
};

const fetchKanbanData = async () => {
  const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const groupTasks = (tasks, groupBy, users) => {
  switch (groupBy) {
    case 'status':
      return Object.groupBy(tasks, (task) => task.status);
    case 'user':
      return Object.groupBy(tasks, (task) => {
        const user = users.find((u) => u.id === task.userId);
        return user ? user.name : 'Unassigned';
      });
    case 'priority':
      return Object.groupBy(tasks, (task) => priorityLabels[task.priority]);
    default:
      return { 'All Tasks': tasks };
  }
};

const KanbanCard = ({ task, users }) => {
  const user = users.find((u) => u.id === task.userId);
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-id">{task.id}</span>
        <span className="card-user">{user ? user.name.charAt(0) : '?'}</span>
      </div>
      <div className="card-title">{task.title}</div>
      <div className="card-footer">
        <span className="card-status">{statusIcons[task.status]}</span>
        <span className="card-tag">{task.tag[0]}</span>
      </div>
    </div>
  );
};

const KanbanColumn = ({ title, tasks, users }) => {
  return (
    <div className="column">
      <h3>
        {title} ({tasks.length})
      </h3>
      {tasks.map((task) => (
        <KanbanCard key={task.id} task={task} users={users} />
      ))}
    </div>
  );
};

const KanbanBoard = ({ groupedTasks, users }) => {
  return (
    <div className="board">
      {Object.entries(groupedTasks).map(([group, tasks]) => (
        <KanbanColumn key={group} title={group} tasks={tasks} users={users} />
      ))}
    </div>
  );
};

const DisplayOptions = ({ onGroupingChange, grouping }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    onGroupingChange(option);
    setIsOpen(false);
  };

  return (
    <div className="display-options">
      <div className="dropdown">
        <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
          Display: {grouping.charAt(0).toUpperCase() + grouping.slice(1)} ▼
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            <button onClick={() => handleOptionClick('status')}>Group by Status</button>
            <button onClick={() => handleOptionClick('user')}>Group by User</button>
            <button onClick={() => handleOptionClick('priority')}>Group by Priority</button>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [kanbanData, setKanbanData] = useState(null);
  const [grouping, setGrouping] = useState(() => {
    return localStorage.getItem('kanbanGrouping') || 'status';
  });

  useEffect(() => {
    fetchKanbanData().then(setKanbanData).catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('kanbanGrouping', grouping);
  }, [grouping]);

  if (!kanbanData) {
    return <div>Loading...</div>;
  }

  const groupedTasks = groupTasks(kanbanData.tickets, grouping, kanbanData.users);

  return (
    <div className="container">
      <h1>Kanban Board</h1>
      <DisplayOptions onGroupingChange={setGrouping} grouping={grouping} />
      <KanbanBoard groupedTasks={groupedTasks} users={kanbanData.users} />
    </div>
  );
};

export default App;
