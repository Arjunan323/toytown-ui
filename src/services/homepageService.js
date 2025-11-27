import api from './api';

/**
 * Service for homepage content operations.
 * Handles fetching banners, featured products, and new arrivals.
 */
const homepageService = {
  /**
   * Get complete homepage content (banners + featured + new arrivals).
   * @returns {Promise<Object>} Homepage content with banners, featuredProducts, newArrivals
   */
  getHomepageContent: async () => {
    const response = await api.get('/homepage');
    return response.data;
  },

  /**
   * Get active promotional banners.
   * @returns {Promise<Array>} List of active banners
   */
  getBanners: async () => {
    const response = await api.get('/homepage/banners');
    return response.data;
  },

  /**
   * Get featured toys.
   * @param {number} limit - Number of products to fetch (default 12)
   * @returns {Promise<Array>} List of featured products
   */
  getFeaturedProducts: async (limit = 12) => {
    const response = await api.get('/homepage/featured', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get new arrival toys.
   * @param {number} limit - Number of products to fetch (default 12)
   * @returns {Promise<Array>} List of new arrival products
   */
  getNewArrivals: async (limit = 12) => {
    const response = await api.get('/homepage/new-arrivals', {
      params: { limit }
    });
    return response.data;
  },
};

export default homepageService;
