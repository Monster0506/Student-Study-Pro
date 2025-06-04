import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TimeUsagePieChartProps {
  data: any[];
  colors: string[];
  dateRangeLabel: string;
  totalHours: number;
}

export const TimeUsagePieChart: React.FC<TimeUsagePieChartProps> = ({ data, colors, dateRangeLabel, totalHours }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base sm:text-lg">
        Time Distribution {dateRangeLabel}
      </CardTitle>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Total: {totalHours.toFixed(1)} hours
      </p>
    </CardHeader>
    <CardContent>
      {data.length > 0 ? (
        <div className="h-[300px] sm:h-[400px] flex flex-col items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoryName, hours, percent }) =>
                  `${categoryName}: ${hours.toFixed(1)}h (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="hours"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.colorHex || colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {/* Color legend */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {data.map((entry, idx) => (
              <div key={entry.categoryName} className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.colorHex || colors[idx % colors.length] }} />
                <span>{entry.categoryName}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-2">📊</span>
          No events found for this period
        </div>
      )}
    </CardContent>
  </Card>
); 