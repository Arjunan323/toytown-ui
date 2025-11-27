import api from './api';

/**
 * Service for admin banner management operations.
 * All endpoints require ADMIN role authentication.
 */
const adminBannerService = {
  /**
   * Get all banners (admin view).
   * @returns {Promise<Array>} List of all banners
   */
  getAllBanners: async () => {
    const response = await api.get('/admin/banners');
    return response.data;
  },

  /**
   * Get banner by ID.
   * @param {number} bannerId - Banner ID
   * @returns {Promise<Object>} Banner details
   */
  getBannerById: async (bannerId) => {
    const response = await api.get(`/admin/banners/${bannerId}`);
    return response.data;
  },

  /**
   * Create new promotional banner.
   * @param {Object} bannerData - Banner creation data
   * @returns {Promise<Object>} Created banner
   */
  createBanner: async (bannerData) => {
    const response = await api.post('/admin/banners', bannerData);
    return response.data;
  },

  /**
   * Update existing banner.
   * @param {number} bannerId - Banner ID
   * @param {Object} bannerData - Banner update data
   * @returns {Promise<Object>} Updated banner
   */
  updateBanner: async (bannerId, bannerData) => {
    const response = await api.put(`/admin/banners/${bannerId}`, bannerData);
    return response.data;
  },

  /**
   * Delete banner.
   * @param {number} bannerId - Banner ID
   * @returns {Promise<void>}
   */
  deleteBanner: async (bannerId) => {
    await api.delete(`/admin/banners/${bannerId}`);
  },

  /**
   * Toggle banner active status.
   * @param {number} bannerId - Banner ID
   * @returns {Promise<Object>} Updated banner
   */
  toggleBannerStatus: async (bannerId) => {
    const response = await api.patch(`/admin/banners/${bannerId}/toggle`);
    return response.data;
  },

  /**
   * Upload banner image to OCI Object Storage.
   * @param {number} bannerId - Banner ID
   * @param {File} file - Image file
   * @returns {Promise<Object>} Updated banner with new image URL
   */
  uploadBannerImage: async (bannerId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/admin/banners/${bannerId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Toggle product featured status.
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Updated product
   */
  toggleProductFeatured: async (productId) => {
    const response = await api.patch(`/admin/products/${productId}/featured`);
    return response.data;
  },
};

export default adminBannerService;
