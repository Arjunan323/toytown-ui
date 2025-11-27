import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Home, ChevronRight, X } from 'lucide-react';
import ProductDetail from '../../components/product/ProductDetail';
import ReviewList from '../../components/product/ReviewList';
import ReviewForm from '../../components/product/ReviewForm';
import Spinner from '../../components/common/Spinner';
import {
  fetchProductById,
  clearCurrentProduct,
  clearError,
} from '../../store/slices/productSlice';
import {
  fetchProductReviews,
  selectProductReviews,
  selectReviewsLoading,
  clearReviews,
} from '../../store/slices/reviewSlice';

/**
 * ProductDetailPage Component
 * 
 * Full product details page with image gallery, specifications, reviews,
 * and add-to-cart functionality.
 * 
 * @component
 */
const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentProduct,
    loading,
    error,
  } = useSelector((state) => state.product);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const reviews = useSelector((state) => selectProductReviews(state, productId));
  const reviewsLoading = useSelector(selectReviewsLoading);

  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // Fetch product details
    if (productId) {
      dispatch(fetchProductById(productId));
      dispatch(fetchProductReviews({ productId, page: 0, size: 10 }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentProduct());
      dispatch(clearError());
      dispatch(clearReviews());
    };
  }, [dispatch, productId]);

  const handleReviewSubmitted = () => {
    // Refresh reviews after submission
    dispatch(fetchProductReviews({ productId, page: 0, size: 10 }));
  };

  // Loading skeleton
  if (loading && !currentProduct) {
    return (
      <div className="min-h-screen bg-pattern py-8">
        <div className="container-custom">
          <div className="space-y-4 mb-8">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center py-8">
        <div className="container-custom max-w-md">
          <div className="card p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800">Product Not Found</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No product found
  if (!currentProduct && !loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center py-8">
        <div className="container-custom max-w-md">
          <div className="card p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800">Product Not Available</h2>
            <p className="text-gray-600">The product you're looking for doesn't exist</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm mb-8" aria-label="Breadcrumb">
          <a href="/" className="text-primary-600 hover:text-primary-700 flex items-center">
            <Home className="w-4 h-4" />
          </a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <a href="/products" className="text-primary-600 hover:text-primary-700">
            Products
          </a>
          {currentProduct?.category && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <a
                href={`/category/${currentProduct.category.id || 1}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {currentProduct.category.name || currentProduct.category}
              </a>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-800 font-semibold truncate max-w-xs">
            {currentProduct?.name || 'Product Details'}
          </span>
        </nav>

        {/* Product Detail Component */}
        {currentProduct && (
          <ProductDetail product={currentProduct} />
        )}

        {/* Tabs for Description and Reviews */}
        <div className="mt-12">
          <div className="card overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${ 
                  activeTab === 'description'
                    ? 'bg-white text-primary-600 border-b-4 border-primary-500'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'bg-white text-primary-600 border-b-4 border-primary-500'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Reviews ({reviews?.totalElements || 0})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-display font-bold text-gray-800 mb-4">
                    Product Description
                  </h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {currentProduct?.description || 'No description available.'}
                  </div>
                  
                  {/* Additional Product Info */}
                  {currentProduct?.specifications && (
                    <div className="mt-8">
                      <h4 className="text-xl font-display font-bold text-gray-800 mb-4">
                        Specifications
                      </h4>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(currentProduct.specifications).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <dt className="text-sm font-semibold text-gray-600 uppercase">{key}</dt>
                            <dd className="text-gray-800 mt-1">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  <ReviewList reviews={reviews} loading={reviewsLoading} />
                  
                  {isAuthenticated ? (
                    <ReviewForm
                      productId={productId}
                      onSuccess={handleReviewSubmitted}
                    />
                  ) : (
                    <div className="card p-8 text-center bg-primary-50">
                      <h3 className="text-xl font-display font-bold text-gray-800 mb-2">
                        Want to write a review?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Please sign in to share your experience with this product
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                      >
                        Sign In to Review
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
