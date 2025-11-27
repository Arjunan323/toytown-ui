import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, Star, Minus, Plus, Package, Award, Shield } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';

/**
 * ProductDetail Component
 * 
 * Displays detailed product information with image gallery, specifications,
 * quantity selector, and add-to-cart functionality.
 * 
 * @component
 */
const ProductDetail = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.imageUrl || '');
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const handleAddToCart = async () => {
    if (!product.stockQuantity || isAdding) return;

    try {
      setIsAdding(true);
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const inStock = product.stockQuantity > 0;
  const lowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl overflow-hidden shadow-card aspect-square">
          <img
            src={selectedImage || product.imageUrl || '/placeholder-toy.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="badge badge-error text-lg px-6 py-3">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Thumbnail Images - If multiple images available */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  selectedImage === image
                    ? 'border-primary-500 shadow-toy'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Category & Brand */}
        <div className="flex items-center space-x-3">
          {product.category && (
            <span className="badge badge-primary">{product.category.name || product.category}</span>
          )}
          {product.manufacturer && (
            <span className="badge bg-secondary-100 text-secondary-700">
              {product.manufacturer.name || product.manufacturer}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-6 h-6 ${
                  index < Math.floor(product.averageRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600">
            {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
          </span>
          {product.reviewCount > 0 && (
            <span className="text-gray-500">({product.reviewCount} reviews)</span>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="text-4xl font-bold text-gradient">
            {formatPrice(product.price)}
          </div>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="flex items-center space-x-3">
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="badge badge-success text-sm">
                Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          {inStock ? (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-700 font-semibold">
                {lowStock ? `Only ${product.stockQuantity} left in stock!` : 'In Stock'}
              </span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-red-700 font-semibold">Out of Stock</span>
            </>
          )}
        </div>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-lg text-gray-700 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Age Range */}
        {product.ageRange && (
          <div className="flex items-center space-x-2 text-gray-700">
            <Package className="w-5 h-5 text-primary-600" />
            <span className="font-semibold">Age:</span>
            <span>{product.ageRange} years</span>
          </div>
        )}

        {/* Quantity Selector */}
        {inStock && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Quantity</label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-3 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-5 h-5 text-primary-600" />
                </button>
                <span className="px-6 py-2 font-bold text-xl text-gray-800 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stockQuantity}
                  className="p-3 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-5 h-5 text-primary-600" />
                </button>
              </div>
              {lowStock && (
                <span className="text-sm text-orange-600 font-medium">Max: {product.stockQuantity}</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="add-to-cart-button"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="btn-outline flex items-center justify-center space-x-2 sm:w-auto"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-200 ${
                isFavorite ? 'fill-red-500 text-red-500' : ''
              }`}
            />
            <span className="sm:hidden">Wishlist</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Safe & Secure</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Quality Assured</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-6 h-6 text-secondary-600" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Fast Shipping</p>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    manufacturer: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    stockQuantity: PropTypes.number,
    shortDescription: PropTypes.string,
    description: PropTypes.string,
    ageRange: PropTypes.string,
    compareAtPrice: PropTypes.number,
  }).isRequired,
};

export default ProductDetail;
