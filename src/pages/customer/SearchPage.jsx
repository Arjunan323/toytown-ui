import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Pagination,
  Paper,
} from '@mui/material';
import { FilterList as FilterListIcon, Close as CloseIcon } from '@mui/icons-material';
import SearchBar from '../../components/search/SearchBar';
import SearchFilters from '../../components/search/SearchFilters';
import NoResults from '../../components/search/NoResults';
import ProductGrid from '../../components/product/ProductGrid';
import VirtualizedProductGrid from '../../components/product/VirtualizedProductGrid';
import ProductGridSkeleton from '../../components/common/ProductGridSkeleton';
import productService from '../../services/productService';
import {
  searchProductsAsync,
  setSearchQuery,
  setFilters,
  setPagination,
  clearSearch,
  selectSearchState,
} from '../../store/slices/searchSlice';
import {
  trackSearch,
  trackFilterUsage,
  trackNoResults,
  trackSearchClick,
} from '../../utils/searchAnalytics';

/**
 * SearchPage Component (Redux-powered)
 * 
 * Complete search and filter page for products using Redux state management.
 * Features:
 * - Search by toy name with real-time debouncing
 * - Filter by age, price, manufacturer
 * - Sort results by various criteria
 * - Responsive layout (sidebar desktop, drawer mobile)
 * - URL query parameter sync for shareable links
 * - Pagination support
 * - Redux state persistence (preserves search when navigating back)
 * - Loading and error states
 */
function SearchPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Redux state
  const {
    query,
    filters,
    results,
    pagination,
    loading,
    error,
    hasActiveFilters,
  } = useSelector(selectSearchState);

  // Local state
  const [manufacturers, setManufacturers] = useState([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Initialize state from URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlFilters = {
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minAge: searchParams.get('minAge') || '',
      maxAge: searchParams.get('maxAge') || '',
      manufacturerId: searchParams.get('manufacturerId') || '',
      sortBy: searchParams.get('sortBy') || 'createdDate',
      sortDirection: searchParams.get('sortDirection') || 'desc',
    };
    const urlPage = parseInt(searchParams.get('page') || '0');

    // Only update Redux if URL differs from current state
    if (urlQuery !== query) {
      dispatch(setSearchQuery(urlQuery));
    }
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
      dispatch(setFilters(urlFilters));
    }
    if (urlPage !== pagination.page) {
      dispatch(setPagination({ page: urlPage }));
    }
  }, []); // Run once on mount

  // Load manufacturers on mount
  useEffect(() => {
    const loadManufacturers = async () => {
      try {
        const data = await productService.getManufacturers();
        setManufacturers(data);
      } catch (err) {
        console.error('Failed to load manufacturers:', err);
      }
    };
    loadManufacturers();
  }, []);

  // Perform search when Redux state changes
  useEffect(() => {
    const performSearch = async () => {
      const resultAction = await dispatch(searchProductsAsync({ query, filters, pagination }));
      
      // Track analytics after search completes
      if (searchProductsAsync.fulfilled.match(resultAction)) {
        const resultCount = resultAction.payload?.totalElements || 0;
        
        // Track search query
        if (query) {
          trackSearch(query, resultCount);
        }
        
        // Track filter usage
        const hasActiveFilters = 
          filters.minPrice || filters.maxPrice || 
          filters.minAge || filters.maxAge || 
          filters.manufacturerId ||
          (filters.sortBy && filters.sortBy !== 'relevance');
        
        if (hasActiveFilters) {
          trackFilterUsage(filters);
        }
        
        // Track no-results searches
        if (resultCount === 0 && query) {
          trackNoResults(query, filters);
        }
      }
    };
    
    performSearch();
  }, [query, filters, pagination.page, dispatch]);

  // Update URL when search parameters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.minAge) params.set('minAge', filters.minAge);
    if (filters.maxAge) params.set('maxAge', filters.maxAge);
    if (filters.manufacturerId) params.set('manufacturerId', filters.manufacturerId);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortDirection) params.set('sortDirection', filters.sortDirection);
    if (pagination.page > 0) params.set('page', pagination.page);

    setSearchParams(params, { replace: true });
  }, [query, filters, pagination.page, setSearchParams]);

  const handleSearch = (newQuery) => {
    dispatch(setSearchQuery(newQuery));
    dispatch(setPagination({ page: 0 })); // Reset to first page on new search
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ page: 0 })); // Reset to first page on filter change
  };

  const handlePageChange = (event, value) => {
    dispatch(setPagination({ page: value - 1 })); // MUI Pagination is 1-indexed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    dispatch(setFilters({
      minPrice: '',
      maxPrice: '',
      minAge: '',
      maxAge: '',
      manufacturerId: '',
      sortBy: 'createdDate',
      sortDirection: 'desc',
    }));
  };

  const handleBrowseAll = () => {
    navigate('/products');
  };

  const handleProductClick = (productId) => {
    // Track click-through from search results
    const position = results.findIndex((p) => p.productId === productId);
    if (position >= 0) {
      trackSearchClick(query, productId, position);
    }
    navigate(`/products/${productId}`);
  };

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <SearchFilters
      filters={filters}
      onFilterChange={handleFilterChange}
      manufacturers={manufacturers}
    />
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <SearchBar
          onSearch={handleSearch}
          initialValue={query}
          placeholder="Search for toys by name..."
        />
      </Box>

      {/* Mobile Filter Button */}
      {isMobile && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {!loading && `${pagination.totalElements} ${pagination.totalElements === 1 ? 'result' : 'results'}`}
            {query && ` for "${query}"`}
          </Typography>
          <IconButton onClick={toggleFilterDrawer} color="primary">
            <FilterListIcon />
          </IconButton>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, position: 'sticky', top: 80 }}>
              <FilterSidebar />
            </Paper>
          </Grid>
        )}

        {/* Results Area */}
        <Grid item xs={12} md={isMobile ? 12 : 9}>
          {/* Result Count */}
          {!isMobile && !loading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">
                {pagination.totalElements} {pagination.totalElements === 1 ? 'Result' : 'Results'}
                {query && ` for "${query}"`}
              </Typography>
            </Box>
          )}

          {/* Loading State */}
          {loading && (
            <ProductGridSkeleton count={pagination.size || 8} />
          )}

          {/* Error State */}
          {error && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {/* No Results */}
          {!loading && !error && results.length === 0 && (
            <NoResults
              query={query}
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              onBrowseAll={handleBrowseAll}
            />
          )}

          {/* Results Grid */}
          {!loading && !error && results.length > 0 && (
            <>
              {/* Use virtualized grid for large result sets (>100 items) */}
              {pagination.totalElements > 100 ? (
                <VirtualizedProductGrid 
                  products={results} 
                  onProductClick={handleProductClick}
                />
              ) : (
                <ProductGrid 
                  products={results} 
                  onProductClick={handleProductClick}
                />
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 400,
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={toggleFilterDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        <FilterSidebar />
      </Drawer>
    </Container>
  );
}

export default SearchPage;
