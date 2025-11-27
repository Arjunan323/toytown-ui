import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Rating,
  Chip,
  Divider,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AddShoppingCart as AddShoppingCartIcon,
  Remove as RemoveIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  LocalShipping as LocalShippingIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { addToCart } from '../../store/slices/cartSlice';

/**
 * ProductDetail Component
 * 
 * Displays full product details including image gallery, description, specifications,
 * reviews, and add-to-cart functionality with quantity selection.
 * 
 * @component
 */
const ProductDetail = ({
  product,
  onAddReview,
}) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) {
    return null;
  }

  const {
    id,
    name,
    description,
    price,
    stockQuantity = 0,
    minAge,
    maxAge,
    images: productImages = [],
    manufacturer,
    category,
    averageRating = 0,
    reviewCount = 0,
    sku,
    isFeatured = false,
  } = product;

  const inStock = stockQuantity > 0;
  // Extract image URLs from the images array
  const images = productImages.length > 0 
    ? productImages.map(img => img.imageUrl).filter(Boolean)
    : ['/placeholder-toy.jpg'];

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= Math.min(stockQuantity, 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!inStock || isAdding) return;

    try {
      setIsAdding(true);
      await dispatch(addToCart({ productId: id, quantity })).unwrap();
      // Keep button in adding state briefly for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // TODO: Show error notification
    } finally {
      setIsAdding(false);
    }
  };

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite/wishlist functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show "Link copied" notification
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Left Side - Image Gallery */}
        <Grid item xs={12} md={6}>
          {/* Main Image */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%', // 1:1 aspect ratio
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 2,
            }}
          >
            <img
              src={images[selectedImage]}
              alt={`${name} - Image ${selectedImage + 1}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
            
            {/* Badges */}
            {(isFeatured || !inStock) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {isFeatured && <Chip label="Featured" color="primary" />}
                {!inStock && <Chip label="Out of Stock" color="error" />}
              </Box>
            )}
          </Box>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <Grid container spacing={1}>
              {images.map((image, index) => (
                <Grid item xs={3} key={index}>
                  <Box
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '100%',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? 'primary.main' : 'divider',
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: 'primary.light',
                      },
                    }}
                  >
                    <img
                      src={image}
                      alt={`${name} - Thumbnail ${index + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Right Side - Product Information */}
        <Grid item xs={12} md={6}>
          {/* Title and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1, pr: 2 }}>
              {name}
            </Typography>
            <Box>
              <Tooltip title="Add to Favorites">
                <IconButton onClick={handleFavoriteClick} color={isFavorite ? 'error' : 'default'}>
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={averageRating} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </Typography>
          </Box>

          {/* Price */}
          <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 3 }}>
            {formatPrice(price)}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Product Details */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              {manufacturer && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Manufacturer:</strong> {manufacturer.name || manufacturer}
                  </Typography>
                </Grid>
              )}
              {category && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Category:</strong> {category.name || category}
                  </Typography>
                </Grid>
              )}
              {(minAge || maxAge) && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Recommended Age:</strong>{' '}
                    {minAge && maxAge ? `${minAge}-${maxAge} years` : minAge ? `${minAge}+ years` : `Up to ${maxAge} years`}
                  </Typography>
                </Grid>
              )}
              {sku && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>SKU:</strong> {sku}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="body2" color={inStock ? 'success.main' : 'error.main'}>
                  <strong>Availability:</strong> {inStock ? `In Stock (${stockQuantity} available)` : 'Out of Stock'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Quantity Selector and Add to Cart */}
          {inStock && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Quantity
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <IconButton
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={quantity}
                    inputProps={{
                      readOnly: true,
                      style: { textAlign: 'center', width: '60px' },
                    }}
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                  />
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= Math.min(stockQuantity, 10)}
                    size="small"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<AddShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  sx={{ flexGrow: 1 }}
                >
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Shipping Info */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" fontWeight="bold">
                  Free Shipping on orders over ₹500
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VerifiedIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" fontWeight="bold">
                  100% Authentic Products
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Divider sx={{ mb: 3 }} />

          {/* Description */}
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
            {description}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    stockQuantity: PropTypes.number,
    minAge: PropTypes.number,
    maxAge: PropTypes.number,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    manufacturer: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
      }),
    ]),
    category: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
      }),
    ]),
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    sku: PropTypes.string,
    isFeatured: PropTypes.bool,
  }),
  onAddReview: PropTypes.func,
};

export default ProductDetail;
