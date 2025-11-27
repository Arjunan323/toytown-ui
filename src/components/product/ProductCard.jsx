import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';

/**
 * ProductCard Component
 * 
 * Displays a product card with image, name, price, rating, and add-to-cart functionality.
 * Used in product grids on category pages, search results, and homepage.
 * 
 * @component
 */
const ProductCard = ({
  id,
  name,
  price,
  imageUrl,
  rating = 0,
  reviewCount = 0,
  inStock = true,
  isFeatured = false,
  isNew = false,
  onClick,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (!inStock || isAdding) return;

    try {
      setIsAdding(true);
      await dispatch(addToCart({ productId: id, quantity: 1 })).unwrap();
      // Keep button in "Adding..." state briefly for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // TODO: Show error snackbar/notification
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    } else {
      navigate(`/products/${id}`);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite/wishlist functionality
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div
      className="group card card-hover cursor-pointer overflow-hidden"
      onClick={handleCardClick}
      data-testid="product-card"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Badges */}
        {(isFeatured || isNew || !inStock) && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {isFeatured && (
              <span className="badge badge-primary text-xs font-bold shadow-md">
                ⭐ Featured
              </span>
            )}
            {isNew && (
              <span className="badge badge-success text-xs font-bold shadow-md">
                🎉 New
              </span>
            )}
            {!inStock && (
              <span className="badge badge-error text-xs font-bold shadow-md">
                Out of Stock
              </span>
            )}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-200 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Product Image */}
        <img
          src={imageUrl || '/placeholder-toy.jpg'}
          alt={name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="text-lg font-display font-semibold text-gray-800 line-clamp-2 min-h-[3.5rem] group-hover:text-primary-600 transition-colors duration-200">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          {reviewCount > 0 && (
            <span className="text-sm text-gray-500">({reviewCount})</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gradient">
            {formatPrice(price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
            !inStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isAdding
              ? 'bg-primary-400 text-white'
              : 'btn-primary'
          }`}
          data-testid="add-to-cart-button"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{isAdding ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  imageUrl: PropTypes.string,
  rating: PropTypes.number,
  reviewCount: PropTypes.number,
  inStock: PropTypes.bool,
  isFeatured: PropTypes.bool,
  isNew: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ProductCard;
