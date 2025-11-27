import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, useMediaQuery, useTheme, Menu, MenuItem, Divider } from '@mui/material';
import { ShoppingCart, Person, Menu as MenuIcon, Search as SearchIcon, AccountCircle } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import SearchBar from '../search/SearchBar';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/');
  };

  const handleNavigate = (path) => {
    handleMenuClose();
    navigate(path);
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSearchBar(false); // Hide search on mobile after search
    }
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
        {/* Menu icon for mobile (future enhancement) */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 1, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo/Brand */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 0, 
            cursor: 'pointer', 
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            whiteSpace: 'nowrap'
          }}
          onClick={() => navigate('/')}
        >
          {import.meta.env.VITE_APP_NAME || "Aadhav's ToyTown"}
        </Typography>

        {/* Navigation Links - Hidden on very small screens */}
        {!isSmallScreen && (
          <Box sx={{ flexGrow: 0, display: 'flex', ml: { xs: 1, md: 3 }, gap: { xs: 0.5, md: 2 } }}>
            <Button color="inherit" onClick={() => navigate('/')} size="small">
              Home
            </Button>
            <Button color="inherit" onClick={() => navigate('/products')} size="small">
              Products
            </Button>
          </Box>
        )}

        {/* Search Bar - Desktop */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, mx: 3, maxWidth: 500 }}>
            <SearchBar onSearch={handleSearch} placeholder="Search toys..." />
          </Box>
        )}

        {/* Spacer for mobile */}
        {isMobile && <Box sx={{ flexGrow: 1 }} />}

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {/* Search Icon - Mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="search"
              onClick={toggleSearchBar}
            >
              <SearchIcon />
            </IconButton>
          )}

          {/* Shopping Cart */}
          <IconButton
            color="inherit"
            aria-label="shopping cart"
            onClick={() => navigate('/cart')}
          >
            <Badge badgeContent={totalItems} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {/* User Menu */}
          {isAuthenticated ? (
            <>
              <IconButton
                color="inherit"
                aria-label="account"
                onClick={handleMenuOpen}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'Account'}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/order-history')}>
                  Order History
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/my-reviews')}>
                  My Reviews
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                size="small"
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/register')}
                size="small"
                sx={{ ml: { xs: 0.5, sm: 1 }, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Search Bar - Expandable */}
      {isMobile && showSearchBar && (
        <Toolbar sx={{ pt: 0, pb: 2 }}>
          <Box sx={{ width: '100%' }}>
            <SearchBar onSearch={handleSearch} placeholder="Search toys..." />
          </Box>
        </Toolbar>
      )}
    </AppBar>
  );
}

export default Header;
