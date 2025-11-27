import api from './api';

/**
 * Review Service
 * Handles product review operations
 */
const reviewService = {
  /**
   * Get reviews for a product
   * @param {number} productId - Product ID
   * @param {number} page - Page number (default 0)
   * @param {number} size - Page size (default 10)
   * @returns {Promise} Paginated reviews
   */
  getProductReviews: async (productId, page = 0, size = 10) => {
    const response = await api.get(`/products/${productId}/reviews`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Submit a review for a product
   * @param {number} productId - Product ID
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.rating - Rating (1-5 stars)
   * @param {string} reviewData.reviewText - Review text (optional, max 2000 chars)
   * @returns {Promise} Created review
   */
  submitReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Get all reviews written by current customer
   * @param {number} page - Page number (default 0)
   * @param {number} size - Page size (default 10)
   * @returns {Promise} Paginated customer reviews
   */
  getMyReviews: async (page = 0, size = 10) => {
    const response = await api.get('/my-reviews', {
      params: { page, size },
    });
    return response.data;
  },
};

export default reviewService;
