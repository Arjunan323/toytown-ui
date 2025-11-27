import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { fetchCart } from './store/slices/cartSlice';

// Customer Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/customer/CategoryPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import SearchPage from './pages/customer/SearchPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import ResetPasswordPage from './pages/customer/ResetPasswordPage';
import MyReviewsPage from './pages/customer/MyReviewsPage';

// Admin Pages
import {
  AdminLogin,
  AdminDashboard,
  AdminProductList,
  AdminProductCreate,
  AdminProductEdit,
  AdminCategoryManagementPage,
  AdminManufacturerManagementPage,
} from './pages/admin';
import AdminOrderManagementPage from './pages/admin/AdminOrderManagementPage';
import AdminBannerManagementPage from './pages/admin/AdminBannerManagementPage';
import { AdminLayout } from './components/admin';

// Tailwind CSS is now used for all styling - no theme configuration needed

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = window.location;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  }
  
  return children;
};

// Admin Protected Route wrapper
const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated } = useSelector((state) => state.adminAuth);
  const location = window.location;
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: { pathname: location.pathname } }} replace />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  return (
      <Router>
        <Routes>
          {/* Admin Routes - No Header/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products">
              <Route index element={<AdminProductList />} />
              <Route path="create" element={<AdminProductCreate />} />
              <Route path=":id/edit" element={<AdminProductEdit />} />
              <Route path="low-stock" element={<AdminProductList />} />
            </Route>
            <Route path="orders" element={<AdminOrderManagementPage />} />
            <Route path="categories" element={<AdminCategoryManagementPage />} />
            <Route path="manufacturers" element={<AdminManufacturerManagementPage />} />
            <Route path="banners" element={<AdminBannerManagementPage />} />
          </Route>

          {/* Customer Routes - With Header/Footer */}
          <Route 
            path="/*" 
            element={
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                
                <main style={{ flex: 1, paddingTop: '20px', paddingBottom: '20px' }}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/products" element={<CategoryPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/category/:categoryId" element={<CategoryPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/my-reviews" 
                      element={
                        <ProtectedRoute>
                          <MyReviewsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/orders/confirmation/:orderNumber" 
                      element={
                        <ProtectedRoute>
                          <OrderConfirmationPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/order-history" 
                      element={
                        <ProtectedRoute>
                          <OrderHistoryPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/orders/:orderNumber" 
                      element={
                        <ProtectedRoute>
                          <OrderConfirmationPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Fallback for legacy /orders route */}
                    <Route path="/orders" element={<Navigate to="/order-history" replace />} />
                    
                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
