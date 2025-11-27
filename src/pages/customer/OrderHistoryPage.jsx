import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Eye, Calendar, CreditCard, Filter } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { fetchMyOrders } from '../../store/slices/orderSlice';
import { format } from 'date-fns';

/**
 * OrderHistoryPage Component
 * 
 * Displays list of user's orders with status, date, and total.
 * Allows filtering and navigation to order details.
 * 
 * @component
 */
const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myOrders, loading, error } = useSelector((state) => state.order);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    dispatch(fetchMyOrders({ page: 0, size: 20 }));
  }, [dispatch]);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = statusFilter === 'ALL' 
    ? myOrders?.content || []
    : (myOrders?.content || []).filter(order => order.status === statusFilter);

  if (loading) {
    return <Spinner fullPage message="Loading your orders..." />;
  }

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
            Order History
          </h1>
          <p className="text-lg text-gray-600">
            Track and manage your orders
          </p>
        </div>

        {/* Filter Bar */}
        <div className="card p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors duration-200 ${
                statusFilter === 'ALL'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors duration-200 ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              {statusFilter === 'ALL' ? 'No Orders Yet' : `No ${statusFilter} Orders`}
            </h2>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'ALL' 
                ? "Start shopping to see your orders here"
                : `You don't have any ${statusFilter.toLowerCase()} orders`}
            </p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="card p-6 hover:shadow-card-hover transition-shadow duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(order.orderDate), 'MMM dd, yyyy')}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{order.items?.length || 0} items</span>
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${getStatusColor(order.status)} font-semibold`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex items-center space-x-2 overflow-x-auto">
                        {order.items.slice(0, 3).map((item, index) => (
                          <img
                            key={index}
                            src={item.productImageUrl || '/placeholder-toy.jpg'}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                          />
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Total & Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-gradient">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/orders/confirmation/${order.orderNumber}`)}
                      className="btn-primary flex items-center space-x-2 whitespace-nowrap"
                    >
                      <Eye className="w-5 h-5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - if needed */}
        {myOrders?.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <p className="text-gray-600">
              Showing page {(myOrders.page || 0) + 1} of {myOrders.totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
