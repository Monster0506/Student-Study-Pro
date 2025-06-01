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
import { RadioGroup } from '@radix-ui/react-radio-group';

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
  monthlyType?: 'dayOfMonth' | 'nthWeekday' | 'lastWeekday';
  nthWeek?: number;
  weekday?: number;
  endAfterOccurrences?: number;
}

const weekOptions = [
  { value: 1, label: 'First' },
  { value: 2, label: 'Second' },
  { value: 3, label: 'Third' },
  { value: 4, label: 'Fourth' },
  { value: -1, label: 'Last' },
];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  const [endType, setEndType] = useState<'date' | 'occurrences'>(settings.endAfterOccurrences ? 'occurrences' : 'date');

  const handleSave = () => {
    const newSettings = { ...settings };
    if (endType === 'date') {
      newSettings.endAfterOccurrences = undefined;
    } else {
      newSettings.endDate = undefined;
    }
    onSave(newSettings);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 dark:text-gray-100">
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
              <SelectTrigger className="dark:bg-gray-800 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100">
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
                    className="w-20 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
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
                          className="dark:bg-gray-800 dark:border-gray-600"
                        />
                        <Label htmlFor={`day-${index}`} className="text-sm dark:text-gray-100">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>End</Label>
                <RadioGroup
                  className="flex space-x-4 mt-2"
                  value={endType}
                  onValueChange={v => setEndType(v as 'date' | 'occurrences')}
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="date"
                      checked={endType === 'date'}
                      onChange={() => setEndType('date')}
                      className="accent-blue-600"
                    />
                    <span>By date</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="occurrences"
                      checked={endType === 'occurrences'}
                      onChange={() => setEndType('occurrences')}
                      className="accent-blue-600"
                    />
                    <span>After N occurrences</span>
                  </label>
                </RadioGroup>
                {endType === 'date' && (
                  <div className="mt-2">
                    <Label htmlFor="endDate">End date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={settings.endDate ? settings.endDate.toISOString().split('T')[0] : ''}
                      onChange={e => setSettings({ ...settings, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                      className="dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                )}
                {endType === 'occurrences' && (
                  <div className="mt-2">
                    <Label htmlFor="endAfterOccurrences">End after N occurrences</Label>
                    <Input
                      id="endAfterOccurrences"
                      type="number"
                      min="1"
                      value={settings.endAfterOccurrences || ''}
                      onChange={e => setSettings({ ...settings, endAfterOccurrences: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-24 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {settings.frequency === 'monthly' && (
            <div className="space-y-2">
              <Label>Monthly pattern</Label>
              <Select
                value={settings.monthlyType || 'dayOfMonth'}
                onValueChange={(value) => setSettings({ ...settings, monthlyType: value as any })}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100">
                  <SelectItem value="dayOfMonth">On day of the month</SelectItem>
                  <SelectItem value="nthWeekday">On the Nth weekday (e.g., 2nd Tuesday)</SelectItem>
                  <SelectItem value="lastWeekday">On the last weekday (e.g., last Friday)</SelectItem>
                </SelectContent>
              </Select>
              {settings.monthlyType === 'nthWeekday' && (
                <div className="flex space-x-2">
                  <Select
                    value={settings.nthWeek?.toString() || '1'}
                    onValueChange={v => setSettings({ ...settings, nthWeek: parseInt(v) })}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:text-gray-100"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100">
                      {weekOptions.filter(w => w.value !== -1).map(opt => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={settings.weekday?.toString() || '1'}
                    onValueChange={v => setSettings({ ...settings, weekday: parseInt(v) })}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:text-gray-100"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100">
                      {dayNames.map((d, i) => (
                        <SelectItem key={i} value={i.toString()}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {settings.monthlyType === 'lastWeekday' && (
                <div className="flex space-x-2">
                  <span>Last</span>
                  <Select
                    value={settings.weekday?.toString() || '1'}
                    onValueChange={v => setSettings({ ...settings, weekday: parseInt(v), nthWeek: -1 })}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:text-gray-100"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100">
                      {dayNames.map((d, i) => (
                        <SelectItem key={i} value={i.toString()}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
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
