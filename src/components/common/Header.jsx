import { ShoppingCart, User, Menu, Search, Home, Package } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import SearchBar from '../search/SearchBar';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    dispatch(logout());
    navigate('/');
  };

  const handleNavigate = (path) => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate(path);
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSearchBar(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 text-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="bg-white rounded-full p-2 group-hover:scale-110 transition-transform duration-200">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight hidden sm:block">
              {import.meta.env.VITE_APP_NAME || "Aadhav's ToyTown"}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-1 hover:text-yellow-200 transition-colors duration-200 font-medium"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="flex items-center space-x-1 hover:text-yellow-200 transition-colors duration-200 font-medium"
            >
              <Package className="w-5 h-5" />
              <span>Products</span>
            </button>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <SearchBar onSearch={handleSearch} placeholder="Search for toys..." />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Icon - Mobile */}
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  aria-label="User Menu"
                >
                  <User className="w-6 h-6" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-toy-hover overflow-hidden z-50">
                    <div className="px-4 py-3 bg-primary-50 border-b border-primary-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user?.email || 'Account'}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => handleNavigate('/profile')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => handleNavigate('/order-history')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                      >
                        Order History
                      </button>
                      <button
                        onClick={() => handleNavigate('/my-reviews')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                      >
                        My Reviews
                      </button>
                    </div>
                    <div className="border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 font-semibold hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="hidden sm:block px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-md"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearchBar && (
          <div className="md:hidden pb-4 animate-slide-up">
            <SearchBar onSearch={handleSearch} placeholder="Search for toys..." />
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 animate-slide-up">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => handleNavigate('/')}
                className="text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigate('/products')}
                className="text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                Products
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
