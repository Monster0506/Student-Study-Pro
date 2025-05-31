
import { X, Plus, BookOpen, Brain, User, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/types/event';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: () => void;
}

export const Sidebar = ({ isOpen, onClose, onAddEvent }: SidebarProps) => {
  const eventTypeIcons = {
    CLASS: BookOpen,
    STUDY: Brain,
    PERSONAL: User,
    APPOINTMENT: CalendarIcon
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-80 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <Button 
            onClick={onAddEvent}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Event Types</h3>
            <div className="space-y-2">
              {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => {
                const Icon = eventTypeIcons[type as keyof typeof eventTypeIcons];
                const colorClass = EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS];
                
                return (
                  <div key={type} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>This Week</span>
                  <span className="font-medium">12 events</span>
                </div>
                <div className="flex justify-between">
                  <span>Study Hours</span>
                  <span className="font-medium">8.5h</span>
                </div>
                <div className="flex justify-between">
                  <span>Classes</span>
                  <span className="font-medium">6</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </>
  );
};
