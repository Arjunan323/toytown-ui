import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import ProductGrid from '../../components/product/ProductGrid';
import SearchBar from '../../components/search/SearchBar';
import { searchProducts, clearSearch } from '../../store/slices/productSlice';

/**
 * SearchPage Component
 * 
 * Search results page with filters and sorting.
 */
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const query = searchParams.get('q') || '';

  const { searchResults, loading, pagination } = useSelector((state) => state.product);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (query) {
      dispatch(searchProducts({ query, page: 0, size: 12, sort: sortBy }));
    }
    return () => {
      dispatch(clearSearch());
    };
  }, [dispatch, query, sortBy]);

  const handleSearch = (newQuery) => {
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery });
    }
  };

  const handlePageChange = (page) => {
    dispatch(searchProducts({ query, page: page - 1, size: 12, sort: sortBy }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-4">
            Search Results
          </h1>
          <div className="max-w-2xl">
            <SearchBar onSearch={handleSearch} initialValue={query} placeholder="Search for toys..." />
          </div>
        </div>

        {/* Results Info */}
        {query && (
          <div className="mb-6">
            <p className="text-lg text-gray-600">
              {loading ? 'Searching...' : (
                <>
                  Found <span className="font-bold text-primary-600">{pagination.totalElements || 0}</span> results for 
                  <span className="font-bold text-gray-800"> "{query}"</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-outline flex items-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-10 font-semibold text-gray-700 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 cursor-pointer"
            >
              <option value="relevance">Most Relevant</option>
              <option value="name">Name (A-Z)</option>
              <option value="name,desc">Name (Z-A)</option>
              <option value="price">Price (Low to High)</option>
              <option value="price,desc">Price (High to Low)</option>
              <option value="averageRating,desc">Highest Rated</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:block w-80 flex-shrink-0 ${
            showFilters ? 'block' : 'hidden'
          }`}>
            <div className="card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-gray-800">Filters</h3>
                <button
                  onClick={() => setPriceRange([0, 10000])}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear
                </button>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>₹0</span>
                  <span className="font-semibold text-primary-600">₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Search Results */}
          <div className="flex-1">
            <ProductGrid
              products={searchResults || []}
              loading={loading}
              error={null}
              page={pagination.page + 1}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              emptyMessage={query ? `No results found for "${query}"` : 'Enter a search term to find products'}
              columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
