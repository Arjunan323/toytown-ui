import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';

/**
 * CategoryForm component for creating and editing categories.
 */
const CategoryForm = ({ open, onClose, onSubmit, category, parentCategories, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: '',
    displayOrder: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentCategoryId: category.parentCategoryId || '',
        displayOrder: category.displayOrder || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        parentCategoryId: '',
        displayOrder: '',
        isActive: true
      });
    }
    setErrors({});
  }, [category, open]);

  const handleChange = (field) => (event) => {
    const value = field === 'isActive' ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Category name must not exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    if (formData.displayOrder && formData.displayOrder <= 0) {
      newErrors.displayOrder = 'Display order must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        ...formData,
        parentCategoryId: formData.parentCategoryId || null,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder, 10) : null
      };
      onSubmit(submitData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {category ? 'Edit Category' : 'Create New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Parent Category"
              value={formData.parentCategoryId}
              onChange={handleChange('parentCategoryId')}
              select
              fullWidth
              helperText="Leave empty for top-level category"
            >
              <MenuItem value="">None (Top-level category)</MenuItem>
              {parentCategories && parentCategories.map((parent) => (
                <MenuItem
                  key={parent.id}
                  value={parent.id}
                  disabled={category && parent.id === category.id}
                >
                  {parent.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={handleChange('displayOrder')}
              error={!!errors.displayOrder}
              helperText={errors.displayOrder || 'Leave empty for auto-assignment'}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange('isActive')}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
          >
            {category ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

CategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  category: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    parentCategoryId: PropTypes.number,
    displayOrder: PropTypes.number,
    isActive: PropTypes.bool
  }),
  parentCategories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  isLoading: PropTypes.bool
};

export default CategoryForm;
