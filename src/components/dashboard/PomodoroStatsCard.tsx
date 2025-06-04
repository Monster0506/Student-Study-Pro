import React from 'react';

interface PomodoroStatsCardProps {
  completed: number;
  today: number;
}

export const PomodoroStatsCard: React.FC<PomodoroStatsCardProps> = ({ completed, today }) => (
  <div className="bg-card border rounded-lg shadow p-4 flex flex-col">
    <div className="font-semibold text-pink-600 dark:text-pink-400 mb-1">Pomodoro Stats</div>
    <span className="text-xs text-gray-400">Completed: {completed}</span>
    <span className="text-xs text-gray-400">Today: {today}</span>
  </div>
); 