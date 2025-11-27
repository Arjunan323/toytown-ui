import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import ProductGrid from '../../components/product/ProductGrid';
import Spinner from '../../components/common/Spinner';
import {
  fetchFeaturedProducts,
  fetchNewArrivals,
  clearError,
} from '../../store/slices/productSlice';

/**
 * HomePage Component
 * 
 * Landing page with featured products, new arrivals, and category navigation.
 * Entry point for customer shopping experience.
 * 
 * @component
 */
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    featuredProducts,
    newArrivals,
    loading,
    error,
  } = useSelector((state) => state.product);

  useEffect(() => {
    // Fetch featured products and new arrivals on mount
    dispatch(fetchFeaturedProducts({ page: 0, size: 8 }));
    dispatch(fetchNewArrivals({ page: 0, size: 8 }));

    // Cleanup errors on unmount
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const handleViewAllFeatured = () => {
    navigate('/products?featured=true');
  };

  const handleViewAllNew = () => {
    navigate('/products?new=true');
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Sample categories - in production, fetch from API
  const categories = [
    {
      id: 1,
      name: 'Action Figures',
      image: '/images/categories/action-figures.jpg',
      description: 'Superheroes and adventure characters',
    },
    {
      id: 2,
      name: 'Building Blocks',
      image: '/images/categories/building-blocks.jpg',
      description: 'LEGO and construction toys',
    },
    {
      id: 3,
      name: 'Dolls & Soft Toys',
      image: '/images/categories/dolls.jpg',
      description: 'Plush toys and dolls',
    },
    {
      id: 4,
      name: 'Educational',
      image: '/images/categories/educational.jpg',
      description: 'Learning and STEM toys',
    },
    {
      id: 5,
      name: 'Board Games',
      image: '/images/categories/board-games.jpg',
      description: 'Family games and puzzles',
    },
    {
      id: 6,
      name: 'Outdoor Toys',
      image: '/images/categories/outdoor.jpg',
      description: 'Sports and outdoor activities',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Welcome to Aadhav's ToyTown
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Discover amazing toys that inspire imagination and creativity
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/products')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Shop Now
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                <img
                  src="/images/hero-toys.png"
                  alt="Colorful toys"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        {/* Categories Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CategoryIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h2" fontWeight="bold">
              Shop by Category
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={2} key={category.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={category.image}
                    alt={category.name}
                    sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
                  />
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Featured Products Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight="bold">
              ⭐ Featured Products
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllFeatured}
            >
              View All
            </Button>
          </Box>
          {loading && !featuredProducts.length ? (
            <Spinner />
          ) : (
            <ProductGrid
              products={featuredProducts}
              loading={false}
              error={null}
              onProductClick={handleProductClick}
              emptyMessage="No featured products available"
              columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            />
          )}
        </Box>

        {/* New Arrivals Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight="bold">
              🎉 New Arrivals
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllNew}
            >
              View All
            </Button>
          </Box>
          {loading && !newArrivals.length ? (
            <Spinner />
          ) : (
            <ProductGrid
              products={newArrivals}
              loading={false}
              error={null}
              onProductClick={handleProductClick}
              emptyMessage="No new arrivals yet"
              columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            />
          )}
        </Box>

        {/* Why Choose Us Section */}
        <Box sx={{ mb: 8, bgcolor: 'grey.50', p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
            Why Choose Aadhav's ToyTown?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ mb: 2 }}>
                  🚚
                </Typography>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Free Shipping
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Free shipping on all orders above ₹500
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ mb: 2 }}>
                  🔒
                </Typography>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Secure Payments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  100% secure payment with Razorpay
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ mb: 2 }}>
                  ✓
                </Typography>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Authentic Products
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  100% authentic toys from trusted brands
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
