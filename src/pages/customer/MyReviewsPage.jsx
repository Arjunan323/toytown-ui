import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, MessageSquare, Package } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { fetchMyReviews } from '../../store/slices/reviewSlice';
import { format } from 'date-fns';

/**
 * MyReviewsPage Component
 * 
 * Displays list of user's product reviews with edit/delete options.
 */
const MyReviewsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myReviews, loading } = useSelector((state) => state.review);

  useEffect(() => {
    dispatch(fetchMyReviews({ page: 0, size: 20 }));
  }, [dispatch]);

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await dispatch(deleteReview(reviewId)).unwrap();
        dispatch(fetchMyReviews({ page: 0, size: 20 }));
      } catch (err) {
        console.error('Failed to delete review:', err);
      }
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return <Spinner fullPage message="Loading your reviews..." />;
  }

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
            My Reviews
          </h1>
          <p className="text-lg text-gray-600">
            Your product reviews and ratings
          </p>
        </div>

        {/* Reviews List */}
        {!myReviews || myReviews.content?.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              No Reviews Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't reviewed any products yet. Start shopping to share your experience!
            </p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myReviews.content.map((review) => (
              <div key={review.id} className="card p-6 hover:shadow-card-hover transition-shadow duration-300">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <div 
                    className="w-full md:w-32 h-32 flex-shrink-0 cursor-pointer"
                    onClick={() => handleProductClick(review.productId)}
                  >
                    <img
                      src={review.productImageUrl || '/placeholder-toy.jpg'}
                      alt={review.productName}
                      className="w-full h-full object-cover rounded-xl hover:opacity-80 transition-opacity duration-200"
                    />
                  </div>

                  {/* Review Details */}
                  <div className="flex-1 space-y-3">
                    {/* Product Name & Date */}
                    <div>
                      <h3 
                        className="text-lg font-bold text-gray-800 hover:text-primary-600 cursor-pointer"
                        onClick={() => handleProductClick(review.productId)}
                      >
                        {review.productName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Reviewed on {format(new Date(review.createdDate || Date.now()), 'MMM dd, yyyy')}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-5 h-5 ${
                              index < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-700">{review.rating}/5</span>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h4 className="font-semibold text-gray-800">{review.title}</h4>
                    )}

                    {/* Review Comment */}
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                    {/* Actions */}
                    <div className="flex items-center space-x-4 pt-2">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {myReviews?.totalPages > 1 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing page {(myReviews.page || 0) + 1} of {myReviews.totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;
