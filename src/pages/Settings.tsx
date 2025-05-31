
import { useState } from 'react';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { useCategories } from '@/hooks/useCategories';
import { usePreferences } from '@/hooks/usePreferences';
import { CategoryModal } from '@/components/CategoryModal';
import { EventCategory } from '@/types';

const Settings = () => {
  const { user, loading } = useAuth();
  const { categories, deleteCategory } = useCategories();
  const { preferences, updatePreferences } = usePreferences();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [reminderSettings, setReminderSettings] = useState({
    defaultReminderMinutes: preferences?.defaultReminderMinutes || 15,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm 
        onToggleMode={() => setIsSignUp(!isSignUp)}
        isSignUp={isSignUp}
      />
    );
  }

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? Events using this category will be uncategorized.')) {
      deleteCategory(categoryId);
    }
  };

  const handleSaveReminderSettings = () => {
    updatePreferences(reminderSettings);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Event Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Event Categories</CardTitle>
            <Button onClick={handleAddCategory} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.colorHex }}
                  />
                  <span className="font-medium">{category.name}</span>
                  {category.isDefault && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!category.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reminder Settings */}
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
              value={reminderSettings.defaultReminderMinutes}
              onChange={(e) => setReminderSettings({
                ...reminderSettings,
                defaultReminderMinutes: parseInt(e.target.value) || 15
              })}
              className="w-32"
            />
          </div>
          <Button onClick={handleSaveReminderSettings} className="bg-blue-600 hover:bg-blue-700">
            Save Reminder Settings
          </Button>
        </CardContent>
      </Card>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
};

export default Settings;
