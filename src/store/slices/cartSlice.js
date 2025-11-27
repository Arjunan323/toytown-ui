import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services';

// Initial state
const initialState = {
  cart: null,
  items: [],
  totalItems: 0,
  subtotal: 0,
  loading: false,
  error: null,
  itemLoading: {}, // Track loading state for individual items
};

// Async thunks

// Get cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.addItemToCart({ productId, quantity });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItemQuantity(itemId, quantity);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

// Remove cart item
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartService.removeCartItem(itemId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Reset cart (for logout)
    resetCart: (state) => {
      state.cart = null;
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.loading = false;
      state.error = null;
      state.itemLoading = {};
    },
    // Set item loading state
    setItemLoading: (state, action) => {
      const { itemId, loading } = action.payload;
      state.itemLoading[itemId] = loading;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.subtotal = action.payload.subtotal || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.subtotal = action.payload.subtotal || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update cart item
      .addCase(updateCartItem.pending, (state, action) => {
        const itemId = action.meta.arg.itemId;
        state.itemLoading[itemId] = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const itemId = action.meta.arg.itemId;
        state.itemLoading[itemId] = false;
        state.cart = action.payload;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.subtotal = action.payload.subtotal || 0;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        const itemId = action.meta.arg.itemId;
        state.itemLoading[itemId] = false;
        state.error = action.payload;
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state, action) => {
        const itemId = action.meta.arg;
        state.itemLoading[itemId] = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const itemId = action.meta.arg;
        delete state.itemLoading[itemId];
        state.cart = action.payload;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.subtotal = action.payload.subtotal || 0;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        const itemId = action.meta.arg;
        state.itemLoading[itemId] = false;
        state.error = action.payload;
      })
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
        state.itemLoading = {};
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetCart, setItemLoading } = cartSlice.actions;

export default cartSlice.reducer;
