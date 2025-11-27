import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';

/**
 * CartItem Component
 * 
 * Displays a single item in the shopping cart with image, name, price, quantity controls,
 * and remove functionality.
 * 
 * @component
 */
const CartItem = ({
  item,
  onUpdate,
  onRemove,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  if (!item) {
    return null;
  }

  const {
    id: itemId,
    productId,
    productName: name,
    productPrice: price,
    productImageUrl,
    quantity,
    subtotal,
    availableStock: stockQuantity = 0,
    inStock = true,
  } = item;

  // Use productImageUrl from item
  const imageUrl = productImageUrl || '/placeholder-toy.jpg';
  const maxQuantity = Math.min(stockQuantity, 10);
  const isInStock = inStock && stockQuantity > 0;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > maxQuantity || isUpdating) {
      return;
    }

    setError(null);
    setIsUpdating(true);

    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      if (onUpdate) {
        onUpdate(itemId, newQuantity);
      }
    } catch (err) {
      setError(err || 'Failed to update quantity');
      console.error('Failed to update cart item:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;

    setError(null);
    setIsUpdating(true);

    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      if (onRemove) {
        onRemove(itemId);
      }
    } catch (err) {
      setError(err || 'Failed to remove item');
      console.error('Failed to remove cart item:', err);
      setIsUpdating(false);
    }
  };

  const handleProductClick = () => {
    navigate(`/products/${productId}`);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        opacity: disabled || isUpdating ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <Box sx={{ display: 'flex', p: 2 }}>
        {/* Product Image */}
        <CardMedia
          component="img"
          sx={{
            width: 120,
            height: 120,
            objectFit: 'cover',
            borderRadius: 1,
            cursor: 'pointer',
            flexShrink: 0,
          }}
          image={imageUrl}
          alt={name}
          onClick={handleProductClick}
        />

        {/* Product Details */}
        <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
                flexGrow: 1,
                pr: 2,
              }}
              onClick={handleProductClick}
            >
              {name}
            </Typography>

            {/* Remove Button */}
            <Tooltip title="Remove from cart">
              <IconButton
                onClick={handleRemove}
                disabled={disabled || isUpdating}
                color="error"
                size="small"
                sx={{ flexShrink: 0 }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Price */}
          <Typography variant="body1" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
            {formatPrice(price)} each
          </Typography>

          {/* Stock Status */}
          {!isInStock && (
            <Alert severity="error" sx={{ mb: 2 }}>
              This item is currently out of stock
            </Alert>
          )}

          {/* Quantity Control and Subtotal */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            {/* Quantity Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Quantity:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <IconButton
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={disabled || isUpdating || quantity <= 1}
                  size="small"
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  value={quantity}
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: 'center', width: '50px' },
                  }}
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  size="small"
                />
                <IconButton
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={disabled || isUpdating || quantity >= maxQuantity || !inStock}
                  size="small"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              {stockQuantity > 0 && stockQuantity < 10 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  Only {stockQuantity} left
                </Typography>
              )}
            </Box>

            {/* Subtotal */}
            <Typography variant="h6" color="primary" fontWeight="bold">
              Subtotal: {formatPrice(subtotal || price * quantity)}
            </Typography>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Box>
    </Card>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    productId: PropTypes.number.isRequired,
    productName: PropTypes.string.isRequired,
    productPrice: PropTypes.number.isRequired,
    productImageUrl: PropTypes.string,
    quantity: PropTypes.number.isRequired,
    subtotal: PropTypes.number,
    availableStock: PropTypes.number,
    inStock: PropTypes.bool,
  }).isRequired,
  onUpdate: PropTypes.func,
  onRemove: PropTypes.func,
  disabled: PropTypes.bool,
};

export default CartItem;
