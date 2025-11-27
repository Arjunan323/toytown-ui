import PropTypes from 'prop-types';
import { ShoppingBag, Truck, Tag } from 'lucide-react';

/**
 * CartSummary Component
 * 
 * Displays order summary with subtotal, shipping, tax, and total.
 * Includes checkout button and promotional messages.
 * 
 * @component
 */
const CartSummary = ({ items = [], subtotal = 0, onCheckout, loading = false, disabled = false }) => {
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate shipping
  const shippingThreshold = 500;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 50;
  const freeShippingRemaining = shippingThreshold - subtotal;

  // Calculate tax (18% GST)
  const tax = subtotal * 0.18;

  // Calculate total
  const total = subtotal + shippingCost + tax;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="card p-6 sticky top-24" data-testid="cart-summary">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6 pb-6 border-b border-gray-200">
        <ShoppingBag className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-display font-bold text-gray-800">Order Summary</h2>
      </div>

      {/* Summary Details */}
      <div className="space-y-4 mb-6">
        {/* Items Count */}
        <div className="flex justify-between text-gray-700">
          <span>Items ({totalItems})</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-700">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>Shipping</span>
          </div>
          <span className={`font-semibold ${
            shippingCost === 0 ? 'text-green-600' : ''
          }`}>
            {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
          </span>
        </div>

        {/* Free Shipping Progress */}
        {shippingCost > 0 && freeShippingRemaining > 0 && (
          <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4">
            <p className="text-sm text-primary-800 font-medium mb-2">
              Add {formatPrice(freeShippingRemaining)} more for FREE shipping! 🚚
            </p>
            <div className="w-full bg-primary-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((subtotal / shippingThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-gray-700">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4" />
            <span>Tax (18% GST)</span>
          </div>
          <span className="font-semibold">{formatPrice(tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-6 border-t-2 border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-display font-bold text-gray-800">Total</span>
          <span className="text-3xl font-bold text-gradient">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={disabled || loading || items.length === 0}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </button>

      {/* Security Message */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <span>🔒</span>
          <span>Secure Checkout</span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>✓</span>
          <span>100% Authentic Products</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>✓</span>
          <span>Easy Returns & Refunds</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>✓</span>
          <span>Safe & Secure Payments</span>
        </div>
      </div>
    </div>
  );
};

CartSummary.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ),
  subtotal: PropTypes.number,
  onCheckout: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CartSummary;
