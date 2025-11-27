import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  Paper,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
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

  const handleUpdateItem = (itemId, newQuantity) => {
    console.log('Update item:', itemId, newQuantity);
    // Handled by CartItem component via Redux
  };

  const handleRemoveItem = (itemId) => {
    console.log('Remove item:', itemId);
    // Handled by CartItem component via Redux
  };

  // Loading state
  if (loading && !items.length) {
    return <Spinner fullPage />;
  }

  // Empty cart state
  if (!loading && items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added anything to your cart yet
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleContinueShopping}
            endIcon={<ArrowForwardIcon />}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Shopping Cart
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Cart Items List */}
        <Grid item xs={12} md={8}>
          <Box>
            {/* Continue Shopping Link */}
            <Button
              variant="text"
              onClick={handleContinueShopping}
              sx={{ mb: 3 }}
            >
              ← Continue Shopping
            </Button>

            {/* Cart Items */}
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
                disabled={loading}
              />
            ))}

            {/* Mobile Checkout Button */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 3 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} md={4}>
          <CartSummary
            items={items}
            subtotal={subtotal}
            onCheckout={handleCheckout}
            loading={loading}
            disabled={items.length === 0}
          />
        </Grid>
      </Grid>

      {/* Security Badges */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          🔒 Secure Checkout | ✓ 100% Authentic Products | 🚚 Free Shipping over ₹500
        </Typography>
      </Box>
    </Container>
  );
};

export default CartPage;
