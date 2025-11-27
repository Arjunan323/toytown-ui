import PropTypes from 'prop-types';
import { Package } from 'lucide-react';

/**
 * OrderSummary Component
 * 
 * Displays order summary with items, prices, and totals.
 * Used in checkout and order confirmation pages.
 */
const OrderSummary = ({ items = [], subtotal = 0, shipping = 0, tax = 0, showItems = true }) => {
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const total = subtotal + shipping + tax;

  return (
    <div className="space-y-4">
      {/* Items List */}
      {showItems && items.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-gray-800 mb-4">Order Items ({items.length})</h3>
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 pb-3 border-b border-gray-100 last:border-0">
              <img
                src={item.productImageUrl || '/placeholder-toy.jpg'}
                alt={item.productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-primary-600">{formatPrice(item.subtotal || item.quantity * item.productPrice)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 pt-4 border-t-2 border-gray-200">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Tax (18% GST)</span>
          <span className="font-semibold">{formatPrice(tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t-2 border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xl font-display font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-gradient">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      productName: PropTypes.string.isRequired,
      productImageUrl: PropTypes.string,
      quantity: PropTypes.number.isRequired,
      productPrice: PropTypes.number.isRequired,
      subtotal: PropTypes.number,
    })
  ),
  subtotal: PropTypes.number,
  shipping: PropTypes.number,
  tax: PropTypes.number,
  showItems: PropTypes.bool,
};

export default OrderSummary;
