import api from './api';

/**
 * Admin product management service for CRUD operations on products.
 * All endpoints require ADMIN role authentication.
 */
const adminProductService = {
  /**
   * Get all products with pagination and filters (admin view).
   * 
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-indexed)
   * @param {number} params.size - Page size
   * @param {boolean} params.discontinued - Filter by discontinued status
   * @param {string} params.sortBy - Field to sort by
   * @param {string} params.sortDir - Sort direction (asc/desc)
   * @returns {Promise<Object>} Paged response with products
   */
  async getAllProducts(params = {}) {
    const {
      page = 0,
      size = 20,
      discontinued = null,
      sortBy = 'createdDate',
      sortDir = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });

    if (discontinued !== null) {
      queryParams.append('discontinued', discontinued.toString());
    }

    const response = await api.get(`/admin/products?${queryParams}`);
    return response.data;
  },

  /**
   * Get product by ID (includes discontinued products for admin).
   * 
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Product details
   */
  async getProductById(productId) {
    const response = await api.get(`/admin/products/${productId}`);
    return response.data;
  },

  /**
   * Create a new product.
   * 
   * @param {Object} productData - Product details
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  /**
   * Update an existing product.
   * 
   * @param {number} productId - Product ID
   * @param {Object} productData - Updated product details
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productId, productData) {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  /**
   * Update product stock quantity.
   * 
   * @param {number} productId - Product ID
   * @param {number} stockQuantity - New stock quantity
   * @returns {Promise<Object>} Updated product
   */
  async updateStock(productId, stockQuantity) {
    const response = await api.patch(`/admin/products/${productId}/stock`, {
      stockQuantity
    });
    return response.data;
  },

  /**
   * Discontinue a product (soft delete).
   * 
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Updated product
   */
  async discontinueProduct(productId) {
    const response = await api.patch(`/admin/products/${productId}/discontinue`);
    return response.data;
  },

  /**
   * Reactivate a discontinued product.
   * 
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Updated product
   */
  async reactivateProduct(productId) {
    const response = await api.patch(`/admin/products/${productId}/reactivate`);
    return response.data;
  },

  /**
   * Get products with low stock (below threshold).
   * 
   * @returns {Promise<Array>} List of low-stock products
   */
  async getLowStockProducts() {
    const response = await api.get('/admin/products/low-stock');
    return response.data;
  },

  /**
   * Upload product images.
   * 
   * @param {number} productId - Product ID
   * @param {Array<File>} files - Image files to upload
   * @param {Array<string>} altTexts - Alt texts for images
   * @param {boolean} isPrimary - Set first image as primary
   * @returns {Promise<Array>} List of uploaded image details
   */
  async uploadImages(productId, files, altTexts = [], isPrimary = false) {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    altTexts.forEach((altText) => {
      formData.append('altTexts', altText);
    });
    
    formData.append('isPrimary', isPrimary.toString());

    const response = await api.post(`/admin/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  /**
   * Get all images for a product.
   * 
   * @param {number} productId - Product ID
   * @returns {Promise<Array>} List of product images
   */
  async getProductImages(productId) {
    const response = await api.get(`/admin/products/${productId}/images`);
    return response.data;
  },

  /**
   * Delete a product image.
   * 
   * @param {number} productId - Product ID
   * @param {number} imageId - Image ID
   * @returns {Promise<void>}
   */
  async deleteImage(productId, imageId) {
    await api.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  /**
   * Set an image as the primary product image.
   * 
   * @param {number} productId - Product ID
   * @param {number} imageId - Image ID
   * @returns {Promise<void>}
   */
  async setPrimaryImage(productId, imageId) {
    await api.patch(`/admin/products/${productId}/images/${imageId}/primary`);
  },

  /**
   * Toggle product featured status.
   * Featured products are displayed on the homepage.
   * 
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Updated product
   */
  async toggleFeaturedStatus(productId) {
    const response = await api.patch(`/admin/products/${productId}/featured`);
    return response.data;
  }
};

export default adminProductService;
