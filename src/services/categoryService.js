import api from './api';

/**
 * Category Service
 * Handles category browsing and hierarchy
 */
const categoryService = {
  /**
   * Get all categories
   * @returns {Promise} List of all categories ordered by display order
   */
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Get category by ID
   * @param {number} categoryId - Category ID
   * @returns {Promise} Category details
   */
  getCategoryById: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Get root categories (top-level categories)
   * @returns {Promise} List of root categories
   */
  getRootCategories: async () => {
    const response = await api.get('/categories/root');
    return response.data;
  },

  /**
   * Get subcategories for a parent category
   * @param {number} parentCategoryId - Parent category ID
   * @returns {Promise} List of subcategories
   */
  getSubcategories: async (parentCategoryId) => {
    const response = await api.get(`/categories/${parentCategoryId}/subcategories`);
    return response.data;
  },

  /**
   * Build category tree structure
   * Helper function to organize categories into a hierarchical tree
   * @param {Array} categories - Flat list of categories
   * @returns {Array} Tree structure of categories
   */
  buildCategoryTree: (categories) => {
    const categoryMap = {};
    const roots = [];

    // Create a map of categories by ID
    categories.forEach(category => {
      categoryMap[category.id] = { ...category, children: [] };
    });

    // Build tree structure
    categories.forEach(category => {
      if (category.parentCategoryId) {
        // Add to parent's children
        const parent = categoryMap[category.parentCategoryId];
        if (parent) {
          parent.children.push(categoryMap[category.id]);
        }
      } else {
        // Root category
        roots.push(categoryMap[category.id]);
      }
    });

    return roots;
  },
};

export default categoryService;
