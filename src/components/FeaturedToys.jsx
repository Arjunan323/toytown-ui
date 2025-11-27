import PropTypes from 'prop-types';
import ProductCard from './product/ProductCard';
import { Sparkles } from 'lucide-react';

/**
 * FeaturedToys Component
 * 
 * Displays a grid of featured toy products on the homepage.
 * Uses the ProductCard component for individual product display.
 */
const FeaturedToys = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mb-16" data-testid="featured-toys">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-secondary-500 animate-bounce-slow" />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
              Featured Toys
            </h2>
            <Sparkles className="w-8 h-8 text-primary-500 animate-bounce-slow" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked favorites that kids absolutely love!
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
              isFeatured={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

FeaturedToys.propTypes = {
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

export default FeaturedToys;
