import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeUsageBarChartProps {
  data: any[];
  isMobile: boolean;
  colors: string[];
}

export const TimeUsageBarChart: React.FC<TimeUsageBarChartProps> = ({ data, isMobile, colors }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base sm:text-lg">Hours by Category</CardTitle>
    </CardHeader>
    <CardContent>
      {data.length > 0 ? (
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="categoryName" 
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 60 : 30}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-2">📈</span>
          No events found for this period
        </div>
      )}
    </CardContent>
  </Card>
); 