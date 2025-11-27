import PropTypes from 'prop-types';
import ProductCard from './product/ProductCard';
import { Gift } from 'lucide-react';

/**
 * NewArrivals Component
 * 
 * Displays a grid of newly arrived toy products on the homepage.
 * Uses the ProductCard component for individual product display.
 */
const NewArrivals = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mb-16" data-testid="new-arrivals">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <Gift className="w-8 h-8 text-accent-green" />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
              New Arrivals
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fresh toys just in! Check out what's new in the store.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              isNew={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

NewArrivals.propTypes = {
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
};

export default NewArrivals;
