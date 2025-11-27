import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

/**
 * OrderSummary Component
 * 
 * Displays order details including items, pricing, shipping address, and payment information.
 * Used on order confirmation page and order history detail view.
 * 
 * @component
 */
const OrderSummary = ({
  order,
  showShippingAddress = true,
  showPaymentInfo = true,
  showItemDetails = true,
}) => {
  if (!order) {
    return null;
  }

  const {
    orderNumber,
    orderDate,
    status,
    items = [],
    subtotal,
    tax,
    shipping,
    total,
    shippingAddress,
    paymentMethod,
    paymentStatus,
  } = order;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'error',
      REFUNDED: 'info',
    };
    return statusColors[status] || 'default';
  };

  return (
    <Box>
      {/* Order Header */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Order #{orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on {formatDate(orderDate)}
              </Typography>
            </Box>
            <Chip
              label={status}
              color={getStatusColor(status)}
              icon={status === 'DELIVERED' ? <CheckCircleIcon /> : undefined}
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Order Items */}
        {showItemDetails && items.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {item.product?.imageUrls?.[0] && (
                                <img
                                  src={item.product.imageUrls[0]}
                                  alt={item.product?.name || item.productName}
                                  style={{
                                    width: 60,
                                    height: 60,
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                  }}
                                />
                              )}
                              <Typography variant="body2">
                                {item.product?.name || item.productName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{item.quantity}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatPrice(item.price || item.product?.price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatPrice(item.subtotal || (item.price * item.quantity))}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Shipping Address */}
        {showShippingAddress && shippingAddress && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShippingIcon sx={{ mr: 1 }} />
                  Shipping Address
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" gutterBottom>
                  {shippingAddress.recipientName || shippingAddress.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {shippingAddress.addressLine1}
                </Typography>
                {shippingAddress.addressLine2 && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {shippingAddress.addressLine2}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shippingAddress.country || 'India'}
                </Typography>
                {shippingAddress.phoneNumber && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Phone: {shippingAddress.phoneNumber}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Payment Information */}
        {showPaymentInfo && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaymentIcon sx={{ mr: 1 }} />
                  Payment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Method:
                  </Typography>
                  <Typography variant="body2">
                    {paymentMethod || 'Razorpay'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip
                    label={paymentStatus || 'PENDING'}
                    color={getPaymentStatusColor(paymentStatus)}
                    size="small"
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(subtotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping:
                  </Typography>
                  <Typography variant="body2">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tax (GST):
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(tax)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">
                    Total:
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatPrice(total)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

OrderSummary.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.number,
    orderNumber: PropTypes.string.isRequired,
    orderDate: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        product: PropTypes.shape({
          name: PropTypes.string,
          price: PropTypes.number,
          imageUrls: PropTypes.arrayOf(PropTypes.string),
        }),
        productName: PropTypes.string,
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired,
        subtotal: PropTypes.number,
      })
    ),
    subtotal: PropTypes.number.isRequired,
    tax: PropTypes.number.isRequired,
    shipping: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    shippingAddress: PropTypes.shape({
      recipientName: PropTypes.string,
      fullName: PropTypes.string,
      addressLine1: PropTypes.string.isRequired,
      addressLine2: PropTypes.string,
      city: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      postalCode: PropTypes.string.isRequired,
      country: PropTypes.string,
      phoneNumber: PropTypes.string,
    }),
    paymentMethod: PropTypes.string,
    paymentStatus: PropTypes.oneOf(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  }),
  showShippingAddress: PropTypes.bool,
  showPaymentInfo: PropTypes.bool,
  showItemDetails: PropTypes.bool,
};

export default OrderSummary;
