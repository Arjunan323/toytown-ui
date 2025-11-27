import api from './api';

/**
 * Admin order management service for viewing and managing orders.
 * All endpoints require ADMIN role authentication.
 */
const adminOrderService = {
  /**
   * Get all orders with pagination and optional filters.
   * 
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-indexed)
   * @param {number} params.size - Page size
   * @param {string} params.status - Filter by order status
   * @param {string} params.paymentStatus - Filter by payment status
   * @param {string} params.startDate - Filter by start date (ISO format)
   * @param {string} params.endDate - Filter by end date (ISO format)
   * @param {string} params.sortBy - Field to sort by
   * @param {string} params.sortDir - Sort direction (asc/desc)
   * @returns {Promise<Object>} Paged response with orders
   */
  async getAllOrders(params = {}) {
    const {
      page = 0,
      size = 20,
      status = null,
      paymentStatus = null,
      startDate = null,
      endDate = null,
      sortBy = 'orderDate',
      sortDir = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sortBy},${sortDir}`
    });

    if (status) {
      queryParams.append('status', status);
    }
    if (paymentStatus) {
      queryParams.append('paymentStatus', paymentStatus);
    }
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    if (endDate) {
      queryParams.append('endDate', endDate);
    }

    const response = await api.get(`/admin/orders?${queryParams}`);
    return response.data;
  },

  /**
   * Get order by ID with full customer details.
   * 
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order status.
   * 
   * @param {number} orderId - Order ID
   * @param {Object} statusData - Status update data
   * @param {string} statusData.orderStatus - New order status
   * @param {string} statusData.trackingNumber - Optional tracking number (required for SHIPPED status)
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, statusData) {
    const response = await api.put(`/admin/orders/${orderId}/status`, statusData);
    return response.data;
  },

  /**
   * Update payment status.
   * 
   * @param {number} orderId - Order ID
   * @param {Object} paymentData - Payment status update data
   * @param {string} paymentData.paymentStatus - New payment status
   * @returns {Promise<Object>} Updated order
   */
  async updatePaymentStatus(orderId, paymentData) {
    const response = await api.put(`/admin/orders/${orderId}/payment-status`, paymentData);
    return response.data;
  },

  /**
   * Get order statistics for admin dashboard.
   * 
   * @returns {Promise<Object>} Order statistics (counts by status, total revenue, etc.)
   */
  async getOrderStats() {
    const response = await api.get('/admin/orders/stats');
    return response.data;
  },

  /**
   * Filter orders with advanced criteria.
   * 
   * @param {Object} filterRequest - Filter criteria
   * @param {string} filterRequest.status - Order status
   * @param {string} filterRequest.paymentStatus - Payment status
   * @param {string} filterRequest.fromDate - Start date (ISO format)
   * @param {string} filterRequest.toDate - End date (ISO format)
   * @param {string} filterRequest.customerEmail - Customer email (partial match)
   * @param {number} filterRequest.minAmount - Minimum order amount
   * @param {number} filterRequest.maxAmount - Maximum order amount
   * @param {number} filterRequest.page - Page number (0-indexed)
   * @param {number} filterRequest.size - Page size
   * @returns {Promise<Object>} Paged response with filtered orders
   */
  async filterOrders(filterRequest) {
    const {
      status,
      paymentStatus,
      fromDate,
      toDate,
      customerEmail,
      minAmount,
      maxAmount,
      page = 0,
      size = 20
    } = filterRequest;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    if (status) queryParams.append('status', status);
    if (paymentStatus) queryParams.append('paymentStatus', paymentStatus);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    if (customerEmail) queryParams.append('customerEmail', customerEmail);
    if (minAmount !== undefined) queryParams.append('minAmount', minAmount.toString());
    if (maxAmount !== undefined) queryParams.append('maxAmount', maxAmount.toString());

    const response = await api.get(`/admin/orders?${queryParams}`);
    return response.data;
  }
};

export default adminOrderService;
