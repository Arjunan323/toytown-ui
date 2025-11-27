import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import Spinner from '../../components/common/Spinner';
import {
  fetchCart,
  clearError,
} from '../../store/slices/cartSlice';

/**
 * CartPage Component
 * 
 * Shopping cart page displaying all items, quantities, and order summary.
 * Allows users to update quantities, remove items, and proceed to checkout.
 * 
 * @component
 */
const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    items,
    totalItems,
    subtotal,
    loading,
    error,
  } = useSelector((state) => state.cart);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch cart on mount if authenticated
    if (isAuthenticated) {
      dispatch(fetchCart());
    }

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, isAuthenticated]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  // Loading state
  if (loading && !items.length) {
    return <Spinner fullPage message="Loading your cart..." />;
  }

  // Empty cart state
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center py-8">
        <div className="container-custom max-w-2xl">
          <div className="card p-12 text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient">
              Your Cart is Empty
            </h2>
            <p className="text-lg text-gray-600">
              Looks like you haven't added anything to your cart yet
            </p>
            <button
              onClick={handleContinueShopping}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
            Shopping Cart
          </h1>
          <p className="text-lg text-gray-600">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-600 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Continue Shopping Link */}
            <button
              onClick={handleContinueShopping}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold mb-6 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>

            {/* Cart Items */}
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                disabled={loading}
              />
            ))}

            {/* Mobile Checkout Button */}
            <div className="lg:hidden">
              <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar - Desktop */}
          <div className="hidden lg:block">
            <CartSummary
              items={items}
              subtotal={subtotal}
              onCheckout={handleCheckout}
              loading={loading}
              disabled={items.length === 0}
            />
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔒</span>
              <span className="font-medium">Secure Checkout</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✓</span>
              <span className="font-medium">100% Authentic Products</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚚</span>
              <span className="font-medium">Free Shipping over ₹500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
