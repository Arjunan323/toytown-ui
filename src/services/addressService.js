import api from './api';

/**
 * Address Service
 * Handles customer shipping address management
 */
const addressService = {
  /**
   * Get all shipping addresses for current customer
   * @returns {Promise} List of shipping addresses
   */
  getAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },

  /**
   * Add a new shipping address
   * @param {Object} addressData - Address data
   * @param {string} addressData.addressLine1 - Address line 1
   * @param {string} addressData.addressLine2 - Address line 2 (optional)
   * @param {string} addressData.city - City
   * @param {string} addressData.state - State
   * @param {string} addressData.postalCode - Postal code
   * @param {string} addressData.country - Country
   * @param {boolean} addressData.isDefault - Set as default address
   * @returns {Promise} Created address
   */
  addAddress: async (addressData) => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },

  /**
   * Update an existing shipping address
   * @param {number} addressId - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise} Updated address
   */
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  /**
   * Delete a shipping address
   * @param {number} addressId - Address ID
   * @returns {Promise} Deletion confirmation
   */
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Set an address as the default shipping address
   * @param {number} addressId - Address ID
   * @returns {Promise} Updated address
   */
  setDefaultAddress: async (addressId) => {
    const response = await api.put(`/addresses/${addressId}/default`);
    return response.data;
  },
};

export default addressService;
