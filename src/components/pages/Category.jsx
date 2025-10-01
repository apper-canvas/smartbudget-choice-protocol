import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { categoryService } from '@/services/api/categoryService';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import CategoryModal from '@/components/organisms/CategoryModal';

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoryService.delete(id);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    setEditingCategory(null);
    if (shouldRefresh) {
      loadCategories();
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCategories} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={handleAddCategory}>
          <ApperIcon name="Plus" size={20} />
          <span>Add Category</span>
        </Button>
      </div>

      {categories.length === 0 ? (
        <Empty 
          message="No categories yet" 
          description="Create your first category to organize your transactions"
          actionLabel="Add Category"
          onAction={handleAddCategory}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.Id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  >
                    <ApperIcon name="FolderOpen" size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <Badge variant={category.type === 'income' ? 'success' : 'error'}>
                      {category.type === 'income' ? 'Income' : 'Expense'}
                    </Badge>
                  </div>
                </div>
              </div>

              {category.isDefault && (
                <div className="mb-3">
                  <Badge variant="info" className="text-xs">Default</Badge>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                  className="flex-1"
                >
                  <ApperIcon name="Edit2" size={16} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.Id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:border-red-600"
                  disabled={category.isDefault}
                >
                  <ApperIcon name="Trash2" size={16} />
                  <span>Delete</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}