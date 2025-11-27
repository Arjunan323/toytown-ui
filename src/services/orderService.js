import api from './api';

/**
 * Order Service
 * Handles order creation, checkout, payment confirmation, and order history
 */
const orderService = {
  /**
   * Create order from cart (initiate checkout)
   * @param {Object} orderData - Order data
   * @param {number} orderData.shippingAddressId - Shipping address ID
   * @returns {Promise} Created order with Razorpay details
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Confirm payment and complete order
   * @param {number} orderId - Order ID
   * @param {Object} paymentData - Razorpay payment data
   * @param {string} paymentData.razorpayPaymentId - Razorpay payment ID
   * @param {string} paymentData.razorpayOrderId - Razorpay order ID
   * @param {string} paymentData.razorpaySignature - Razorpay signature
   * @returns {Promise} Confirmed order
   */
  confirmPayment: async (orderId, paymentData) => {
    const response = await api.post(`/orders/${orderId}/confirm`, paymentData);
    return response.data;
  },

  /**
   * Get order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise} Order details
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get order by order number
   * @param {string} orderNumber - Order number (e.g., "ORD-123456")
   * @returns {Promise} Order details
   */
  getOrderByOrderNumber: async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  /**
   * Get order history for current user
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-indexed)
   * @param {number} params.size - Page size
   * @returns {Promise} Paginated order history
   */
  getOrderHistory: async (params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
    };
    const response = await api.get('/orders', { params: queryParams });
    return response.data;
  },

  /**
   * Cancel order
   * @param {number} orderId - Order ID
   * @returns {Promise} Cancelled order
   */
  cancelOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  },

  /**
   * Get shipping addresses for current user
   * @returns {Promise} List of shipping addresses
   */
  getShippingAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },

  /**
   * Add shipping address
   * @param {Object} addressData - Address data
   * @param {string} addressData.addressLine1 - Address line 1
   * @param {string} addressData.addressLine2 - Address line 2 (optional)
   * @param {string} addressData.city - City
   * @param {string} addressData.state - State
   * @param {string} addressData.postalCode - Postal code (6 digits)
   * @param {string} addressData.country - Country
   * @param {boolean} addressData.isDefault - Set as default address
   * @returns {Promise} Created address
   */
  addShippingAddress: async (addressData) => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },

  /**
   * Update shipping address
   * @param {number} addressId - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise} Updated address
   */
  updateShippingAddress: async (addressId, addressData) => {
    const response = await api.put(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  /**
   * Delete shipping address
   * @param {number} addressId - Address ID
   * @returns {Promise} Deletion confirmation
   */
  deleteShippingAddress: async (addressId) => {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Set default shipping address
   * @param {number} addressId - Address ID
   * @returns {Promise} Updated address
   */
  setDefaultAddress: async (addressId) => {
    const response = await api.put(`/addresses/${addressId}/default`);
    return response.data;
  },

  /**
   * Load Razorpay script
   * Helper function to dynamically load Razorpay checkout script
   * @returns {Promise} Resolves when script is loaded
   */
  loadRazorpayScript: () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  },

  /**
   * Process Razorpay payment
   * @param {Object} orderData - Order data from backend
   * @param {function} onSuccess - Success callback
   * @param {function} onFailure - Failure callback
   */
  processRazorpayPayment: async (orderData, onSuccess, onFailure) => {
    try {
      // Load Razorpay script
      await orderService.loadRazorpayScript();

      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: import.meta.env.VITE_APP_NAME || "Aadhav's ToyTown",
        description: `Order #${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          // Payment successful - confirm with backend
          try {
            const paymentData = {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };
            const confirmedOrder = await orderService.confirmPayment(orderData.id, paymentData);
            onSuccess(confirmedOrder);
          } catch (error) {
            onFailure(error);
          }
        },
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: orderData.customerPhone,
        },
        theme: {
          color: '#1976d2', // Primary color
        },
        modal: {
          ondismiss: () => {
            onFailure(new Error('Payment cancelled by user'));
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      onFailure(error);
    }
  },
};

// Named exports for convenience
export const {
  createOrder,
  confirmPayment,
  getOrderById,
  getOrderByOrderNumber,
  getOrderHistory,
  cancelOrder,
  getShippingAddresses,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultAddress,
  loadRazorpayScript,
  processRazorpayPayment,
} = orderService;

export default orderService;
