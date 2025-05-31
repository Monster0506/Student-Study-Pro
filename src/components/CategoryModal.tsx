
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EventCategory } from '@/types';
import { useCategories } from '@/hooks/useCategories';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: EventCategory | null;
}

export const CategoryModal = ({ isOpen, onClose, category }: CategoryModalProps) => {
  const { createCategory, updateCategory } = useCategories();

  const [formData, setFormData] = useState({
    name: '',
    colorHex: '#3B82F6',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        colorHex: category.colorHex,
      });
    } else {
      setFormData({
        name: '',
        colorHex: '#3B82F6',
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (category) {
      updateCategory({ ...formData, id: category.id, isDefault: category.isDefault });
    } else {
      createCategory(formData);
    }

    onClose();
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4',
    '#84CC16', '#EC4899', '#6366F1', '#F97316', '#14B8A6', '#A855F7'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Add Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Study Session"
              required
            />
          </div>

          <div>
            <Label>Category Color</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.colorHex === color ? 'border-gray-800 dark:border-gray-200' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, colorHex: color })}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {category ? 'Update Category' : 'Add Category'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
