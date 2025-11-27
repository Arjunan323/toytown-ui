import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import Spinner from '../../components/common/Spinner';
import OrderSummary from '../../components/order/OrderSummary';
import { fetchOrderById, clearError, fetchOrderByNumber } from '../../store/slices/orderSlice';

/**
 * OrderConfirmationPage Component
 * 
 * Displays order confirmation after successful payment.
 * Shows order details, summary, and next steps.
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

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, orderNumber]);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/order-history');
  };

  // Loading state
  if (loading) {
    return <Spinner fullPage />;
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Back to Shopping
        </Button>
      </Container>
    );
  }

  // No order found
  if (!currentOrder) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Order not found
        </Alert>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Back to Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Success Header */}
      <Paper sx={{ p: 4, textAlign: 'center', mb: 4, bgcolor: 'success.lighter' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="success.main">
          Order Placed Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Thank you for your purchase. Your order has been confirmed.
        </Typography>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, display: 'inline-block' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Order Number
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">
            {currentOrder.orderNumber}
          </Typography>
        </Box>
      </Paper>

      {/* Order Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            Order Details
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Order Date
          </Typography>
          <Typography variant="body1">
            {new Date(currentOrder.orderDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Payment Status
          </Typography>
          <Typography variant="body1" color="success.main" fontWeight="bold">
            {currentOrder.paymentStatus}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Order Status
          </Typography>
          <Typography variant="body1" color="primary" fontWeight="bold">
            {currentOrder.status}
          </Typography>
        </Box>

        {currentOrder.shippingAddress && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body1">{currentOrder.shippingAddress.recipientName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {currentOrder.shippingAddress.addressLine1}
            </Typography>
            {currentOrder.shippingAddress.addressLine2 && (
              <Typography variant="body2" color="text.secondary">
                {currentOrder.shippingAddress.addressLine2}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}{' '}
              {currentOrder.shippingAddress.postalCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: {currentOrder.shippingAddress.phoneNumber}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Order Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <OrderSummary order={currentOrder} />
      </Paper>

      {/* What's Next */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          What's Next?
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          • You will receive an order confirmation email shortly at your registered email address.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • We'll send you a notification when your order is shipped.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • You can track your order status in the Order History section.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Expected delivery: 3-5 business days
        </Typography>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<ReceiptIcon />}
          onClick={handleViewOrders}
          size="large"
        >
          View All Orders
        </Button>
        <Button
          variant="contained"
          startIcon={<ShoppingBagIcon />}
          onClick={handleContinueShopping}
          size="large"
        >
          Continue Shopping
        </Button>
      </Box>

      {/* Help Section */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Need help? Contact us at support@toytown.com or call 1800-123-4567
        </Typography>
      </Box>
    </Container>
  );
};

export default OrderConfirmationPage;
