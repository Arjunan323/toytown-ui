import api from './api';

const API_BASE_URL = '/admin/manufacturers';

/**
 * Admin service for manufacturer management.
 * Provides API methods for CRUD, soft delete, and logo upload.
 */
const adminManufacturerService = {
  /**
   * Get all manufacturers with pagination.
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @param {string} sort - Sort criteria (e.g., 'name,asc')
   * @returns {Promise} Page of manufacturers
   */
  getAllManufacturers: async (page = 0, size = 20, sort = 'name,asc') => {
    const response = await api.get(API_BASE_URL, {
      params: { page, size, sort }
    });
    return response.data;
  },

  /**
   * Get all active manufacturers.
   * @returns {Promise} Array of active manufacturers
   */
  getActiveManufacturers: async () => {
    const response = await api.get(`${API_BASE_URL}/active`);
    return response.data;
  },

  /**
   * Get manufacturer by ID.
   * @param {number} id - Manufacturer ID
   * @returns {Promise} Manufacturer data
   */
  getManufacturerById: async (id) => {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new manufacturer.
   * @param {Object} manufacturerData - Manufacturer data
   * @returns {Promise} Created manufacturer
   */
  createManufacturer: async (manufacturerData) => {
    const response = await api.post(API_BASE_URL, manufacturerData);
    return response.data;
  },

  /**
   * Update an existing manufacturer.
   * @param {number} id - Manufacturer ID
   * @param {Object} manufacturerData - Updated manufacturer data
   * @returns {Promise} Updated manufacturer
   */
  updateManufacturer: async (id, manufacturerData) => {
    const response = await api.put(`${API_BASE_URL}/${id}`, manufacturerData);
    return response.data;
  },

  /**
   * Upload logo for manufacturer.
   * @param {number} id - Manufacturer ID
   * @param {File} file - Logo image file
   * @returns {Promise} Updated manufacturer with logo URL
   */
  uploadLogo: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`${API_BASE_URL}/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Soft delete a manufacturer.
   * @param {number} id - Manufacturer ID
   * @returns {Promise} Void
   */
  deleteManufacturer: async (id) => {
    await api.delete(`${API_BASE_URL}/${id}`);
  },

  /**
   * Toggle manufacturer active/inactive status.
   * @param {number} id - Manufacturer ID
   * @returns {Promise} Updated manufacturer
   */
  toggleActiveStatus: async (id) => {
    const response = await api.patch(`${API_BASE_URL}/${id}/toggle-status`);
    return response.data;
  }
};

export default adminManufacturerService;
