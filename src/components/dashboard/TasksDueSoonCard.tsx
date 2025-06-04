import React from 'react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  dueDate?: Date;
}

interface TasksDueSoonCardProps {
  tasksDueSoon: Task[];
}

export const TasksDueSoonCard: React.FC<TasksDueSoonCardProps> = ({ tasksDueSoon }) => (
  <div className="bg-card border rounded-lg shadow p-4 flex flex-col">
    <div className="font-semibold text-green-600 dark:text-green-400 mb-1">Tasks Due Soon</div>
    {tasksDueSoon.length > 0 ? (
      <ul className="space-y-1">
        {tasksDueSoon.map(task => (
          <li key={task.id} className="truncate">
            <span className="font-medium">{task.title}</span>
            <span className="text-xs text-gray-500 ml-2">{task.dueDate ? format(task.dueDate, 'MMM d, h:mm a') : ''}</span>
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-xs text-gray-400">No tasks due soon</span>
    )}
  </div>
); 