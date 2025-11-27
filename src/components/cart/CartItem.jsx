import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { updateCartItem, removeFromCart } from '../../store/slices/cartSlice';

/**
 * CartItem Component
 * 
 * Displays a single cart item with image, details, quantity controls, and remove button.
 * Used in the shopping cart page.
 * 
 * @component
 */
const CartItem = ({ item, disabled = false }) => {
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity < 1 || isUpdating) return;

    try {
      setIsUpdating(true);
      await dispatch(
        updateCartItem({ itemId: item.id, quantity: newQuantity })
      ).unwrap();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;

    try {
      setIsRemoving(true);
      await dispatch(removeFromCart(item.id)).unwrap();
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsRemoving(false);
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const subtotal = item.quantity * item.productPrice;

  return (
    <div
      className={`card p-6 mb-4 transition-all duration-300 ${
        isRemoving ? 'opacity-50 scale-95' : ''
      }`}
      data-testid="cart-item"
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Product Image */}
        <div className="w-full sm:w-32 h-32 flex-shrink-0">
          <img
            src={item.productImageUrl || '/placeholder-toy.jpg'}
            alt={item.productName}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-3">
          {/* Product Name */}
          <h3 className="text-lg font-display font-bold text-gray-800 hover:text-primary-600 cursor-pointer">
            {item.productName}
          </h3>

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gradient">
              {formatPrice(item.productPrice)}
            </span>
            <span className="text-sm text-gray-500">each</span>
          </div>

          {/* Quantity Controls - Mobile/Tablet */}
          <div className="flex items-center justify-between sm:hidden">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={disabled || isUpdating || item.quantity <= 1}
                className="p-2 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-primary-600" />
              </button>
              <span className="px-4 py-2 font-bold text-gray-800 min-w-[50px] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={disabled || isUpdating}
                className="p-2 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 text-primary-600" />
              </button>
            </div>

            {/* Subtotal - Mobile */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-xl font-bold text-gradient">{formatPrice(subtotal)}</p>
            </div>
          </div>
        </div>

        {/* Quantity Controls - Desktop */}
        <div className="hidden sm:flex items-center space-x-6">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={disabled || isUpdating || item.quantity <= 1}
              className="p-3 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label="Decrease quantity"
            >
              <Minus className="w-5 h-5 text-primary-600" />
            </button>
            <span className="px-6 py-2 font-bold text-lg text-gray-800 min-w-[60px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={disabled || isUpdating}
              className="p-3 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label="Increase quantity"
            >
              <Plus className="w-5 h-5 text-primary-600" />
            </button>
          </div>

          {/* Subtotal - Desktop */}
          <div className="text-right min-w-[120px]">
            <p className="text-sm text-gray-500 mb-1">Subtotal</p>
            <p className="text-2xl font-bold text-gradient">{formatPrice(subtotal)}</p>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={disabled || isRemoving}
          className="self-start p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
          aria-label="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Stock Warning */}
      {item.productStockQuantity <= 5 && item.productStockQuantity > 0 && (
        <div className="mt-4 px-4 py-2 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Only {item.productStockQuantity} left in stock!
          </p>
        </div>
      )}
    </div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    productId: PropTypes.number.isRequired,
    productName: PropTypes.string.isRequired,
    productPrice: PropTypes.number.isRequired,
    productImageUrl: PropTypes.string,
    quantity: PropTypes.number.isRequired,
    subtotal: PropTypes.number,
    productStockQuantity: PropTypes.number,
  }).isRequired,
  disabled: PropTypes.bool,
};

export default CartItem;
