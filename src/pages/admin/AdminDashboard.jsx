import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react';

/**
 * AdminDashboard Component
 * 
 * Main admin dashboard with stats and overview.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin || {});

  useEffect(() => {
    if (dispatch && fetchDashboardStats) {
      dispatch(fetchDashboardStats());
    }
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'from-primary-400 to-primary-600',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600',
      link: '/admin/products',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'from-secondary-400 to-secondary-600',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-600',
      link: '/admin/orders',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      link: '/admin/customers',
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      link: '/admin/orders',
    },
  ];

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">Welcome back! Here's your store overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="card p-6 hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(stat.link)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-secondary-600" />
                <span>Recent Orders</span>
              </h2>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-semibold text-gray-800">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">₹{order.totalAmount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <span>Low Stock Alert</span>
              </h2>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {stats?.lowStockProducts?.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.imageUrl || '/placeholder-toy.jpg'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-sm text-red-600">Only {product.stockQuantity} left</p>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>All products in stock</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/products/new')}
            className="card p-6 text-center hover:shadow-card-hover transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <p className="font-semibold text-gray-800">Add Product</p>
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="card p-6 text-center hover:shadow-card-hover transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <ShoppingBag className="w-6 h-6 text-secondary-600" />
            </div>
            <p className="font-semibold text-gray-800">Manage Orders</p>
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="card p-6 text-center hover:shadow-card-hover transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-gray-800">Categories</p>
          </button>
          <button
            onClick={() => navigate('/admin/customers')}
            className="card p-6 text-center hover:shadow-card-hover transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-semibold text-gray-800">Customers</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
