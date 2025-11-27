import api from './api';

const API_BASE_URL = '/admin/categories';

/**
 * Admin service for category management.
 * Provides API methods for CRUD, soft delete, and reordering categories.
 */
const adminCategoryService = {
  /**
   * Get all categories with pagination.
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @param {string} sort - Sort criteria (e.g., 'displayOrder,asc')
   * @returns {Promise} Page of categories
   */
  getAllCategories: async (page = 0, size = 20, sort = 'displayOrder,asc') => {
    const response = await api.get(API_BASE_URL, {
      params: { page, size, sort }
    });
    return response.data;
  },

  /**
   * Get hierarchical category tree.
   * @returns {Promise} Array of top-level categories with nested subcategories
   */
  getCategoryTree: async () => {
    const response = await api.get(`${API_BASE_URL}/tree`);
    return response.data;
  },

  /**
   * Get category by ID.
   * @param {number} id - Category ID
   * @returns {Promise} Category data
   */
  getCategoryById: async (id) => {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new category.
   * @param {Object} categoryData - Category data
   * @returns {Promise} Created category
   */
  createCategory: async (categoryData) => {
    const response = await api.post(API_BASE_URL, categoryData);
    return response.data;
  },

  /**
   * Update an existing category.
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise} Updated category
   */
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`${API_BASE_URL}/${id}`, categoryData);
    return response.data;
  },

  /**
   * Soft delete a category.
   * @param {number} id - Category ID
   * @returns {Promise} Void
   */
  deleteCategory: async (id) => {
    await api.delete(`${API_BASE_URL}/${id}`);
  },

  /**
   * Toggle category active/inactive status.
   * @param {number} id - Category ID
   * @returns {Promise} Updated category
   */
  toggleActiveStatus: async (id) => {
    const response = await api.patch(`${API_BASE_URL}/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Reorder categories by updating display order.
   * @param {Array} reorderList - Array of {categoryId, displayOrder} objects
   * @returns {Promise} Void
   */
  reorderCategories: async (reorderList) => {
    await api.patch(`${API_BASE_URL}/reorder`, reorderList);
  }
};

export default adminCategoryService;
