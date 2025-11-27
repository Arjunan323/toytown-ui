import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';

/**
 * CartSummary Component
 * 
 * Displays cart totals, promotional code input, and checkout button.
 * Used on cart page and checkout page.
 * 
 * @component
 */
const CartSummary = ({
  items = [],
  subtotal = 0,
  tax = 0,
  shipping = 0,
  discount = 0,
  total = 0,
  itemCount = 0,
  onCheckout,
  onApplyPromo,
  checkoutButtonText = 'Proceed to Checkout',
  showPromoCode = true,
  loading = false,
  disabled = false,
}) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculatedSubtotal = subtotal || items.reduce((sum, item) => {
    const itemSubtotal = item.subtotal || (item.product?.price * item.quantity);
    return sum + itemSubtotal;
  }, 0);

  const calculatedItemCount = itemCount || items.reduce((sum, item) => sum + item.quantity, 0);
  
  const freeShippingThreshold = 500;
  const calculatedShipping = shipping !== undefined ? shipping : (calculatedSubtotal >= freeShippingThreshold ? 0 : 50);
  
  const calculatedTax = tax || (calculatedSubtotal * 0.18); // 18% GST
  
  const calculatedTotal = total || (calculatedSubtotal + calculatedShipping + calculatedTax - discount);

  const shippingMessage = calculatedSubtotal < freeShippingThreshold
    ? `Add ${formatPrice(freeShippingThreshold - calculatedSubtotal)} more for free shipping!`
    : 'You qualify for free shipping!';

  return (
    <Card variant="outlined" sx={{ position: 'sticky', top: 16 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ mr: 1 }} />
          Order Summary
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Item Count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Items ({calculatedItemCount})
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {formatPrice(calculatedSubtotal)}
          </Typography>
        </Box>

        {/* Shipping */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Shipping
          </Typography>
          <Typography
            variant="body2"
            fontWeight="medium"
            color={calculatedShipping === 0 ? 'success.main' : 'text.primary'}
          >
            {calculatedShipping === 0 ? 'FREE' : formatPrice(calculatedShipping)}
          </Typography>
        </Box>

        {/* Free Shipping Progress */}
        {calculatedSubtotal < freeShippingThreshold && (
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            {shippingMessage}
          </Alert>
        )}

        {/* Tax */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Tax (GST 18%)
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {formatPrice(calculatedTax)}
          </Typography>
        </Box>

        {/* Discount */}
        {discount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="success.main">
              Discount
            </Typography>
            <Typography variant="body2" fontWeight="medium" color="success.main">
              -{formatPrice(discount)}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Total */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Total
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatPrice(calculatedTotal)}
          </Typography>
        </Box>

        {/* Promo Code */}
        {showPromoCode && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter promo code"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={onApplyPromo}
                      disabled={disabled}
                      color="primary"
                    >
                      <LocalOfferIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* Checkout Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleCheckout}
          disabled={disabled || loading || calculatedItemCount === 0}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Processing...' : checkoutButtonText}
        </Button>

        {/* Empty Cart Message */}
        {calculatedItemCount === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Your cart is empty
          </Alert>
        )}

        {/* Security Note */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          🔒 Secure checkout with Razorpay
        </Typography>
      </CardContent>
    </Card>
  );
};

CartSummary.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      product: PropTypes.shape({
        price: PropTypes.number,
      }),
      quantity: PropTypes.number,
      subtotal: PropTypes.number,
    })
  ),
  subtotal: PropTypes.number,
  tax: PropTypes.number,
  shipping: PropTypes.number,
  discount: PropTypes.number,
  total: PropTypes.number,
  itemCount: PropTypes.number,
  onCheckout: PropTypes.func,
  onApplyPromo: PropTypes.func,
  checkoutButtonText: PropTypes.string,
  showPromoCode: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CartSummary;
