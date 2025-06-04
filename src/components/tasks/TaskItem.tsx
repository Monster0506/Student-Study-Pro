import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { PRIORITY_COLORS, Task, Course } from '@/types';
import { format } from 'date-fns';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

type PriorityValue = typeof PRIORITY_OPTIONS[number]['value'];

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (task: Task, status: keyof typeof statusConfig) => void;
  onStatusDropdown: (task: Task, status: keyof typeof statusConfig) => void;
  onPriorityDropdown: (task: Task, priority: PriorityValue) => void;
  statusConfig: typeof STATUS_CONFIG;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onStatusChange, onStatusDropdown, onPriorityDropdown, statusConfig }) => {
  const StatusIcon = statusConfig[task.status].icon;
  const isOverdue = task.status !== 'done' && task.dueDate && task.dueDate < new Date();
  return (
    <Card className={`group relative transition-shadow border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-lg px-0 py-0`}>  
      <CardContent className="p-5 flex flex-col gap-2">
        <div className="flex items-start gap-3">
          {/* Status icon as indicator/checkbox */}
          <button
            type="button"
            aria-label="Change status"
            onClick={() => onStatusChange(task, task.status)}
            className="focus:outline-none mt-1"
          >
            <StatusIcon className={`w-6 h-6 ${statusConfig[task.status].badge}`} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-lg sm:text-xl truncate ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>{task.title}</h3>
              {isOverdue && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1 animate-pulse">
                      <CheckCircle2 className="w-3 h-3 inline-block" /> Overdue
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>This task is overdue!</TooltipContent>
                </Tooltip>
              )}
            </div>
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(task.dueDate, 'MMM d, yyyy')}
                </span>
              )}
              {task.course && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold">
                  {(task.course as Course)?.name}
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span className={`cursor-pointer px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig[task.status].badge} border border-gray-200 dark:border-gray-700`}>
                    {statusConfig[task.status].label}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.keys(statusConfig).map((status) => (
                    <DropdownMenuItem key={status} onClick={() => onStatusDropdown(task, status as keyof typeof statusConfig)}>
                      {statusConfig[status as keyof typeof statusConfig].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[task.priority]} border border-gray-200 dark:border-gray-700 cursor-pointer`}>
                    {task.priority}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <DropdownMenuItem key={opt.value} onClick={() => onPriorityDropdown(task, opt.value)}>
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-1 ml-2 mt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(task)}
                  className="h-8 w-8 p-0"
                  aria-label="Edit Task"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(task.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  aria-label="Delete Task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate max-w-full">{task.description}</p>
        )}
      </CardContent>
    </Card>
  );
} 