import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ProductTable } from '../../components/admin';
import {
  fetchAdminProducts,
  fetchLowStockProducts,
  discontinueProduct,
  reactivateProduct,
  updateProductStock,
  toggleFeaturedStatus,
  setProductFilters,
  clearAdminProductError,
} from '../../store/slices';

/**
 * Admin product list page.
 * Displays all products with filtering, pagination, and management actions.
 */
const AdminProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, pagination, filters, loading, error, lowStockProducts } = useSelector(
    (state) => state.adminProduct
  );

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Check if we're on the low-stock route
  const isLowStockView = location.pathname.includes('/low-stock');

  useEffect(() => {
    if (isLowStockView) {
      dispatch(fetchLowStockProducts());
    } else {
      dispatch(fetchAdminProducts({ ...filters, ...pagination }));
    }
  }, [dispatch, isLowStockView, filters.discontinued, filters.sortBy, filters.sortDir, pagination.page]);

  const handleFilterChange = (filterName, value) => {
    dispatch(setProductFilters({ [filterName]: value }));
  };

  const handlePageChange = (event, newPage) => {
    dispatch(fetchAdminProducts({ ...filters, page: newPage - 1, size: pagination.size }));
  };

  const handleEdit = (productId) => {
    navigate(`/admin/products/${productId}/edit`);
  };

  const handleDiscontinue = async (productId) => {
    setConfirmDialog({
      open: true,
      title: 'Discontinue Product',
      message: 'Are you sure you want to discontinue this product? It will no longer be visible to customers.',
      action: async () => {
        const result = await dispatch(discontinueProduct(productId));
        if (discontinueProduct.fulfilled.match(result)) {
          setSuccessMessage('Product discontinued successfully');
          dispatch(fetchAdminProducts({ ...filters, ...pagination }));
        }
      },
    });
  };

  const handleReactivate = async (productId) => {
    setConfirmDialog({
      open: true,
      title: 'Reactivate Product',
      message: 'Are you sure you want to reactivate this product?',
      action: async () => {
        const result = await dispatch(reactivateProduct(productId));
        if (reactivateProduct.fulfilled.match(result)) {
          setSuccessMessage('Product reactivated successfully');
          dispatch(fetchAdminProducts({ ...filters, ...pagination }));
        }
      },
    });
  };

  const handleUpdateStock = (product) => {
    const newQuantity = prompt(`Update stock quantity for "${product.name}":`, product.stockQuantity);
    
    if (newQuantity !== null && !isNaN(newQuantity) && newQuantity >= 0) {
      dispatch(updateProductStock({
        productId: product.id,
        stockQuantity: parseInt(newQuantity),
      })).then(() => {
        setSuccessMessage('Stock updated successfully');
        dispatch(fetchAdminProducts({ ...filters, ...pagination }));
      });
    }
  };

  const handleToggleFeatured = async (productId) => {
    const result = await dispatch(toggleFeaturedStatus(productId));
    if (toggleFeaturedStatus.fulfilled.match(result)) {
      setSuccessMessage('Featured status updated successfully');
      // Refresh product list to show updated status
      if (isLowStockView) {
        dispatch(fetchLowStockProducts());
      } else {
        dispatch(fetchAdminProducts({ ...filters, ...pagination }));
      }
    }
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action();
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          {isLowStockView ? 'Low Stock Alerts' : 'Products'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/products/create')}
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminProductError())}>
          {error}
        </Alert>
      )}

      {/* Filters - Hide filters on low stock view */}
      {!isLowStockView && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.discontinued ?? ''}
            onChange={(e) => handleFilterChange('discontinued', e.target.value === '' ? null : e.target.value === 'true')}
            label="Status"
          >
            <MenuItem value="">All Products</MenuItem>
            <MenuItem value="false">Active Only</MenuItem>
            <MenuItem value="true">Discontinued Only</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            label="Sort By"
          >
            <MenuItem value="createdDate">Created Date</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="price">Price</MenuItem>
            <MenuItem value="stockQuantity">Stock</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Direction</InputLabel>
          <Select
            value={filters.sortDir}
            onChange={(e) => handleFilterChange('sortDir', e.target.value)}
            label="Direction"
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Box>
      )}

      {/* Product Table */}
      <ProductTable
        products={isLowStockView ? lowStockProducts : products}
        onEdit={handleEdit}
        onDiscontinue={handleDiscontinue}
        onReactivate={handleReactivate}
        onUpdateStock={handleUpdateStock}
        onToggleFeatured={handleToggleFeatured}
      />

      {/* Pagination - Hide on low stock view */}
      {!isLowStockView && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page + 1}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={handleConfirmAction} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};

export default AdminProductList;
