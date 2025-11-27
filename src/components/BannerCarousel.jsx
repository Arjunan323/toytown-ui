import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import './BannerCarousel.css';

/**
 * Promotional banner carousel for homepage.
 * Displays banners with auto-rotation and manual navigation.
 */
const BannerCarousel = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    if (!banners || banners.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners, isPaused]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const handleBannerClick = (banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    } else if (banner.linkProductId) {
      window.location.href = `/products/${banner.linkProductId}`;
    }
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div 
      className="banner-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="banner-container">
        {/* Banner Image */}
        <div 
          className={`banner-slide ${currentBanner.linkUrl || currentBanner.linkProductId ? 'clickable' : ''}`}
          onClick={() => handleBannerClick(currentBanner)}
          style={{ cursor: (currentBanner.linkUrl || currentBanner.linkProductId) ? 'pointer' : 'default' }}
        >
          <img 
            src={currentBanner.imageUrl} 
            alt={currentBanner.title}
            className="banner-image"
          />
          <div className="banner-overlay">
            <h2 className="banner-title">{currentBanner.title}</h2>
          </div>
        </div>

        {/* Navigation Arrows (only show if multiple banners) */}
        {banners.length > 1 && (
          <>
            <button 
              className="carousel-arrow carousel-arrow-left"
              onClick={handlePrevious}
              aria-label="Previous banner"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              className="carousel-arrow carousel-arrow-right"
              onClick={handleNext}
              aria-label="Next banner"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Dots Navigation (only show if multiple banners) */}
        {banners.length > 1 && (
          <div className="carousel-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

BannerCarousel.propTypes = {
  banners: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      linkUrl: PropTypes.string,
      linkProductId: PropTypes.number,
      displayOrder: PropTypes.number.isRequired,
    })
  ),
};

BannerCarousel.defaultProps = {
  banners: [],
};

export default BannerCarousel;
