import { useNavigate } from 'react-router-dom';
import { Star, Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';
import './NewArrivals.css';

/**
 * New arrivals section for homepage.
 * Displays recently added products with "new" badges.
 */
const NewArrivals = ({ products }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleViewAllClick = () => {
    navigate('/products?sortBy=createdDate&sortDir=desc');
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
      stars.push(<Star key="half" size={16} fill="url(#half-new)" stroke="gold" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} stroke="gold" fill="none" />);
    }

    return stars;
  };

  return (
    <section className="new-arrivals">
      <div className="new-arrivals-header">
        <div className="header-title-container">
          <Sparkles className="sparkle-icon" size={32} />
          <h2 className="new-arrivals-title">New Arrivals</h2>
        </div>
        <button 
          className="view-all-new-btn"
          onClick={handleViewAllClick}
        >
          View All New Toys
        </button>
      </div>

      <div className="new-arrivals-grid">
        {products.map((product) => (
          <div 
            key={product.id}
            className="new-arrival-card"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="new-arrival-image-container">
              <span className="new-badge">
                <Sparkles size={14} />
                NEW
              </span>
              <img 
                src={product.primaryImageUrl || '/images/placeholder.png'} 
                alt={product.name}
                className="new-arrival-image"
              />
              {product.discountPercentage > 0 && (
                <span className="new-discount-badge">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>

            <div className="new-arrival-content">
              <h3 className="new-arrival-product-name">{product.name}</h3>
              
              <div className="new-arrival-rating">
                <div className="stars">
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="half-new">
                        <stop offset="50%" stopColor="gold" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {renderStars(product.averageRating || 0)}
                </div>
                <span className="new-rating-count">
                  ({product.reviewCount || 0})
                </span>
              </div>

              <div className="new-arrival-pricing">
                {product.discountPercentage > 0 ? (
                  <>
                    <span className="new-original-price">
                      {formatPrice(product.price)}
                    </span>
                    <span className="new-sale-price">
                      {formatPrice(product.salePrice)}
                    </span>
                  </>
                ) : (
                  <span className="new-price">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <div className="new-arrival-stock">
                {product.stockQuantity > 0 ? (
                  <span className="new-in-stock">In Stock</span>
                ) : (
                  <span className="new-out-of-stock">Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
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
      salePrice: PropTypes.number,
      discountPercentage: PropTypes.number,
      primaryImageUrl: PropTypes.string,
      averageRating: PropTypes.number,
      reviewCount: PropTypes.number,
      stockQuantity: PropTypes.number,
    })
  ),
};

NewArrivals.defaultProps = {
  products: [],
};

export default NewArrivals;
