import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import PropTypes from 'prop-types';
import './FeaturedToys.css';

/**
 * Featured toys section for homepage.
 * Displays grid of featured products with quick actions.
 */
const FeaturedToys = ({ products }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleViewAllClick = () => {
    navigate('/products?featured=true');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={16} fill="gold" stroke="gold" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} fill="url(#half)" stroke="gold" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} stroke="gold" fill="none" />);
    }

    return stars;
  };

  return (
    <section className="featured-toys">
      <div className="featured-header">
        <h2 className="featured-title">Featured Toys</h2>
        <button 
          className="view-all-btn"
          onClick={handleViewAllClick}
        >
          View All Featured
        </button>
      </div>

      <div className="featured-grid">
        {products.map((product) => (
          <div 
            key={product.id}
            className="featured-card"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="featured-image-container">
              <img 
                src={product.primaryImageUrl || '/images/placeholder.png'} 
                alt={product.name}
                className="featured-image"
              />
              {product.discountPercentage > 0 && (
                <span className="discount-badge">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>

            <div className="featured-content">
              <h3 className="featured-product-name">{product.name}</h3>
              
              <div className="featured-rating">
                <div className="stars">
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="half">
                        <stop offset="50%" stopColor="gold" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {renderStars(product.averageRating || 0)}
                </div>
                <span className="rating-count">
                  ({product.reviewCount || 0})
                </span>
              </div>

              <div className="featured-pricing">
                {product.discountPercentage > 0 ? (
                  <>
                    <span className="featured-original-price">
                      {formatPrice(product.price)}
                    </span>
                    <span className="featured-sale-price">
                      {formatPrice(product.salePrice)}
                    </span>
                  </>
                ) : (
                  <span className="featured-price">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <div className="featured-stock">
                {product.stockQuantity > 0 ? (
                  <span className="in-stock">In Stock</span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
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
      salePrice: PropTypes.number,
      discountPercentage: PropTypes.number,
      primaryImageUrl: PropTypes.string,
      averageRating: PropTypes.number,
      reviewCount: PropTypes.number,
      stockQuantity: PropTypes.number,
    })
  ),
};

FeaturedToys.defaultProps = {
  products: [],
};

export default FeaturedToys;
