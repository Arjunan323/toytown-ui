import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Chip,
  Button,
  Drawer,
  IconButton,
  Alert,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import ProductGrid from '../../components/product/ProductGrid';
import {
  fetchProductsByCategory,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
} from '../../store/slices/productSlice';

/**
 * CategoryPage Component
 * 
 * Browse products by category with filtering and sorting options.
 * Supports price range, age range, and manufacturer filters.
 * 
 * @component
 */
const CategoryPage = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const {
    products,
    loading,
    error,
    filters,
    pagination,
  } = useSelector((state) => state.product);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [ageRange, setAgeRange] = useState([0, 18]);

  // Category name - in production, fetch from API
  const categoryName = getCategoryName(categoryId);

  useEffect(() => {
    // Fetch products for this category
    const page = parseInt(searchParams.get('page') || '1') - 1; // Convert to 0-based
    const params = {
      page,
      size: 12,
      sort: sortBy,
    };

    dispatch(fetchProductsByCategory({ categoryId, params }));

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, categoryId, searchParams, sortBy]);

  const handlePageChange = (page) => {
    searchParams.set('page', page.toString());
    setSearchParams(searchParams);
    dispatch(setPagination({ page: page - 1, size: 12 }));
  };

  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSortBy(newSort);
    searchParams.set('sort', newSort);
    searchParams.delete('page'); // Reset to page 1
    setSearchParams(searchParams);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceRangeCommitted = () => {
    dispatch(setFilters({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    }));
    // Re-fetch with new filters
    dispatch(fetchProductsByCategory({
      categoryId,
      params: {
        page: 0,
        size: 12,
        sort: sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      },
    }));
  };

  const handleAgeRangeChange = (event, newValue) => {
    setAgeRange(newValue);
  };

  const handleAgeRangeCommitted = () => {
    dispatch(setFilters({
      minAge: ageRange[0],
      maxAge: ageRange[1],
    }));
  };

  const handleClearFilters = () => {
    setPriceRange([0, 10000]);
    setAgeRange([0, 18]);
    dispatch(clearFilters());
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  const hasActiveFilters = 
    filters.minPrice > 0 || 
    (filters.maxPrice && filters.maxPrice < 10000) || 
    filters.minAge > 0 || 
    filters.maxAge < 18;

  // Filter panel component
  const FiltersPanel = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          Filters
        </Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Price Range Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceRangeChange}
          onChangeCommitted={handlePriceRangeCommitted}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
          valueLabelFormat={(value) => `₹${value}`}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            ₹{priceRange[0]}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ₹{priceRange[1]}
          </Typography>
        </Box>
      </Box>

      {/* Age Range Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Age Range (years)
        </Typography>
        <Slider
          value={ageRange}
          onChange={handleAgeRangeChange}
          onChangeCommitted={handleAgeRangeCommitted}
          valueLabelDisplay="auto"
          min={0}
          max={18}
          step={1}
          valueLabelFormat={(value) => `${value}+`}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {ageRange[0]} years
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {ageRange[1]} years
          </Typography>
        </Box>
      </Box>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Active Filters
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.minPrice > 0 && (
              <Chip
                label={`Min: ₹${filters.minPrice}`}
                size="small"
                onDelete={() => {
                  setPriceRange([0, priceRange[1]]);
                  handlePriceRangeCommitted();
                }}
              />
            )}
            {filters.maxPrice && filters.maxPrice < 10000 && (
              <Chip
                label={`Max: ₹${filters.maxPrice}`}
                size="small"
                onDelete={() => {
                  setPriceRange([priceRange[0], 10000]);
                  handlePriceRangeCommitted();
                }}
              />
            )}
            {filters.minAge > 0 && (
              <Chip
                label={`Age: ${filters.minAge}+ years`}
                size="small"
                onDelete={() => {
                  setAgeRange([0, ageRange[1]]);
                  handleAgeRangeCommitted();
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );

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
        <Typography color="text.primary">Categories</Typography>
        <Typography color="text.primary">{categoryName}</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {categoryName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore our collection of {categoryName.toLowerCase()}
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        {/* Mobile Filter Button */}
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setMobileFiltersOpen(true)}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          Filters
        </Button>

        {/* Sort Dropdown */}
        <FormControl size="small" sx={{ minWidth: 200, ml: 'auto' }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="name">Name (A-Z)</MenuItem>
            <MenuItem value="name,desc">Name (Z-A)</MenuItem>
            <MenuItem value="price">Price (Low to High)</MenuItem>
            <MenuItem value="price,desc">Price (High to Low)</MenuItem>
            <MenuItem value="createdDate,desc">Newest First</MenuItem>
            <MenuItem value="averageRating,desc">Highest Rated</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Desktop Filters Sidebar */}
        <Box sx={{ width: 280, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <FiltersPanel />
        </Box>

        {/* Mobile Filters Drawer */}
        <Drawer
          anchor="left"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <Box sx={{ width: 280, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Filters</Typography>
              <IconButton onClick={() => setMobileFiltersOpen(false)}>
                <ClearIcon />
              </IconButton>
            </Box>
            <FiltersPanel />
          </Box>
        </Drawer>

        {/* Product Grid */}
        <Box sx={{ flexGrow: 1 }}>
          <ProductGrid
            products={products}
            loading={loading}
            error={null}
            page={pagination.page + 1} // Convert to 1-based for display
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            emptyMessage={`No products found in ${categoryName}`}
            columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}
          />
        </Box>
      </Box>
    </Container>
  );
};

// Helper function to get category name
function getCategoryName(categoryId) {
  const categories = {
    '1': 'Action Figures',
    '2': 'Building Blocks',
    '3': 'Dolls & Soft Toys',
    '4': 'Educational Toys',
    '5': 'Board Games',
    '6': 'Outdoor Toys',
  };
  return categories[categoryId] || 'Products';
}

export default CategoryPage;
