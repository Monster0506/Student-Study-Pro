import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StudyGoalsProgressProps {
  studyGoals: any[];
  loading: boolean;
}

export const StudyGoalsProgress: React.FC<StudyGoalsProgressProps> = ({ studyGoals, loading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base sm:text-lg">Study Goals Progress</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex flex-col items-center py-12 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-2">⏳</span>
          Loading goals...
        </div>
      ) : studyGoals.length > 0 ? (
        <div className="space-y-4">
          {studyGoals.map((goal) => (
            <div key={goal.courseId} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{goal.courseName}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {goal.actualHours.toFixed(1)} / {goal.targetHours} hours
                </span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-2">🎯</span>
          No study goals set
        </div>
      )}
    </CardContent>
  </Card>
); 