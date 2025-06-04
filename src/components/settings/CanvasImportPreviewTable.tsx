import React from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface CanvasImportPreviewTableProps {
  importPreview: any[];
  onRemovePreviewItem: (idx: number) => void;
  typeIcon: (type: string) => React.ReactNode;
}

export const CanvasImportPreviewTable: React.FC<CanvasImportPreviewTableProps> = ({
  importPreview,
  onRemovePreviewItem,
  typeIcon,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm border-separate border-spacing-y-1">
      <thead>
        <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
          <th className="px-2 py-1">Type</th>
          <th className="px-2 py-1">Title</th>
          <th className="px-2 py-1">Course</th>
          <th className="px-2 py-1">Due/Posted</th>
          <th className="px-2 py-1">Remove</th>
        </tr>
      </thead>
      <tbody>
        {importPreview.map((item, idx) => (
          <tr key={item.id || idx} className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition">
            <td className="px-2 py-1">
              {typeIcon(item.canvas_type)}
            </td>
            <td className="px-2 py-1 max-w-[180px] truncate" title={item.title}>{item.title}</td>
            <td className="px-2 py-1 max-w-[120px] truncate" title={item.course}>{item.course}</td>
            <td className="px-2 py-1 whitespace-nowrap" title={item.due_at}>
              {item.due_at ? format(new Date(item.due_at), 'MMM d, yyyy h:mm a') : ''}
            </td>
            <td className="px-2 py-1">
              <button
                className="text-red-600 hover:text-red-800 font-bold"
                onClick={() => onRemovePreviewItem(idx)}
                title="Remove from import"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
); 