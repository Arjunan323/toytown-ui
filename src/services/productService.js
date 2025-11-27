import api from './api';

/**
 * Product Service
 * Handles product browsing, searching, filtering, and details
 */
const productService = {
  /**
   * Get all products with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-indexed)
   * @param {number} params.size - Page size
   * @param {string} params.sort - Sort field (e.g., 'name', 'price', 'createdDate')
   * @param {string} params.direction - Sort direction ('asc' or 'desc')
   * @returns {Promise} Paginated product list
   */
  getAllProducts: async (params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20,
      sort: params.sort || 'createdDate',
      direction: params.direction || 'desc',
    };
    const response = await api.get('/products', { params: queryParams });
    return response.data;
  },

  /**
   * Search products by keyword
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @returns {Promise} Search results with pagination
   */
  searchProducts: async (query, params = {}) => {
    const queryParams = {
      q: query,
      page: params.page || 0,
      size: params.size || 20,
    };
    const response = await api.get('/products/search', { params: queryParams });
    return response.data;
  },

  /**
   * Search products with comprehensive filters
   * @param {string} query - Search query (can be empty for filter-only search)
   * @param {Object} filters - Filter options
   * @param {string|number} filters.minPrice - Minimum price
   * @param {string|number} filters.maxPrice - Maximum price
   * @param {string|number} filters.minAge - Minimum age
   * @param {string|number} filters.maxAge - Maximum age
   * @param {string|number} filters.manufacturerId - Manufacturer ID
   * @param {string} filters.sortBy - Sort field (name, price, createdDate)
   * @param {string} filters.sortDirection - Sort direction (asc, desc)
   * @param {Object} pagination - Pagination options
   * @param {number} pagination.page - Page number (0-indexed)
   * @param {number} pagination.size - Page size
   * @returns {Promise} Search results with pagination
   */
  searchProductsWithFilters: async (query, filters = {}, pagination = {}) => {
    const queryParams = {
      page: pagination.page || 0,
      size: pagination.size || 20,
    };

    // Add search query if provided
    if (query && query.trim()) {
      queryParams.q = query.trim();
    }

    // Add filters if provided
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      queryParams.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      queryParams.maxPrice = filters.maxPrice;
    }
    if (filters.minAge !== undefined && filters.minAge !== '') {
      queryParams.minAge = filters.minAge;
    }
    if (filters.maxAge !== undefined && filters.maxAge !== '') {
      queryParams.maxAge = filters.maxAge;
    }
    if (filters.manufacturerId !== undefined && filters.manufacturerId !== '') {
      queryParams.manufacturerId = filters.manufacturerId;
    }

    // Add sorting if provided
    if (filters.sortBy) {
      queryParams.sort = filters.sortBy;
    }
    if (filters.sortDirection) {
      queryParams.direction = filters.sortDirection;
    }

    // Always use the /products/search endpoint as it supports comprehensive filtering
    // The backend endpoint handles both search queries and filter-only scenarios
    const response = await api.get('/products/search', { params: queryParams });
    return response.data;
  },

  /**
   * Get all manufacturers (with localStorage caching)
   * Cache refreshes daily to reduce API calls
   * @returns {Promise} List of manufacturers
   */
  getManufacturers: async () => {
    const CACHE_KEY = 'toytown_manufacturers';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    try {
      // Check cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Return cached data if less than 24 hours old
        if (age < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to read manufacturer cache:', error);
    }
    
    // Fetch fresh data
    const response = await api.get('/manufacturers');
    
    // Update cache
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: response.data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Failed to cache manufacturers:', error);
    }
    
    return response.data;
  },

  /**
   * Get product by ID
   * @param {number} productId - Product ID
   * @returns {Promise} Product details
   */
  getProductById: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  /**
   * Get products by category (or all products if categoryId is not provided)
   * @param {number|undefined} categoryId - Category ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise} Paginated products in category or all products
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20,
      sort: params.sort || 'name',
      direction: params.direction || 'asc',
    };

    // If categoryId is provided and valid, use it as query parameter
    // This supports both /products?categoryId=1 and /products (all products)
    if (categoryId && categoryId !== 'undefined' && !isNaN(categoryId)) {
      queryParams.categoryId = categoryId;
    }

    const response = await api.get('/products', { params: queryParams });
    return response.data;
  },

  /**
   * Get products by manufacturer
   * @param {number} manufacturerId - Manufacturer ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Paginated products by manufacturer
   */
  getProductsByManufacturer: async (manufacturerId, params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20,
    };
    const response = await api.get(`/products/manufacturer/${manufacturerId}`, { params: queryParams });
    return response.data;
  },

  /**
   * Get featured products
   * @param {Object} params - Query parameters
   * @returns {Promise} Featured products
   */
  getFeaturedProducts: async (params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 12,
    };
    const response = await api.get('/products/featured', { params: queryParams });
    return response.data;
  },

  /**
   * Get new arrival products
   * @param {Object} params - Query parameters
   * @returns {Promise} New arrival products
   */
  getNewArrivals: async (params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 12,
    };
    const response = await api.get('/products/new-arrivals', { params: queryParams });
    return response.data;
  },

  /**
   * Get products by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {Object} params - Query parameters
   * @returns {Promise} Products within price range
   */
  getProductsByPriceRange: async (minPrice, maxPrice, params = {}) => {
    const queryParams = {
      minPrice,
      maxPrice,
      page: params.page || 0,
      size: params.size || 20,
    };
    const response = await api.get('/products/price-range', { params: queryParams });
    return response.data;
  },

  /**
   * Get products suitable for specific age
   * @param {number} age - Child's age
   * @param {Object} params - Query parameters
   * @returns {Promise} Age-appropriate products
   */
  getProductsByAge: async (age, params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20,
    };
    const response = await api.get(`/products/age/${age}`, { params: queryParams });
    return response.data;
  },

  /**
   * Get product reviews
   * @param {number} productId - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Product reviews with pagination
   */
  getProductReviews: async (productId, params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
    };
    const response = await api.get(`/products/${productId}/reviews`, { params: queryParams });
    return response.data;
  },

  /**
   * Add product review (authenticated)
   * @param {number} productId - Product ID
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.comment - Review comment
   * @returns {Promise} Created review
   */
  addProductReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },
};

export default productService;
