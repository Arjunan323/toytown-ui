import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BannerCarousel from '../components/BannerCarousel';
import FeaturedToys from '../components/FeaturedToys';
import NewArrivals from '../components/NewArrivals';
import { fetchHomepageContent } from '../store/slices/homepageSlice';
import { Package, RefreshCw } from 'lucide-react';

/**
 * Main homepage with promotional banners, featured toys, and new arrivals.
 */
const HomePage = () => {
  const dispatch = useDispatch();
  
  const { banners, featuredProducts, newArrivals, loading, error } = useSelector(
    (state) => state.homepage
  );

  useEffect(() => {
    dispatch(fetchHomepageContent());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pattern">
        <div className="text-center space-y-4">
          <div className="spinner mx-auto"></div>
          <p className="text-xl font-display text-gray-600">Loading amazing toys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern">
        <div className="max-w-md w-full mx-4">
          <div className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800">Oops! Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => dispatch(fetchHomepageContent())}
              className="btn-primary mx-auto flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasContent = (banners && banners.length > 0) || 
                     (featuredProducts && featuredProducts.length > 0) || 
                     (newArrivals && newArrivals.length > 0);

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom">
        {/* Promotional Banners Carousel */}
        {banners && banners.length > 0 && (
          <BannerCarousel banners={banners} />
        )}

        {/* Featured Toys Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <FeaturedToys products={featuredProducts} />
        )}

        {/* New Arrivals Section */}
        {newArrivals && newArrivals.length > 0 && (
          <NewArrivals products={newArrivals} />
        )}

        {/* Empty State */}
        {!hasContent && (
          <div className="text-center py-20">
            <div className="card max-w-2xl mx-auto p-12 space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-12 h-12 text-primary-600" />
              </div>
              <h2 className="text-3xl font-display font-bold text-gradient">
                Welcome to ToyTown!
              </h2>
              <p className="text-xl text-gray-600">
                Check back soon for featured toys and exciting promotions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
