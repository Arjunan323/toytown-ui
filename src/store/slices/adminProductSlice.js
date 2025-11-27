import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminProductService } from '../../services';

// Initial state
const initialState = {
  products: [],
  currentProduct: null,
  lowStockProducts: [],
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    discontinued: null,
    sortBy: 'createdDate',
    sortDir: 'desc',
  },
  loading: false,
  error: null,
  imageUploadProgress: 0,
};

// Async thunks for admin product operations

/**
 * Get all products with pagination and filters.
 */
export const fetchAdminProducts = createAsyncThunk(
  'adminProduct/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminProductService.getAllProducts(params);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch products';
      return rejectWithValue(message);
    }
  }
);

/**
 * Get product by ID.
 */
export const fetchAdminProductById = createAsyncThunk(
  'adminProduct/fetchById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await adminProductService.getProductById(productId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch product';
      return rejectWithValue(message);
    }
  }
);

/**
 * Create a new product.
 */
export const createAdminProduct = createAsyncThunk(
  'adminProduct/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await adminProductService.createProduct(productData);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create product';
      return rejectWithValue(message);
    }
  }
);

/**
 * Update an existing product.
 */
export const updateAdminProduct = createAsyncThunk(
  'adminProduct/update',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await adminProductService.updateProduct(productId, productData);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update product';
      return rejectWithValue(message);
    }
  }
);

/**
 * Update product stock quantity.
 */
export const updateProductStock = createAsyncThunk(
  'adminProduct/updateStock',
  async ({ productId, stockQuantity }, { rejectWithValue }) => {
    try {
      const response = await adminProductService.updateStock(productId, stockQuantity);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update stock';
      return rejectWithValue(message);
    }
  }
);

/**
 * Discontinue a product (soft delete).
 */
export const discontinueProduct = createAsyncThunk(
  'adminProduct/discontinue',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await adminProductService.discontinueProduct(productId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to discontinue product';
      return rejectWithValue(message);
    }
  }
);

/**
 * Reactivate a discontinued product.
 */
export const reactivateProduct = createAsyncThunk(
  'adminProduct/reactivate',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await adminProductService.reactivateProduct(productId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reactivate product';
      return rejectWithValue(message);
    }
  }
);

/**
 * Get products with low stock.
 */
export const fetchLowStockProducts = createAsyncThunk(
  'adminProduct/fetchLowStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminProductService.getLowStockProducts();
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch low stock products';
      return rejectWithValue(message);
    }
  }
);

/**
 * Toggle product featured status.
 */
export const toggleFeaturedStatus = createAsyncThunk(
  'adminProduct/toggleFeatured',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await adminProductService.toggleFeaturedStatus(productId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle featured status';
      return rejectWithValue(message);
    }
  }
);

/**
 * Upload product images.
 */
export const uploadProductImages = createAsyncThunk(
  'adminProduct/uploadImages',
  async ({ productId, files, altTexts, isPrimary }, { rejectWithValue }) => {
    try {
      const response = await adminProductService.uploadImages(productId, files, altTexts, isPrimary);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload images';
      return rejectWithValue(message);
    }
  }
);

/**
 * Delete a product image.
 */
export const deleteProductImage = createAsyncThunk(
  'adminProduct/deleteImage',
  async ({ productId, imageId }, { rejectWithValue }) => {
    try {
      await adminProductService.deleteImage(productId, imageId);
      return { productId, imageId };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete image';
      return rejectWithValue(message);
    }
  }
);

/**
 * Set image as primary.
 */
export const setPrimaryProductImage = createAsyncThunk(
  'adminProduct/setPrimaryImage',
  async ({ productId, imageId }, { rejectWithValue }) => {
    try {
      await adminProductService.setPrimaryImage(productId, imageId);
      return { productId, imageId };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to set primary image';
      return rejectWithValue(message);
    }
  }
);

// Admin product slice
const adminProductSlice = createSlice({
  name: 'adminProduct',
  initialState,
  reducers: {
    // Clear error
    clearProductError: (state) => {
      state.error = null;
    },
    // Set filters
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Reset current product
    resetCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    // Set image upload progress
    setImageUploadProgress: (state, action) => {
      state.imageUploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.content;
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch product by ID
      .addCase(fetchAdminProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchAdminProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create product
      .addCase(createAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.currentProduct = action.payload;
      })
      .addCase(createAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product
      .addCase(updateAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.currentProduct = action.payload;
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update stock
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      
      // Discontinue product
      .addCase(discontinueProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      
      // Reactivate product
      .addCase(reactivateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      
      // Fetch low stock products
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.lowStockProducts = action.payload;
      })
      
      // Toggle featured status
      .addCase(toggleFeaturedStatus.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      
      // Upload images
      .addCase(uploadProductImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProductImages.fulfilled, (state, action) => {
        state.loading = false;
        state.imageUploadProgress = 0;
      })
      .addCase(uploadProductImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.imageUploadProgress = 0;
      });
  },
});

export const {
  clearProductError,
  setProductFilters,
  resetCurrentProduct,
  setImageUploadProgress,
} = adminProductSlice.actions;

export default adminProductSlice.reducer;
