import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import React from 'react';

interface ReminderSettingsSectionProps {
  defaultReminderMinutes: number;
  onChange: (minutes: number) => void;
  onSave: () => void;
}

export const ReminderSettingsSection: React.FC<ReminderSettingsSectionProps> = ({
  defaultReminderMinutes,
  onChange,
  onSave,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Default Reminder Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="defaultReminder">Default reminder time (minutes before event)</Label>
        <Input
          id="defaultReminder"
          type="number"
          value={defaultReminderMinutes}
          onChange={(e) => onChange(parseInt(e.target.value) || 15)}
          className="w-32"
        />
      </div>
      <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
        Save Reminder Settings
      </Button>
    </CardContent>
  </Card>
); 