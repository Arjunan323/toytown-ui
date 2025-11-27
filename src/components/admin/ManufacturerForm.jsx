import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';

/**
 * ManufacturerForm component for creating and editing manufacturers.
 */
const ManufacturerForm = ({ open, onClose, onSubmit, manufacturer, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    websiteUrl: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (manufacturer) {
      setFormData({
        name: manufacturer.name || '',
        description: manufacturer.description || '',
        country: manufacturer.country || '',
        websiteUrl: manufacturer.websiteUrl || '',
        isActive: manufacturer.isActive !== undefined ? manufacturer.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        country: '',
        websiteUrl: '',
        isActive: true
      });
    }
    setErrors({});
  }, [manufacturer, open]);

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
      newErrors.name = 'Manufacturer name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Manufacturer name must not exceed 100 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.country && formData.country.length > 100) {
      newErrors.country = 'Country must not exceed 100 characters';
    }

    if (formData.websiteUrl && formData.websiteUrl.length > 255) {
      newErrors.websiteUrl = 'Website URL must not exceed 255 characters';
    }

    // Basic URL validation
    if (formData.websiteUrl && formData.websiteUrl.trim()) {
      try {
        new URL(formData.websiteUrl);
      } catch {
        newErrors.websiteUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {manufacturer ? 'Edit Manufacturer' : 'Create New Manufacturer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Manufacturer Name"
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
              label="Country"
              value={formData.country}
              onChange={handleChange('country')}
              error={!!errors.country}
              helperText={errors.country}
              fullWidth
            />
            <TextField
              label="Website URL"
              value={formData.websiteUrl}
              onChange={handleChange('websiteUrl')}
              error={!!errors.websiteUrl}
              helperText={errors.websiteUrl}
              placeholder="https://www.example.com"
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
            {manufacturer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

ManufacturerForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  manufacturer: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    country: PropTypes.string,
    websiteUrl: PropTypes.string,
    isActive: PropTypes.bool
  }),
  isLoading: PropTypes.bool
};

export default ManufacturerForm;
