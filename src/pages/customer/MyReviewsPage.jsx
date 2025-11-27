import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Rating,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  fetchMyReviews,
  selectMyReviews,
  selectReviewsLoading,
  selectReviewsError,
} from '../../store/slices/reviewSlice';

const MyReviewsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myReviews = useSelector(selectMyReviews);
  const loading = useSelector(selectReviewsLoading);
  const error = useSelector(selectReviewsError);

  useEffect(() => {
    dispatch(fetchMyReviews({ page: 0, size: 20 }));
  }, [dispatch]);

  const getModerationStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
      case 'APPROVED':
        return 'success';
      case 'FLAGGED':
        return 'warning';
      case 'HIDDEN':
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getModerationStatusLabel = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Published';
      case 'APPROVED':
        return 'Approved';
      case 'FLAGGED':
        return 'Under Review';
      case 'HIDDEN':
        return 'Hidden';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (loading && (!myReviews || !myReviews.content)) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your reviews...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          My Reviews
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all your product reviews
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {myReviews?.content && myReviews.content.length > 0 ? (
        <Box>
          <Grid container spacing={3}>
            {myReviews.content.map((review) => (
              <Grid item xs={12} key={review.reviewId}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    {/* Product Info */}
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {review.productImageUrl && (
                          <Box
                            component="img"
                            src={review.productImageUrl}
                            alt={review.productName}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                              cursor: 'pointer',
                            }}
                            onClick={() => navigate(`/products/${review.productId}`)}
                          />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/products/${review.productId}`)}
                          >
                            {review.productName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                              {review.rating}/5
                            </Typography>
                          </Box>
                          {review.verifiedPurchase && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                              <Typography variant="caption" color="success.main">
                                Verified Purchase
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>

                    {/* Status and Date */}
                    <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                      <Chip
                        label={getModerationStatusLabel(review.moderationStatus)}
                        color={getModerationStatusColor(review.moderationStatus)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(review.submissionDate).toLocaleDateString()}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        {review.reviewText}
                      </Typography>

                      {review.moderationReason && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="bold">
                            Moderation Note:
                          </Typography>
                          <Typography variant="body2">{review.moderationReason}</Typography>
                        </Alert>
                      )}

                      {review.reviewedByAdmin && review.reviewedDate && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                          Reviewed by admin on {new Date(review.reviewedDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Pagination Info */}
          {myReviews?.totalElements > 0 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {myReviews.content?.length || 0} of {myReviews.totalElements} reviews
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Reviews Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You haven't written any reviews yet. Purchase products and share your experience!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Start Shopping
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default MyReviewsPage;
