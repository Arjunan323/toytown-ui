import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';
import OrderSummary from '../../components/order/OrderSummary';
import OrderTracking from '../../components/order/OrderTracking';
import Spinner from '../../components/common/Spinner';
import { fetchOrderByNumber } from '../../store/slices/orderSlice';
import { format } from 'date-fns';

/**
 * OrderConfirmationPage Component
 * 
 * Success page displayed after order placement.
 * Shows order details, tracking info, and thank you message.
 * 
 * @component
 */
const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentOrder, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (orderNumber) {
      dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderNumber]);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return <Spinner fullPage message="Loading order details..." />;
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center py-8">
        <div className="container-custom max-w-md">
          <div className="card p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800">Order Not Found</h2>
            <p className="text-gray-600">{error || 'Unable to find order details'}</p>
            <button onClick={() => navigate('/order-history')} className="btn-primary">
              View Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-bounce-slow shadow-toy-hover">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase! Your order is being processed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="card p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-gradient">{currentOrder.orderNumber}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {format(new Date(currentOrder.orderDate), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <h3 className="text-lg font-display font-bold text-gray-800 mb-4">Shipping Address</h3>
            <div className="p-4 bg-primary-50 rounded-xl">
              <p className="font-semibold text-gray-800">{currentOrder.shippingAddress?.recipientName}</p>
              <p className="text-gray-700">{currentOrder.shippingAddress?.addressLine1}</p>
              {currentOrder.shippingAddress?.addressLine2 && (
                <p className="text-gray-700">{currentOrder.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-700">
                {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} {currentOrder.shippingAddress?.postalCode}
              </p>
              <p className="text-gray-700">Phone: {currentOrder.shippingAddress?.phoneNumber}</p>
            </div>
          </div>

          {/* Order Summary */}
          <OrderSummary
            items={currentOrder.items || []}
            subtotal={currentOrder.subtotal || 0}
            shipping={currentOrder.shippingCost || 0}
            tax={currentOrder.taxAmount || 0}
            showItems={true}
          />
        </div>

        {/* Order Tracking */}
        <div className="mb-8">
          <OrderTracking
            status={currentOrder.status}
            orderDate={currentOrder.orderDate}
            statusHistory={currentOrder.statusHistory}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="btn-outline flex items-center justify-center space-x-2 flex-1"
          >
            <Home className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>
          <button
            onClick={() => navigate('/order-history')}
            className="btn-primary flex items-center justify-center space-x-2 flex-1"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>View All Orders</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <h3 className="font-display font-bold text-gray-800 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>You will receive an order confirmation email shortly</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Track your order status on the Order History page</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Estimated delivery: 3-5 business days</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
