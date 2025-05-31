import { useState } from 'react';
import { Plus, Filter, Calendar, Flag, CheckCircle2, Circle, Edit, Trash2 } from 'lucide-react';
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
import { Task, PRIORITY_COLORS, STATUS_COLORS } from '@/types';
import { TaskModal } from './TaskModal';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskListProps {
  compact?: boolean;
}

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

  const handleTaskToggle = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask({ ...task, status: newStatus });
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
                onCheckedChange={() => handleTaskToggle(task)}
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
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
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
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={task.status === 'done'}
                  onCheckedChange={() => handleTaskToggle(task)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
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
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={`text-xs ${STATUS_COLORS[task.status]}`}>
                      {task.status === 'todo' ? 'To Do' : task.status === 'inprogress' ? 'In Progress' : 'Done'}
                    </Badge>
                    <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority}
                    </Badge>
                    {task.course && (
                      <Badge variant="outline" className="text-xs">
                        {task.course.name}
                      </Badge>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        Due {format(task.dueDate, 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
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
