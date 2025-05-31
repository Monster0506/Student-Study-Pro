import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  BarChart3, 
  Timer, 
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

const navigationItems = [
  { path: '/', label: 'Calendar', icon: Calendar },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/timer', label: 'Timer', icon: Timer },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Navigation = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const NavItems = () => (
    <nav className={`${isMobile ? 'space-y-1' : 'flex items-center space-x-1'}`}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="h-5 w-5 mr-3" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavItems />
            </div>
            <div className="p-4 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {theme === 'dark' ? (
                      <Moon className="h-4 w-4 mr-2" />
                    ) : theme === 'light' ? (
                      <Sun className="h-4 w-4 mr-2" />
                    ) : (
                      <Monitor className="h-4 w-4 mr-2" />
                    )}
                    Theme
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-8">
              Student<span className="text-blue-600">StudyPro</span>
            </h1>
            <NavItems />
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start">
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4 mr-2" />
                  ) : theme === 'light' ? (
                    <Sun className="h-4 w-4 mr-2" />
                  ) : (
                    <Monitor className="h-4 w-4 mr-2" />
                  )}
                  Theme
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
