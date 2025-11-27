import PropTypes from 'prop-types';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

/**
 * OrderTracking Component
 * 
 * Visual order status tracker with timeline.
 */
const OrderTracking = ({ status, orderDate, statusHistory = [] }) => {
  const statuses = [
    { key: 'PENDING', label: 'Order Placed', icon: Package },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
    { key: 'PROCESSING', label: 'Processing', icon: Clock },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === status);

  const getStatusColor = (index) => {
    if (status === 'CANCELLED' || status === 'FAILED') {
      return 'text-red-600 bg-red-100';
    }
    if (index <= currentStatusIndex) {
      return 'text-green-600 bg-green-100';
    }
    return 'text-gray-400 bg-gray-100';
  };

  const getLineColor = (index) => {
    if (status === 'CANCELLED' || status === 'FAILED') {
      return 'bg-red-200';
    }
    if (index < currentStatusIndex) {
      return 'bg-green-500';
    }
    return 'bg-gray-200';
  };

  // Handle cancelled or failed orders
  if (status === 'CANCELLED' || status === 'FAILED') {
    return (
      <div className="card p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-display font-bold text-gray-800 mb-2">
          Order {status === 'CANCELLED' ? 'Cancelled' : 'Failed'}
        </h3>
        <p className="text-gray-600">
          {status === 'CANCELLED' 
            ? 'This order has been cancelled'
            : 'Payment failed for this order'}
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6" data-testid="order-tracking">
      <h3 className="text-xl font-display font-bold text-gray-800 mb-6">Order Status</h3>
      
      {/* Timeline */}
      <div className="relative">
        {statuses.map((statusItem, index) => {
          const Icon = statusItem.icon;
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;

          return (
            <div key={statusItem.key} className="relative pb-8 last:pb-0">
              {/* Connector Line */}
              {index < statuses.length - 1 && (
                <div className={`absolute left-6 top-12 w-0.5 h-full ${getLineColor(index)}`} />
              )}

              {/* Status Item */}
              <div className="flex items-start space-x-4">
                {/* Icon Circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''
                } ${getStatusColor(index)}`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Status Info */}
                <div className="flex-1 pt-2">
                  <p className={`font-semibold ${
                    isActive ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {statusItem.label}
                  </p>
                  {isCurrent && orderDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(orderDate), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  )}
                </div>

                {/* Checkmark for completed steps */}
                {isActive && !isCurrent && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Status Badge */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Status:</span>
          <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
            status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
            status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

OrderTracking.propTypes = {
  status: PropTypes.string.isRequired,
  orderDate: PropTypes.string,
  statusHistory: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
    })
  ),
};

export default OrderTracking;
