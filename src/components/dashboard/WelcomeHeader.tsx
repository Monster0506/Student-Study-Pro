import React from 'react';

interface WelcomeHeaderProps {
  userName: string;
  today: Date;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName, today }) => {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
        Welcome, {userName}!
      </h1>
      <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
        Today is {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </>
  );
}; 