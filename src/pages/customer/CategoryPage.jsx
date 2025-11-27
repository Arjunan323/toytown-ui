import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, X, Home, ChevronRight, ArrowUpDown } from 'lucide-react';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    searchParams.set('sort', newSort);
    searchParams.delete('page'); // Reset to page 1
    setSearchParams(searchParams);
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
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold text-gray-800 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-primary-600" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Price Range
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          onMouseUp={handlePriceRangeCommitted}
          onTouchEnd={handlePriceRangeCommitted}
          className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>₹0</span>
          <span className="font-semibold text-primary-600">₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Age Range Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Age Range (years)
        </label>
        <input
          type="range"
          min="0"
          max="18"
          step="1"
          value={ageRange[1]}
          onChange={(e) => setAgeRange([0, parseInt(e.target.value)])}
          onMouseUp={handleAgeRangeCommitted}
          onTouchEnd={handleAgeRangeCommitted}
          className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-secondary-500"
        />
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>0+ years</span>
          <span className="font-semibold text-secondary-600">{ageRange[1]}+ years</span>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">Active Filters</p>
          <div className="flex flex-wrap gap-2">
            {filters.minPrice > 0 && (
              <span className="badge badge-primary">Min: ₹{filters.minPrice}</span>
            )}
            {filters.maxPrice && filters.maxPrice < 10000 && (
              <span className="badge badge-primary">Max: ₹{filters.maxPrice}</span>
            )}
            {filters.minAge > 0 && (
              <span className="badge badge-primary">Age: {filters.minAge}+</span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
          <a href="/" className="text-primary-600 hover:text-primary-700 flex items-center">
            <Home className="w-4 h-4" />
          </a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Categories</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-800 font-semibold">{categoryName}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
            {categoryName}
          </h1>
          <p className="text-lg text-gray-600">
            Explore our collection of {categoryName.toLowerCase()}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden btn-outline flex items-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>

          {/* Results Count */}
          <p className="text-gray-600">
            {pagination.totalElements || 0} {pagination.totalElements === 1 ? 'product' : 'products'} found
          </p>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-10 font-semibold text-gray-700 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 cursor-pointer"
            >
              <option value="name">Name (A-Z)</option>
              <option value="name,desc">Name (Z-A)</option>
              <option value="price">Price (Low to High)</option>
              <option value="price,desc">Price (High to Low)</option>
              <option value="createdDate,desc">Newest First</option>
              <option value="averageRating,desc">Highest Rated</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <FiltersPanel />
          </aside>

          {/* Mobile Filters Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
              <div
                className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <FiltersPanel />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
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
          </div>
        </div>
      </div>
    </div>
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
