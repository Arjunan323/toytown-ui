import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminOrderService } from '../../services';

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
  stats: {
    totalOrders: 0,
    pendingCount: 0,
    processingCount: 0,
    shippedCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
    totalRevenue: 0,
    confirmedPaymentCount: 0,
    pendingPaymentCount: 0,
    failedPaymentCount: 0,
  },
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    status: null,
    paymentStatus: null,
    startDate: null,
    endDate: null,
    customerEmail: null,
    minAmount: null,
    maxAmount: null,
    sortBy: 'orderDate',
    sortDir: 'desc',
  },
  loading: false,
  error: null,
};

// Async thunks for admin order operations

/**
 * Fetch all orders with pagination and filters.
 */
export const fetchAdminOrders = createAsyncThunk(
  'adminOrder/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminOrderService.getAllOrders(params);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch order details by ID.
 */
export const fetchOrderDetails = createAsyncThunk(
  'adminOrder/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await adminOrderService.getOrderById(orderId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch order details';
      return rejectWithValue(message);
    }
  }
);

/**
 * Update order status.
 */
export const updateOrderStatus = createAsyncThunk(
  'adminOrder/updateStatus',
  async ({ orderId, statusData }, { rejectWithValue }) => {
    try {
      const response = await adminOrderService.updateOrderStatus(orderId, statusData);
      return response.order; // API returns { message, order }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update order status';
      return rejectWithValue(message);
    }
  }
);

/**
 * Update payment status.
 */
export const updatePaymentStatus = createAsyncThunk(
  'adminOrder/updatePaymentStatus',
  async ({ orderId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await adminOrderService.updatePaymentStatus(orderId, paymentData);
      return response.order; // API returns { message, order }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update payment status';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch order statistics.
 */
export const fetchOrderStats = createAsyncThunk(
  'adminOrder/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminOrderService.getOrderStats();
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch order statistics';
      return rejectWithValue(message);
    }
  }
);

/**
 * Filter orders with advanced criteria.
 */
export const filterAdminOrders = createAsyncThunk(
  'adminOrder/filter',
  async (filterRequest, { rejectWithValue }) => {
    try {
      const response = await adminOrderService.filterOrders(filterRequest);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to filter orders';
      return rejectWithValue(message);
    }
  }
);

// Slice
const adminOrderSlice = createSlice({
  name: 'adminOrder',
  initialState,
  reducers: {
    /**
     * Set order filters.
     */
    setOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    /**
     * Clear order filters.
     */
    clearOrderFilters: (state) => {
      state.filters = initialState.filters;
    },
    /**
     * Clear current order.
     */
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    /**
     * Clear admin order error.
     */
    clearAdminOrderError: (state) => {
      state.error = null;
    },
    /**
     * Set pagination.
     */
    setOrderPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.content || [];
        state.pagination = {
          page: action.payload.number || 0,
          size: action.payload.size || 20,
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update current order if it matches
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        // Update in orders list
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update current order if it matches
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        // Update in orders list
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch order stats
      .addCase(fetchOrderStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Filter orders
      .addCase(filterAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.content || [];
        state.pagination = {
          page: action.payload.number || 0,
          size: action.payload.size || 20,
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(filterAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setOrderFilters,
  clearOrderFilters,
  clearCurrentOrder,
  clearAdminOrderError,
  setOrderPagination,
} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
