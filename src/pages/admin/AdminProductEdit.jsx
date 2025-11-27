import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { ProductForm, ImageUpload } from '../../components/admin';
import {
  fetchAdminProductById,
  updateAdminProduct,
  uploadProductImages,
  deleteProductImage,
  setPrimaryProductImage,
  clearAdminProductError,
  resetCurrentProduct,
} from '../../store/slices';
import { categoryService, manufacturerService, adminProductService } from '../../services';

/**
 * Admin product edit page.
 * Form for editing existing products with image management.
 */
const AdminProductEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { currentProduct, loading, error, imageUploadProgress } = useSelector(
    (state) => state.adminProduct
  );

  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Fetch product and related data
    const fetchData = async () => {
      try {
        dispatch(fetchAdminProductById(id));
        
        const [categoriesData, manufacturersData, imagesData] = await Promise.all([
          categoryService.getAllCategories(),
          manufacturerService.getAllManufacturers(),
          adminProductService.getProductImages(id),
        ]);
        
        setCategories(categoriesData);
        setManufacturers(manufacturersData);
        setProductImages(imagesData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();

    return () => {
      dispatch(resetCurrentProduct());
    };
  }, [dispatch, id]);

  const handleSubmit = async (productData) => {
    const result = await dispatch(updateAdminProduct({ productId: id, productData }));
    
    if (updateAdminProduct.fulfilled.match(result)) {
      setSuccessMessage('Product updated successfully');
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleImageUpload = async (files, isPrimary) => {
    const result = await dispatch(uploadProductImages({
      productId: id,
      files,
      altTexts: files.map(() => currentProduct?.name || ''),
      isPrimary,
    }));

    if (uploadProductImages.fulfilled.match(result)) {
      setSuccessMessage('Images uploaded successfully');
      // Refresh images
      const imagesData = await adminProductService.getProductImages(id);
      setProductImages(imagesData);
    }
  };

  const handleImageDelete = async (imageId) => {
    const result = await dispatch(deleteProductImage({ productId: id, imageId }));
    
    if (deleteProductImage.fulfilled.match(result)) {
      setSuccessMessage('Image deleted successfully');
      // Refresh images
      const imagesData = await adminProductService.getProductImages(id);
      setProductImages(imagesData);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    const result = await dispatch(setPrimaryProductImage({ productId: id, imageId }));
    
    if (setPrimaryProductImage.fulfilled.match(result)) {
      setSuccessMessage('Primary image updated');
      // Refresh images
      const imagesData = await adminProductService.getProductImages(id);
      setProductImages(imagesData);
    }
  };

  if (loading && !currentProduct) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Edit Product
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminProductError())}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Product Details" />
        <Tab label="Images" />
      </Tabs>

      {activeTab === 0 && (
        <ProductForm
          product={currentProduct}
          categories={categories}
          manufacturers={manufacturers}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {activeTab === 1 && (
        <ImageUpload
          productId={id}
          images={productImages}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
          onSetPrimary={handleSetPrimaryImage}
          uploading={loading}
          uploadProgress={imageUploadProgress}
        />
      )}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};

export default AdminProductEdit;
