import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
} from '@mui/icons-material';
import ProductDetail from '../../components/product/ProductDetail';
import ReviewList from '../../components/product/ReviewList';
import ReviewForm from '../../components/product/ReviewForm';
import {
  fetchProductById,
  clearCurrentProduct,
  clearError,
} from '../../store/slices/productSlice';
import {
  fetchProductReviews,
  selectProductReviews,
  selectReviewsLoading,
  clearReviews,
} from '../../store/slices/reviewSlice';

/**
 * ProductDetailPage Component
 * 
 * Full product details page with image gallery, specifications, reviews,
 * and add-to-cart functionality.
 * 
 * @component
 */
const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentProduct,
    loading,
    error,
  } = useSelector((state) => state.product);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const reviews = useSelector((state) => selectProductReviews(state, productId));
  const reviewsLoading = useSelector(selectReviewsLoading);

  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Fetch product details
    if (productId) {
      dispatch(fetchProductById(productId));
      dispatch(fetchProductReviews({ productId, page: 0, size: 10 }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentProduct());
      dispatch(clearError());
      dispatch(clearReviews());
    };
  }, [dispatch, productId]);

  const handleReviewSubmitted = () => {
    // Refresh reviews after submission
    dispatch(fetchProductReviews({ productId, page: 0, size: 10 }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Loading skeleton
  if (loading && !currentProduct) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Skeleton width={60} />
          <Skeleton width={100} />
          <Skeleton width={150} />
        </Breadcrumbs>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Skeleton variant="rectangular" width="50%" height={500} />
          <Box sx={{ width: '50%' }}>
            <Skeleton width="80%" height={60} sx={{ mb: 2 }} />
            <Skeleton width="40%" height={40} sx={{ mb: 2 }} />
            <Skeleton width="60%" height={80} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={200} />
          </Box>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => {
            dispatch(clearError());
            navigate('/products');
          }}
        >
          {error}
        </Alert>
        <Typography variant="h5" textAlign="center" color="text.secondary">
          Product not found or failed to load
        </Typography>
      </Container>
    );
  }

  // No product found
  if (!currentProduct && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Product not found
        </Alert>
        <Typography variant="h5" textAlign="center" color="text.secondary">
          The product you're looking for doesn't exist
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Link
          color="inherit"
          href="/products"
          sx={{ textDecoration: 'none' }}
        >
          Products
        </Link>
        {currentProduct?.category && (
          <Link
            color="inherit"
            href={`/category/${currentProduct.category.id || 1}`}
            sx={{ textDecoration: 'none' }}
          >
            {currentProduct.category.name || currentProduct.category}
          </Link>
        )}
        <Typography color="text.primary">
          {currentProduct?.name || 'Product Details'}
        </Typography>
      </Breadcrumbs>

      {/* Product Detail Component */}
      {currentProduct && (
        <ProductDetail
          product={currentProduct}
        />
      )}

      {/* Tabs for Description and Reviews */}
      <Paper sx={{ mt: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Description" />
          <Tab label={`Reviews (${reviews?.totalElements || 0})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Description Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Product Description
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {currentProduct?.description || 'No description available.'}
              </Typography>
            </Box>
          )}

          {/* Reviews Tab */}
          {tabValue === 1 && (
            <Box>
              <ReviewList reviews={reviews} loading={reviewsLoading} />
              
              {isAuthenticated && (
                <ReviewForm
                  productId={productId}
                  onSuccess={handleReviewSubmitted}
                />
              )}

              {!isAuthenticated && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    Please <Link href="/login" sx={{ textDecoration: 'none' }}>sign in</Link> to write a review.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Related Products Section - TODO: Implement */}
      {/* <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          You May Also Like
        </Typography>
        <ProductGrid
          products={relatedProducts}
          columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        />
      </Box> */}
    </Container>
  );
};

export default ProductDetailPage;
