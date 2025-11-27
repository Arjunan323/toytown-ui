import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useSelector } from 'react-redux';

/**
 * Product form component for creating and editing products.
 * Includes validation and all product fields.
 */
const ProductForm = ({ product, categories, manufacturers, onSubmit, onCancel }) => {
  const { loading } = useSelector((state) => state.adminProduct);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    minAge: '',
    maxAge: '',
    sku: '',
    categoryId: '',
    manufacturerId: '',
    isFeatured: false,
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing existing product
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stockQuantity: product.stockQuantity || '',
        minAge: product.minAge || '',
        maxAge: product.maxAge || '',
        sku: product.sku || '',
        categoryId: product.category?.id || '',
        manufacturerId: product.manufacturer?.id || '',
        isFeatured: product.isFeatured || false,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.stockQuantity === '' || formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity must be 0 or greater';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.manufacturerId) {
      newErrors.manufacturerId = 'Manufacturer is required';
    }

    if (formData.minAge && formData.minAge < 0) {
      newErrors.minAge = 'Minimum age must be 0 or greater';
    }

    if (formData.maxAge && formData.maxAge < 0) {
      newErrors.maxAge = 'Maximum age must be 0 or greater';
    }

    if (
      formData.minAge &&
      formData.maxAge &&
      parseInt(formData.minAge) > parseInt(formData.maxAge)
    ) {
      newErrors.maxAge = 'Maximum age must be greater than or equal to minimum age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      // Convert string numbers to actual numbers
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        minAge: formData.minAge ? parseInt(formData.minAge) : null,
        maxAge: formData.maxAge ? parseInt(formData.maxAge) : null,
        categoryId: parseInt(formData.categoryId),
        manufacturerId: parseInt(formData.manufacturerId),
      };

      onSubmit(submitData);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {product ? 'Edit Product' : 'Create New Product'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Product Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          {/* SKU */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              error={!!errors.sku}
              helperText={errors.sku}
              placeholder="e.g., TOY-001"
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          {/* Price */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              type="number"
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0, step: 0.01 },
              }}
            />
          </Grid>

          {/* Stock Quantity */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              type="number"
              label="Stock Quantity"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              error={!!errors.stockQuantity}
              helperText={errors.stockQuantity}
              InputProps={{
                inputProps: { min: 0 },
              }}
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required error={!!errors.categoryId}>
              <InputLabel>Category</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>Select Category</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.categoryId && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.categoryId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Manufacturer */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.manufacturerId}>
              <InputLabel>Manufacturer</InputLabel>
              <Select
                name="manufacturerId"
                value={formData.manufacturerId}
                onChange={handleChange}
                label="Manufacturer"
              >
                <MenuItem value="">
                  <em>Select Manufacturer</em>
                </MenuItem>
                {manufacturers.map((manufacturer) => (
                  <MenuItem key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.manufacturerId && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.manufacturerId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Min Age */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Age"
              name="minAge"
              value={formData.minAge}
              onChange={handleChange}
              error={!!errors.minAge}
              helperText={errors.minAge}
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: <InputAdornment position="end">years</InputAdornment>,
              }}
            />
          </Grid>

          {/* Max Age */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Age"
              name="maxAge"
              value={formData.maxAge}
              onChange={handleChange}
              error={!!errors.maxAge}
              helperText={errors.maxAge}
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: <InputAdornment position="end">years</InputAdornment>,
              }}
            />
          </Grid>

          {/* Featured Toggle */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Featured Product"
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProductForm;
