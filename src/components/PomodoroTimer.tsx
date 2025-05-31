import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipForward, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePreferences } from '@/hooks/usePreferences';
import { useCourses } from '@/hooks/useCourses';
import { useTasks } from '@/hooks/useTasks';

type TimerType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSession {
  courseId?: string;
  taskId?: string;
}

export const PomodoroTimer = () => {
  const { preferences, updatePreferences } = usePreferences();
  const { courses } = useCourses();
  const { tasks } = useTasks();

  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentType, setCurrentType] = useState<TimerType>('work');
  const [cycleCount, setCycleCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [session, setSession] = useState<PomodoroSession>({});
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const defaultSettings = {
    pomodoroWorkMinutes: 25,
    pomodoroShortBreakMinutes: 5,
    pomodoroLongBreakMinutes: 15,
    pomodoroCyclesBeforeLongBreak: 4,
  };

  const settings = preferences || defaultSettings;

  useEffect(() => {
    if (currentType === 'work') {
      setTimeLeft(settings.pomodoroWorkMinutes * 60);
    } else if (currentType === 'shortBreak') {
      setTimeLeft(settings.pomodoroShortBreakMinutes * 60);
    } else {
      setTimeLeft(settings.pomodoroLongBreakMinutes * 60);
    }
  }, [currentType, settings]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playNotification();
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const playNotification = () => {
    // Create audio notification
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (currentType === 'work') {
      const newCycleCount = cycleCount + 1;
      setCycleCount(newCycleCount);
      
      // Determine next break type
      if (newCycleCount % settings.pomodoroCyclesBeforeLongBreak === 0) {
        setCurrentType('longBreak');
      } else {
        setCurrentType('shortBreak');
      }
    } else {
      setCurrentType('work');
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (currentType === 'work') {
      setTimeLeft(settings.pomodoroWorkMinutes * 60);
    } else if (currentType === 'shortBreak') {
      setTimeLeft(settings.pomodoroShortBreakMinutes * 60);
    } else {
      setTimeLeft(settings.pomodoroLongBreakMinutes * 60);
    }
  };

  const handleSkip = () => {
    setIsRunning(false);
    handleTimerComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = currentType === 'work' 
      ? settings.pomodoroWorkMinutes * 60
      : currentType === 'shortBreak'
      ? settings.pomodoroShortBreakMinutes * 60
      : settings.pomodoroLongBreakMinutes * 60;
    
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getTypeLabel = () => {
    switch (currentType) {
      case 'work': return 'Work Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  };

  const getTypeColor = () => {
    switch (currentType) {
      case 'work': return 'bg-red-500';
      case 'shortBreak': return 'bg-green-500';
      case 'longBreak': return 'bg-blue-500';
    }
  };

  const handleSaveSettings = (newSettings: any) => {
    updatePreferences(newSettings);
    setIsSettingsOpen(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pomodoro Timer</CardTitle>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <PomodoroSettings 
                settings={settings} 
                onSave={handleSaveSettings}
                onClose={() => setIsSettingsOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Badge className={`${getTypeColor()} text-white`}>
            {getTypeLabel()}
          </Badge>
          <Badge variant="outline">
            Cycle {Math.floor(cycleCount / settings.pomodoroCyclesBeforeLongBreak) + 1}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div className="text-6xl font-mono font-bold">
          {formatTime(timeLeft)}
        </div>
        
        <Progress value={getProgress()} className="w-full" />
        
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} className="bg-yellow-600 hover:bg-yellow-700">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button onClick={handleReset} variant="outline">
            <Square className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Button onClick={handleSkip} variant="outline">
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
        </div>

        {/* Session Association */}
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-sm font-medium">Associate with (Optional)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={session.courseId || 'none'}
              onValueChange={(value) => setSession({ ...session, courseId: value === 'none' ? undefined : value })}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No course</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={session.taskId || 'none'}
              onValueChange={(value) => setSession({ ...session, taskId: value === 'none' ? undefined : value })}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No task</SelectItem>
                {tasks.filter(t => t.status !== 'done').map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PomodoroSettingsProps {
  settings: any;
  onSave: (settings: any) => void;
  onClose: () => void;
}

const PomodoroSettings = ({ settings, onSave, onClose }: PomodoroSettingsProps) => {
  const [formData, setFormData] = useState({
    pomodoroWorkMinutes: settings.pomodoroWorkMinutes,
    pomodoroShortBreakMinutes: settings.pomodoroShortBreakMinutes,
    pomodoroLongBreakMinutes: settings.pomodoroLongBreakMinutes,
    pomodoroCyclesBeforeLongBreak: settings.pomodoroCyclesBeforeLongBreak,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="work">Work Duration (minutes)</Label>
        <Input
          id="work"
          type="number"
          min="1"
          max="60"
          value={formData.pomodoroWorkMinutes}
          onChange={(e) => setFormData({ 
            ...formData, 
            pomodoroWorkMinutes: parseInt(e.target.value) || 25 
          })}
        />
      </div>

      <div>
        <Label htmlFor="shortBreak">Short Break (minutes)</Label>
        <Input
          id="shortBreak"
          type="number"
          min="1"
          max="30"
          value={formData.pomodoroShortBreakMinutes}
          onChange={(e) => setFormData({ 
            ...formData, 
            pomodoroShortBreakMinutes: parseInt(e.target.value) || 5 
          })}
        />
      </div>

      <div>
        <Label htmlFor="longBreak">Long Break (minutes)</Label>
        <Input
          id="longBreak"
          type="number"
          min="1"
          max="60"
          value={formData.pomodoroLongBreakMinutes}
          onChange={(e) => setFormData({ 
            ...formData, 
            pomodoroLongBreakMinutes: parseInt(e.target.value) || 15 
          })}
        />
      </div>

      <div>
        <Label htmlFor="cycles">Cycles before long break</Label>
        <Input
          id="cycles"
          type="number"
          min="2"
          max="8"
          value={formData.pomodoroCyclesBeforeLongBreak}
          onChange={(e) => setFormData({ 
            ...formData, 
            pomodoroCyclesBeforeLongBreak: parseInt(e.target.value) || 4 
          })}
        />
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          Save Settings
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
