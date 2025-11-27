import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { ProductForm } from '../../components/admin';
import { createAdminProduct, clearAdminProductError } from '../../store/slices';
import { categoryService, manufacturerService } from '../../services';

/**
 * Admin product create page.
 * Form for creating new products.
 */
const AdminProductCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.adminProduct);

  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch categories and manufacturers for dropdowns
    const fetchData = async () => {
      try {
        const [categoriesData, manufacturersData] = await Promise.all([
          categoryService.getAllCategories(),
          manufacturerService.getAllManufacturers(),
        ]);
        setCategories(categoriesData);
        setManufacturers(manufacturersData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (productData) => {
    const result = await dispatch(createAdminProduct(productData));
    
    if (createAdminProduct.fulfilled.match(result)) {
      setSuccessMessage('Product created successfully');
      setTimeout(() => {
        navigate(`/admin/products/${result.payload.id}/edit`);
      }, 1500);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Create Product
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminProductError())}>
          {error}
        </Alert>
      )}

      <ProductForm
        product={null}
        categories={categories}
        manufacturers={manufacturers}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};

export default AdminProductCreate;
