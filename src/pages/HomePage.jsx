import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BannerCarousel from '../components/BannerCarousel';
import FeaturedToys from '../components/FeaturedToys';
import NewArrivals from '../components/NewArrivals';
import { fetchHomepageContent } from '../store/slices/homepageSlice';
import './HomePage.css';

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
      <div className="homepage-loading">
        <div className="spinner"></div>
        <p>Loading homepage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage-error">
        <h2>Error Loading Homepage</h2>
        <p>{error}</p>
        <button 
          className="retry-btn"
          onClick={() => dispatch(fetchHomepageContent())}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="homepage-container">
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
        {(!banners || banners.length === 0) && 
         (!featuredProducts || featuredProducts.length === 0) && 
         (!newArrivals || newArrivals.length === 0) && (
          <div className="homepage-empty">
            <h2>Welcome to ToyTown!</h2>
            <p>Check back soon for featured toys and promotions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
