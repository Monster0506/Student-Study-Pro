import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateRangeSelectorProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ value, onChange, options }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-[180px]">
      <SelectValue placeholder="Select date range" />
    </SelectTrigger>
    <SelectContent>
      {options.map(opt => (
        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
); 