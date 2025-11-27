import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services';

// Initial state
const initialState = {
  products: [],
  currentProduct: null,
  featuredProducts: [],
  newArrivals: [],
  searchResults: [],
  categories: [],
  manufacturers: [],
  filters: {
    categoryId: null,
    manufacturerId: null,
    minPrice: null,
    maxPrice: null,
    age: null,
    searchQuery: '',
  },
  pagination: {
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  },
  loading: false,
  error: null,
};

// Async thunks

// Get all products with pagination
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getAllProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'product/searchProducts',
  async ({ query, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(query, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

// Get product by ID
export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(productId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
    }
  }
);

// Get products by category
export const fetchProductsByCategory = createAsyncThunk(
  'product/fetchProductsByCategory',
  async ({ categoryId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.getProductsByCategory(categoryId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category products');
    }
  }
);

// Get products by manufacturer
export const fetchProductsByManufacturer = createAsyncThunk(
  'product/fetchProductsByManufacturer',
  async ({ manufacturerId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.getProductsByManufacturer(manufacturerId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch manufacturer products');
    }
  }
);

// Get featured products
export const fetchFeaturedProducts = createAsyncThunk(
  'product/fetchFeaturedProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

// Get new arrivals
export const fetchNewArrivals = createAsyncThunk(
  'product/fetchNewArrivals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getNewArrivals(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch new arrivals');
    }
  }
);

// Get products by price range
export const fetchProductsByPriceRange = createAsyncThunk(
  'product/fetchProductsByPriceRange',
  async ({ minPrice, maxPrice, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.getProductsByPriceRange(minPrice, maxPrice, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products by price range');
    }
  }
);

// Get products by age
export const fetchProductsByAge = createAsyncThunk(
  'product/fetchProductsByAge',
  async ({ age, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.getProductsByAge(age, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch age-appropriate products');
    }
  }
);

// Product slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    // Update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        categoryId: null,
        manufacturerId: null,
        minPrice: null,
        maxPrice: null,
        age: null,
        searchQuery: '',
      };
    },
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.content || action.payload;
        state.pagination = {
          page: action.payload.page || 0,
          size: action.payload.size || 20,
          totalPages: action.payload.totalPages || 1,
          totalElements: action.payload.totalElements || state.products.length,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.content || action.payload;
        state.pagination = {
          page: action.payload.page || 0,
          size: action.payload.size || 20,
          totalPages: action.payload.totalPages || 1,
          totalElements: action.payload.totalElements || state.searchResults.length,
        };
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch products by category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.content || action.payload;
        state.pagination = {
          page: action.payload.page || 0,
          size: action.payload.size || 20,
          totalPages: action.payload.totalPages || 1,
          totalElements: action.payload.totalElements || state.products.length,
        };
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch products by manufacturer
      .addCase(fetchProductsByManufacturer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByManufacturer.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.content || action.payload;
        state.pagination = {
          page: action.payload.page || 0,
          size: action.payload.size || 20,
          totalPages: action.payload.totalPages || 1,
          totalElements: action.payload.totalElements || state.products.length,
        };
      })
      .addCase(fetchProductsByManufacturer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload.content || action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch new arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.loading = false;
        state.newArrivals = action.payload.content || action.payload;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch products by price range
      .addCase(fetchProductsByPriceRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByPriceRange.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.content || action.payload;
        state.pagination = {
          page: action.payload.page || 0,
          size: action.payload.size || 20,
          totalPages: action.payload.totalPages || 1,
          totalElements: action.payload.totalElements || state.products.length,
        };
      })
      .addCase(fetchProductsByPriceRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch products by age
      .addCase(fetchProductsByAge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByAge.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.content || action.payload;
        state.pagination = {
          page: action.payload.page || 0,
          size: action.payload.size || 20,
          totalPages: action.payload.totalPages || 1,
          totalElements: action.payload.totalElements || state.products.length,
        };
      })
      .addCase(fetchProductsByAge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentProduct,
  setFilters,
  clearFilters,
  setPagination,
  clearSearchResults,
} = productSlice.actions;

export default productSlice.reducer;
