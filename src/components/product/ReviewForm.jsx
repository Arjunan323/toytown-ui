import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { StarBorder as StarBorderIcon } from '@mui/icons-material';
import { submitReview, selectReviewSubmitting, selectSubmitError } from '../../store/slices/reviewSlice';

const ReviewForm = ({ productId, onSuccess }) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectReviewSubmitting);
  const submitError = useSelector(selectSubmitError);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [errors, setErrors] = useState({});
  const [hoverRating, setHoverRating] = useState(0);

  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = 'Please write a review';
    } else if (reviewText.length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters';
    } else if (reviewText.length > 2000) {
      newErrors.reviewText = 'Review must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        submitReview({
          productId,
          reviewData: {
            rating,
            reviewText: reviewText.trim(),
          },
        })
      ).unwrap();

      // Reset form
      setRating(0);
      setReviewText('');
      setErrors({});

      // Notify parent
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const getRatingLabel = (value) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return labels[value] || '';
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Write a Review
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Your Rating *
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
                if (errors.rating) {
                  setErrors((prev) => ({ ...prev, rating: '' }));
                }
              }}
              onChangeActive={(event, newHover) => {
                setHoverRating(newHover);
              }}
              size="large"
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
            />
            <Typography variant="body2" color="text.secondary">
              {getRatingLabel(hoverRating || rating)}
            </Typography>
          </Box>
          {errors.rating && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.rating}
            </Typography>
          )}
        </Box>

        {/* Review Text */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review *"
            placeholder="Share your experience with this product..."
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value);
              if (errors.reviewText) {
                setErrors((prev) => ({ ...prev, reviewText: '' }));
              }
            }}
            error={Boolean(errors.reviewText)}
            helperText={
              errors.reviewText ||
              `${reviewText.length}/2000 characters (minimum 10)`
            }
            inputProps={{ maxLength: 2000 }}
          />
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          fullWidth
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          * Your review will be checked for quality and may take some time to appear.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReviewForm;
