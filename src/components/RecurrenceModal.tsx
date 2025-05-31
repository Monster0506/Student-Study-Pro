import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface RecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recurrence: RecurrenceSettings) => void;
  initialSettings?: RecurrenceSettings;
}

export interface RecurrenceSettings {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek: number[];
  endDate?: Date;
  occurrences?: number;
}

export const RecurrenceModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialSettings 
}: RecurrenceModalProps) => {
  const [settings, setSettings] = useState<RecurrenceSettings>(
    initialSettings || {
      frequency: 'none',
      interval: 1,
      daysOfWeek: [],
    }
  );

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const toggleDayOfWeek = (day: number) => {
    setSettings(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Recurring Event Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="frequency">Repeat</Label>
            <Select
              value={settings.frequency}
              onValueChange={(value: 'none' | 'daily' | 'weekly' | 'monthly') => 
                setSettings({ ...settings, frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.frequency !== 'none' && (
            <>
              <div>
                <Label htmlFor="interval">Repeat every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={settings.interval}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      interval: parseInt(e.target.value) || 1 
                    })}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">
                    {settings.frequency === 'daily' ? 'day(s)' : 
                     settings.frequency === 'weekly' ? 'week(s)' : 'month(s)'}
                  </span>
                </div>
              </div>

              {settings.frequency === 'weekly' && (
                <div>
                  <Label>Repeat on</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {dayNames.map((day, index) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${index}`}
                          checked={settings.daysOfWeek.includes(index)}
                          onCheckedChange={() => toggleDayOfWeek(index)}
                        />
                        <Label htmlFor={`day-${index}`} className="text-sm">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="endDate">End date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={settings.endDate ? settings.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    endDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
