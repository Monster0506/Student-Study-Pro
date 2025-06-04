import React from 'react';

interface CanvasImportSummaryProps {
  importPreview: any[];
}

export const CanvasImportSummary: React.FC<CanvasImportSummaryProps> = ({ importPreview }) => {
  const courseSummary: [string, number][] = Object.entries(
    importPreview.reduce((acc: Record<string, number>, item) => {
      if (item.course) acc[item.course] = (acc[item.course] || 0) + 1;
      return acc;
    }, {})
  );

  return (
    <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-800 flex flex-col gap-2 text-sm">
      <div className="font-semibold">Summary</div>
      <div>Total items: <span className="font-bold">{importPreview.length}</span></div>
      <div className="flex flex-wrap gap-4">
        <span>Assignments: <span className="font-bold text-green-600">{importPreview.filter(i => i.canvas_type === 'assignment').length}</span></span>
        <span>Quizzes: <span className="font-bold text-pink-600">{importPreview.filter(i => i.canvas_type === 'quiz').length}</span></span>
        <span>Announcements: <span className="font-bold text-purple-600">{importPreview.filter(i => i.canvas_type === 'announcement').length}</span></span>
      </div>
      <div className="flex flex-wrap gap-4">
        {courseSummary.map(([course, count]) => (
          <span key={course}>Course "{course}": <span className="font-bold">{count}</span></span>
        ))}
      </div>
    </div>
  );
}; 