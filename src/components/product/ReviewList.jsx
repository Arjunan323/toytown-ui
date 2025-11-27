import { Box, Typography, Rating, Paper, Grid, Chip, Divider, Pagination } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const ReviewList = ({ reviews, loading }) => {
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading reviews...</Typography>
      </Box>
    );
  }

  if (!reviews || !reviews.content || reviews.content.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No reviews yet. Be the first to review this product!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Review Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customer Reviews ({reviews.totalElements})
        </Typography>
        {reviews.totalElements > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              value={reviews.content.reduce((acc, r) => acc + r.rating, 0) / reviews.content.length}
              precision={0.1}
              readOnly
            />
            <Typography variant="body2" color="text.secondary">
              {(reviews.content.reduce((acc, r) => acc + r.rating, 0) / reviews.content.length).toFixed(1)} out of 5
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Review List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {reviews.content.map((review) => (
          <Paper key={review.reviewId} variant="outlined" sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {review.customerName}
                  </Typography>
                  {review.verifiedPurchase && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Verified Purchase"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {new Date(review.submissionDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Rating value={review.rating} readOnly size="small" />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {review.reviewText}
                </Typography>
              </Grid>

              {review.moderationStatus === 'FLAGGED' && (
                <Grid item xs={12}>
                  <Chip label="Under Review" size="small" color="warning" />
                </Grid>
              )}
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Pagination */}
      {reviews.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={reviews.totalPages}
            page={reviews.number + 1}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ReviewList;
