import api from './api';

/**
 * Cart Service
 * Handles shopping cart operations (CRUD)
 */
const cartService = {
  /**
   * Get current user's cart
   * @returns {Promise} Cart with items and totals
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Add item to cart
   * @param {Object} itemData - Item to add
   * @param {number} itemData.productId - Product ID
   * @param {number} itemData.quantity - Quantity to add
   * @returns {Promise} Updated cart
   */
  addItemToCart: async (itemData) => {
    const response = await api.post('/cart/items', itemData);
    return response.data;
  },

  /**
   * Update cart item quantity
   * @param {number} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise} Updated cart
   */
  updateCartItemQuantity: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  /**
   * Remove item from cart
   * @param {number} itemId - Cart item ID
   * @returns {Promise} Updated cart
   */
  removeCartItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Clear all items from cart
   * @returns {Promise} Empty cart
   */
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  /**
   * Get cart item count
   * Convenience method to get total items in cart
   * @returns {Promise} Cart item count
   */
  getCartItemCount: async () => {
    try {
      const cart = await cartService.getCart();
      return cart.totalItems || 0;
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  },

  /**
   * Check if product is in cart
   * @param {number} productId - Product ID to check
   * @returns {Promise<boolean>} True if product is in cart
   */
  isProductInCart: async (productId) => {
    try {
      const cart = await cartService.getCart();
      return cart.items?.some(item => item.productId === productId) || false;
    } catch (error) {
      console.error('Error checking if product is in cart:', error);
      return false;
    }
  },
};

export default cartService;
