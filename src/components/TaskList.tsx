import { useState } from 'react';
import { Plus, Filter, Calendar, Flag, CheckCircle2, Circle, Edit, Trash2, PauseCircle, AlertTriangle, Ban, HelpCircle, Flame, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useTasks } from '@/hooks/useTasks';
import { useCourses } from '@/hooks/useCourses';
import { Task, PRIORITY_COLORS } from '@/types';
import { TaskModal } from './TaskModal';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TaskListProps {
  compact?: boolean;
}

// Central config for all statuses
const STATUS_CONFIG = {
  notdone: {
    label: 'Not Done',
    color: 'border-gray-300',
    badge: 'bg-gray-200 text-gray-800',
    icon: Circle,
    progress: 10,
  },
  pending: {
    label: 'Pending',
    color: 'border-yellow-400',
    badge: 'bg-yellow-200 text-yellow-800',
    icon: PauseCircle,
    progress: 50,
  },
  done: {
    label: 'Done',
    color: 'border-green-500',
    badge: 'bg-green-200 text-green-800',
    icon: CheckCircle2,
    progress: 100,
  },
  onhold: {
    label: 'On Hold',
    color: 'border-blue-400',
    badge: 'bg-blue-200 text-blue-800',
    icon: Clock,
    progress: 30,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'border-gray-400',
    badge: 'bg-gray-400 text-white',
    icon: Ban,
    progress: 0,
  },
  urgent: {
    label: 'Urgent',
    color: 'border-red-600',
    badge: 'bg-red-200 text-red-800',
    icon: Flame,
    progress: 60,
  },
  ambiguous: {
    label: 'Ambiguous',
    color: 'border-purple-500',
    badge: 'bg-purple-200 text-purple-800',
    icon: HelpCircle,
    progress: 40,
  },
};
const ALL_STATUSES = Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[];

export const TaskList = ({ compact = false }: TaskListProps) => {
  const { tasks, updateTask, deleteTask, isLoading } = useTasks();
  const { courses } = useCourses();
  const isMobile = useIsMobile();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterCourse !== 'all' && task.courseId !== filterCourse) return false;
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cycleCheckboxStatus = (status: keyof typeof STATUS_CONFIG) => {
    const order = ['notdone', 'pending', 'done'];
    const idx = order.indexOf(status);
    return order[(idx + 1) % order.length] as keyof typeof STATUS_CONFIG;
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading tasks...</div>
      </div>
    );
  }

  if (compact) {
    const upcomingTasks = filteredTasks
      .filter(task => task.status !== 'done')
      .slice(0, 5);

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Checkbox
                checked={task.status === 'done'}
                onCheckedChange={() => updateTask({ ...task, status: 'done' })}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due {format(task.dueDate, 'MMM d')}
                  </p>
                )}
              </div>
              <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </Badge>
            </div>
          ))}
          {upcomingTasks.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No upcoming tasks</p>
          )}
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
        <Button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {ALL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>{STATUS_CONFIG[status].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
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

      {/* Task List */}
      <div className="space-y-3">
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          {Object.keys(STATUS_CONFIG ).map((status) => (
            <span key={status} className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[status].badge}`}>{statusCounts[status] || 0} {STATUS_CONFIG[status].label}</span>
          ))}
        </div>
        {filteredTasks.map((task) => (
          <Card key={task.id} className={`hover:shadow-md transition-shadow border-2 mb-2 ${STATUS_CONFIG[task.status].color} border-l-8`}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {/* Status icon as indicator/checkbox */}
                <button
                  type="button"
                  aria-label="Change status"
                  onClick={() => {
                    const nextStatus = cycleCheckboxStatus(task.status);
                    console.log('Status icon clicked for task', task.id, 'from', task.status, 'to', nextStatus);
                    updateTask({ ...task, status: nextStatus });
                  }}
                  className="focus:outline-none"
                >
                  {(() => {
                    const Icon = STATUS_CONFIG[task.status].icon;
                    return <Icon className={`w-5 h-5 ${STATUS_CONFIG[task.status].badge}`} />;
                  })()}
                </button>
                <h3 className={`font-medium text-lg flex-1 ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span className={`cursor-pointer px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[task.status].badge}`}>{STATUS_CONFIG[task.status].label}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {ALL_STATUSES.map((status) => (
                      <DropdownMenuItem key={status} onClick={() => updateTask({ ...task, status })}>
                        {STATUS_CONFIG[status].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4" />
                  <span className={task.status !== 'done' && task.dueDate < new Date() ? 'text-red-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
                    Due {format(task.dueDate, 'MMM d, yyyy')}
                    {task.status !== 'done' && task.dueDate < new Date() && ' (Overdue)'}
                  </span>
                </div>
              )}
              {task.course && (
                <Badge variant="outline" className="text-xs">{task.course.name}</Badge>
              )}
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
              )}
              {/* Progress bar/stepper */}
              <div className="mt-2">
                <Progress value={STATUS_CONFIG[task.status].progress} className="h-2" />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditTask(task)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No tasks found matching your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
};
