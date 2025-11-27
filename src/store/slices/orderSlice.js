import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services';

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
  orderHistory: [],
  shippingAddresses: [],
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  },
  loading: false,
  error: null,
  paymentLoading: false,
  paymentError: null,
};

// Async thunks

// Create order (initiate checkout)
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

// Confirm payment
export const confirmPayment = createAsyncThunk(
  'order/confirmPayment',
  async ({ orderId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await orderService.confirmPayment(orderId, paymentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm payment');
    }
  }
);

// Get order by ID
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

// Get order by order number
export const fetchOrderByNumber = createAsyncThunk(
  'order/fetchOrderByNumber',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderByOrderNumber(orderNumber);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

// Get order history
export const fetchOrderHistory = createAsyncThunk(
  'order/fetchOrderHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order history');
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

// Get shipping addresses
export const fetchShippingAddresses = createAsyncThunk(
  'order/fetchShippingAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getShippingAddresses();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shipping addresses');
    }
  }
);

// Add shipping address
export const addShippingAddress = createAsyncThunk(
  'order/addShippingAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await orderService.addShippingAddress(addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add shipping address');
    }
  }
);

// Update shipping address
export const updateShippingAddress = createAsyncThunk(
  'order/updateShippingAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateShippingAddress(addressId, addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update shipping address');
    }
  }
);

// Delete shipping address
export const deleteShippingAddress = createAsyncThunk(
  'order/deleteShippingAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await orderService.deleteShippingAddress(addressId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete shipping address');
    }
  }
);

// Set default shipping address
export const setDefaultAddress = createAsyncThunk(
  'order/setDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await orderService.setDefaultAddress(addressId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default address');
    }
  }
);

// Order slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.paymentError = null;
    },
    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    // Reset order state (for logout)
    resetOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.orderHistory = [];
      state.shippingAddresses = [];
      state.loading = false;
      state.error = null;
      state.paymentLoading = false;
      state.paymentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.currentOrder = action.payload;
        // Add to order history
        state.orderHistory.unshift(action.payload);
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch order by number
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch order history
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.orderHistory = action.payload.content || action.payload;
        state.pagination = {
          page: action.payload.page || 0,
          size: action.payload.size || 10,
          totalPages: action.payload.totalPages || 1,
          totalElements: action.payload.totalElements || state.orderHistory.length,
        };
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Update current order if it's the one being cancelled
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        // Update in order history
        const index = state.orderHistory.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orderHistory[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch shipping addresses
      .addCase(fetchShippingAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddresses = action.payload;
      })
      .addCase(fetchShippingAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add shipping address
      .addCase(addShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddresses.push(action.payload);
      })
      .addCase(addShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update shipping address
      .addCase(updateShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shippingAddresses.findIndex(addr => addr.id === action.payload.id);
        if (index !== -1) {
          state.shippingAddresses[index] = action.payload;
        }
      })
      .addCase(updateShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete shipping address
      .addCase(deleteShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        const addressId = action.meta.arg;
        state.shippingAddresses = state.shippingAddresses.filter(addr => addr.id !== addressId);
      })
      .addCase(deleteShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        // Update all addresses - set isDefault false except for the one being set
        state.shippingAddresses = state.shippingAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === action.payload.id,
        }));
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentOrder, resetOrders } = orderSlice.actions;

export default orderSlice.reducer;
