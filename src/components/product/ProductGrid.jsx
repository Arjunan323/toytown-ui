import PropTypes from 'prop-types';
import ProductCard from './ProductCard';
import ProductGridSkeleton from '../common/ProductGridSkeleton';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ProductGrid Component
 * 
 * Displays a responsive grid of product cards with pagination.
 * Used on category pages, search results, and product listings.
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
  emptyMessage = 'No products found',
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
}) => {
  // Loading state
  if (loading && products.length === 0) {
    return <ProductGridSkeleton count={8} />;
  }

  // Error state
  if (error) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">Oops!</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-primary-600" />
        </div>
        <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">{emptyMessage}</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  const gridColsClass = `grid-cols-${columns.xs} sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`;

  return (
    <div className="space-y-8">
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
            rating={product.averageRating || product.rating || 0}
            reviewCount={product.reviewCount || 0}
            inStock={product.stockQuantity > 0}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border-2 border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show first, last, current, and adjacent pages
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= page - 1 && pageNumber <= page + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      pageNumber === page
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-toy'
                        : 'text-gray-700 hover:bg-primary-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (pageNumber === page - 2 || pageNumber === page + 2) {
                return (
                  <span key={pageNumber} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border-2 border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      imageUrl: PropTypes.string,
      averageRating: PropTypes.number,
      rating: PropTypes.number,
      reviewCount: PropTypes.number,
      stockQuantity: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  emptyMessage: PropTypes.string,
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
  }),
};

export default ProductGrid;
