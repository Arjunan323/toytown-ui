import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Star, Send } from 'lucide-react';
import { createReview } from '../../store/slices/reviewSlice';

/**
 * ReviewForm Component
 * 
 * Form for submitting product reviews with rating and comment.
 */
const ReviewForm = ({ productId, onSuccess }) => {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(
        createReview({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        })
      ).unwrap();

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6 mt-6">
      <h3 className="text-2xl font-display font-bold text-gray-800 mb-6">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Your Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform duration-200 hover:scale-110"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-gray-600 font-medium">
                {rating} {rating === 1 ? 'star' : 'stars'}
              </span>
            )}
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-semibold text-gray-700 mb-2">
            Review Title (Optional)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            className="input-field"
            maxLength={100}
          />
        </div>

        {/* Review Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you think about this product..."
            rows={5}
            className="input-field resize-none"
            maxLength={1000}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
        </button>
      </form>
    </div>
  );
};

ReviewForm.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSuccess: PropTypes.func,
};

export default ReviewForm;
