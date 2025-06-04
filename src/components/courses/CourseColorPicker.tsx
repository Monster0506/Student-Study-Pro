import React from 'react';

interface CourseColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const colorOptions = [
  // Greens
  '#10B981', '#22C55E', '#65A30D', '#A3E635',
  // Blues
  '#3B82F6', '#2563EB', '#0EA5E9', '#38BDF8',
  // Purples
  '#8B5CF6', '#A21CAF', '#C084FC', '#7C3AED',
  // Oranges
  '#F59E0B', '#F97316', '#FB923C', '#FDBA74',
  // Reds
  '#EF4444', '#DC2626', '#F87171', '#FCA5A5',
  // Teals/Cyans
  '#06B6D4', '#14B8A6', '#2DD4BF', '#67E8F9',
  // Pinks
  '#EC4899', '#DB2777', '#F472B6', '#F9A8D4',
  // Yellows
  '#FACC15', '#FDE68A', '#FCD34D', '#CA8A04',
  // Grays/Neutrals
  '#64748B', '#A3A3A3', '#F3F4F6', '#1E293B',
];

export const CourseColorPicker: React.FC<CourseColorPickerProps> = ({ color, onChange }) => (
  <div className="grid grid-cols-6 gap-2 mt-2">
    {colorOptions.map((c) => (
      <button
        key={c}
        type="button"
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 ${
          color === c
            ? 'border-4 border-blue-600 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900'
            : 'border-gray-300 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-300'
        }`}
        style={{ backgroundColor: c }}
        aria-label={`Select color ${c}`}
        onClick={() => onChange(c)}
      >
        {color === c && (
          <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    ))}
  </div>
); 