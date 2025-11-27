import PropTypes from 'prop-types';
import {
  Grid,
  Box,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import ProductCard from './ProductCard';

/**
 * ProductGrid Component
 * 
 * Displays a grid of product cards with pagination support.
 * Used on category pages, search results, and featured product sections.
 * 
 * @component
 */
const ProductGrid = ({
  products = [],
  loading = false,
  error = null,
  page = 1,
  totalPages = 1,
  onPageChange,
  onProductClick,
  emptyMessage = 'No products found',
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
}) => {
  const handlePageChange = (event, value) => {
    if (onPageChange) {
      onPageChange(value);
    }
    // Scroll to top of grid on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or search query
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Product Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid
            item
            xs={columns.xs}
            sm={columns.sm}
            md={columns.md}
            lg={columns.lg}
            key={product.id}
          >
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.images?.[0]?.imageUrl || product.imageUrl || '/placeholder-toy.jpg'}
              rating={product.averageRating || product.rating || 0}
              reviewCount={product.reviewCount || 0}
              inStock={product.stockQuantity > 0 || product.inStock}
              isFeatured={product.isFeatured || false}
              isNew={product.isNew || false}
              onClick={onProductClick}
            />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 6,
            mb: 4,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPagination-ul': {
                flexWrap: 'wrap',
                justifyContent: 'center',
              },
            }}
          />
        </Box>
      )}

      {/* Result Summary */}
      <Box
        sx={{
          textAlign: 'center',
          mt: 2,
          mb: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
          {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
        </Typography>
      </Box>
    </Box>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      imageUrl: PropTypes.string,
      imageUrls: PropTypes.arrayOf(PropTypes.string),
      averageRating: PropTypes.number,
      rating: PropTypes.number,
      reviewCount: PropTypes.number,
      stockQuantity: PropTypes.number,
      inStock: PropTypes.bool,
      isFeatured: PropTypes.bool,
      isNew: PropTypes.bool,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  onProductClick: PropTypes.func,
  emptyMessage: PropTypes.string,
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
  }),
};

export default ProductGrid;
