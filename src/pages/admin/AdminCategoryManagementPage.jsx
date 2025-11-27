import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent
} from '@mui/material';
import { Add } from '@mui/icons-material';
import CategoryTree from '../../components/admin/CategoryTree';
import CategoryForm from '../../components/admin/CategoryForm';
import CategoryStatusToggle from '../../components/admin/CategoryStatusToggle';
import {
  fetchCategoryTree,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  toggleCategoryStatus,
  clearAdminCategoryError,
  clearAdminCategorySuccess
} from '../../store/adminCategorySlice';

/**
 * AdminCategoryManagementPage component for managing categories.
 * Provides CRUD operations, soft delete, and category reordering.
 */
const AdminCategoryManagementPage = () => {
  const dispatch = useDispatch();
  const {
    categoryTree,
    categories,
    loading,
    error,
    success
  } = useSelector((state) => state.adminCategory);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchCategoryTree());
    dispatch(fetchAdminCategories({ page: 0, size: 1000 }));
  }, [dispatch]);

  const handleCreateClick = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await dispatch(updateAdminCategory({
          id: editingCategory.id,
          categoryData: formData
        })).unwrap();
      } else {
        await dispatch(createAdminCategory(formData)).unwrap();
      }
      handleFormClose();
      dispatch(fetchCategoryTree());
      dispatch(fetchAdminCategories({ page: 0, size: 1000 }));
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to save category:', err);
    }
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      try {
        await dispatch(deleteAdminCategory(selectedCategory.id)).unwrap();
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
        dispatch(fetchCategoryTree());
        dispatch(fetchAdminCategories({ page: 0, size: 1000 }));
      } catch (err) {
        // Error is handled by Redux state
        console.error('Failed to delete category:', err);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      await dispatch(toggleCategoryStatus(categoryId)).unwrap();
      dispatch(fetchCategoryTree());
      dispatch(fetchAdminCategories({ page: 0, size: 1000 }));
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to toggle category status:', err);
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleCloseSnackbar = () => {
    dispatch(clearAdminCategoryError());
    dispatch(clearAdminCategorySuccess());
  };

  // Get parent categories for form (excluding inactive and current category)
  const parentCategories = categories.content.filter((cat) => cat.isActive);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateClick}
        >
          Create Category
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category Tree
            </Typography>
            {loading && categoryTree.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                Loading categories...
              </Typography>
            ) : (
              <CategoryTree
                categories={categoryTree}
                onSelectCategory={handleSelectCategory}
                selectedCategoryId={selectedCategory?.id}
              />
            )}
          </CardContent>
        </Card>

        {selectedCategory && (
          <Card sx={{ width: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Category Details
                </Typography>
                <CategoryStatusToggle
                  category={selectedCategory}
                  onToggle={handleToggleStatus}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedCategory.name}
                  </Typography>
                </Box>
                {selectedCategory.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedCategory.description}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Display Order
                  </Typography>
                  <Typography variant="body2">
                    {selectedCategory.displayOrder}
                  </Typography>
                </Box>
                {selectedCategory.parentCategoryName && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Parent Category
                    </Typography>
                    <Typography variant="body2">
                      {selectedCategory.parentCategoryName}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleEditClick(selectedCategory)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => handleDeleteClick(selectedCategory)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      <CategoryForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        parentCategories={parentCategories}
        isLoading={loading}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category &quot;{selectedCategory?.name}&quot;?
            This action will soft delete the category (set as inactive).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          variant="filled"
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCategoryManagementPage;
