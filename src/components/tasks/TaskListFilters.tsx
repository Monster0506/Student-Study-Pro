import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Course } from '@/types';

interface TaskListFiltersProps {
  searchTerm: string;
  onSearch: (v: string) => void;
  filterStatus: string;
  onStatus: (v: string) => void;
  filterPriority: string;
  onPriority: (v: string) => void;
  filterCourse: string;
  onCourse: (v: string) => void;
  statusOptions: { value: string; label: string }[];
  priorityOptions: { value: string; label: string }[];
  courses: Course[];
}

export const TaskListFilters: React.FC<TaskListFiltersProps> = ({
  searchTerm, onSearch, filterStatus, onStatus, filterPriority, onPriority, filterCourse, onCourse, statusOptions, priorityOptions, courses
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterStatus} onValueChange={onStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={onPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCourse} onValueChange={onCourse}>
          <SelectTrigger>
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
); 