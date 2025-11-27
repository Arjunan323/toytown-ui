import PropTypes from 'prop-types';
import { Star, User, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';

/**
 * ReviewList Component
 * 
 * Displays a list of product reviews with ratings, user info, and helpful votes.
 */
const ReviewList = ({ reviews, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || !reviews.content || reviews.content.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-display font-bold text-gray-800 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="review-list">
      {reviews.content.map((review) => (
        <div key={review.id} className="card p-6 space-y-4">
          {/* Review Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* User Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              
              {/* User Info & Rating */}
              <div>
                <h4 className="font-bold text-gray-800">
                  {review.customerName || 'Anonymous'}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${
                          index < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.createdDate || Date.now()), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Title */}
          {review.title && (
            <h5 className="font-semibold text-gray-800">{review.title}</h5>
          )}

          {/* Review Comment */}
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>

          {/* Helpful Button */}
          <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">Helpful</span>
              {review.helpfulCount > 0 && (
                <span className="text-sm text-gray-500">({review.helpfulCount})</span>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

ReviewList.propTypes = {
  reviews: PropTypes.shape({
    content: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string.isRequired,
        title: PropTypes.string,
        customerName: PropTypes.string,
        createdDate: PropTypes.string,
        helpfulCount: PropTypes.number,
      })
    ),
    totalElements: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default ReviewList;
