import api from './api';

/**
 * Manufacturer Service
 * Handles manufacturer data retrieval for product management.
 */
const manufacturerService = {
  /**
   * Get all manufacturers.
   * 
   * @returns {Promise<Array>} List of all manufacturers
   */
  async getAllManufacturers() {
    const response = await api.get('/manufacturers');
    return response.data;
  },

  /**
   * Get manufacturer by ID.
   * 
   * @param {number} manufacturerId - Manufacturer ID
   * @returns {Promise<Object>} Manufacturer details
   */
  async getManufacturerById(manufacturerId) {
    const response = await api.get(`/manufacturers/${manufacturerId}`);
    return response.data;
  },

  /**
   * Get manufacturers with pagination.
   * 
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @returns {Promise<Object>} Paged response with manufacturers
   */
  async getManufacturers(page = 0, size = 20) {
    const response = await api.get('/manufacturers', {
      params: { page, size }
    });
    return response.data;
  }
};

export default manufacturerService;
