import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Rating,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AddShoppingCart as AddShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { addToCart } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';

/**
 * ProductCard Component
 * 
 * Displays a product card with image, name, price, rating, and add-to-cart functionality.
 * Used in product grids on category pages, search results, and homepage.
 * 
 * @component
 */
const ProductCard = ({
  id,
  name,
  price,
  imageUrl,
  rating = 0,
  reviewCount = 0,
  inStock = true,
  isFeatured = false,
  isNew = false,
  onClick,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (!inStock || isAdding) return;

    try {
      setIsAdding(true);
      await dispatch(addToCart({ productId: id, quantity: 1 })).unwrap();
      // Keep button in "Adding..." state briefly for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // TODO: Show error snackbar/notification
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    } else {
      navigate(`/products/${id}`);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite/wishlist functionality
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
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleCardClick}
    >
      {/* Badge Overlay */}
      {(isFeatured || isNew || !inStock) && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {isFeatured && (
            <Chip label="Featured" color="primary" size="small" />
          )}
          {isNew && (
            <Chip label="New" color="success" size="small" />
          )}
          {!inStock && (
            <Chip label="Out of Stock" color="error" size="small" />
          )}
        </Box>
      )}

      {/* Favorite Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        }}
        onClick={handleFavoriteClick}
        aria-label="Add to favorites"
      >
        {isFavorite ? (
          <FavoriteIcon color="error" />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>

      {/* Product Image */}
      <CardMedia
        component="img"
        height="200"
        image={imageUrl || '/placeholder-toy.jpg'}
        alt={name}
        sx={{
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
        }}
        loading="lazy"
      />

      {/* Product Info */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Tooltip title={name} placement="top">
          <Typography
            gutterBottom
            variant="h6"
            component="h3"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '3.6em',
              fontSize: '1rem',
            }}
          >
            {name}
          </Typography>
        </Tooltip>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={rating} precision={0.5} size="small" readOnly />
          {reviewCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({reviewCount})
            </Typography>
          )}
        </Box>

        {/* Price */}
        <Typography variant="h6" color="primary" fontWeight="bold">
          {formatPrice(price)}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          sx={{
            opacity: !inStock ? 0.6 : 1,
          }}
        >
          {isAdding ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardActions>
    </Card>
  );
};

ProductCard.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  imageUrl: PropTypes.string,
  rating: PropTypes.number,
  reviewCount: PropTypes.number,
  inStock: PropTypes.bool,
  isFeatured: PropTypes.bool,
  isNew: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ProductCard;
