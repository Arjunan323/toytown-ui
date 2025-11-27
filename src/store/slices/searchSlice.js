import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

/**
 * Search Slice
 * 
 * Manages search state including:
 * - Search query and filters
 * - Search results with pagination
 * - Loading and error states
 * - Recent searches persistence (localStorage)
 */

// Async thunk to perform search with filters
export const searchProductsAsync = createAsyncThunk(
  'search/searchProducts',
  async ({ query, filters, pagination }, { rejectWithValue }) => {
    try {
      const data = await productService.searchProductsWithFilters(
        query,
        filters,
        pagination
      );
      return {
        results: data.content || [],
        pagination: {
          page: pagination.page,
          size: pagination.size,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
        },
        query,
        filters,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search products');
    }
  }
);

// Load recent searches from localStorage
const loadRecentSearches = () => {
  try {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load recent searches:', error);
    return [];
  }
};

// Save recent searches to localStorage
const saveRecentSearches = (searches) => {
  try {
    localStorage.setItem('recentSearches', JSON.stringify(searches));
  } catch (error) {
    console.error('Failed to save recent searches:', error);
  }
};

// Add search query to recent searches (max 5)
const addToRecentSearches = (query, currentSearches) => {
  if (!query || !query.trim()) return currentSearches;

  const trimmedQuery = query.trim();
  const filtered = currentSearches.filter(q => q !== trimmedQuery);
  const updated = [trimmedQuery, ...filtered].slice(0, 5);
  saveRecentSearches(updated);
  return updated;
};

const initialState = {
  query: '',
  filters: {
    minPrice: '',
    maxPrice: '',
    minAge: '',
    maxAge: '',
    manufacturerId: '',
    sortBy: 'createdDate',
    sortDirection: 'desc',
  },
  results: [],
  pagination: {
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  },
  loading: false,
  error: null,
  recentSearches: loadRecentSearches(),
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Set search query
    setSearchQuery: (state, action) => {
      state.query = action.payload;
      if (action.payload && action.payload.trim()) {
        state.recentSearches = addToRecentSearches(action.payload, state.recentSearches);
      }
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 0; // Reset to first page on filter change
    },

    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Clear all search state
    clearSearch: (state) => {
      state.query = '';
      state.filters = initialState.filters;
      state.results = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },

    // Clear only results
    clearResults: (state) => {
      state.results = [];
      state.pagination = initialState.pagination;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear recent searches
    clearRecentSearches: (state) => {
      state.recentSearches = [];
      localStorage.removeItem('recentSearches');
    },

    // Remove a specific recent search
    removeRecentSearch: (state, action) => {
      state.recentSearches = state.recentSearches.filter(q => q !== action.payload);
      saveRecentSearches(state.recentSearches);
    },
  },
  extraReducers: (builder) => {
    builder
      // Search products pending
      .addCase(searchProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Search products fulfilled
      .addCase(searchProductsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.pagination = action.payload.pagination;
        state.query = action.payload.query;
        state.filters = action.payload.filters;
        state.error = null;
      })
      // Search products rejected
      .addCase(searchProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search products';
        state.results = [];
      });
  },
});

// Export actions
export const {
  setSearchQuery,
  setFilters,
  setPagination,
  clearSearch,
  clearResults,
  clearError,
  clearRecentSearches,
  removeRecentSearch,
} = searchSlice.actions;

// Selectors
export const selectSearchQuery = (state) => state.search.query;
export const selectSearchFilters = (state) => state.search.filters;
export const selectSearchResults = (state) => state.search.results;
export const selectSearchPagination = (state) => state.search.pagination;
export const selectSearchLoading = (state) => state.search.loading;
export const selectSearchError = (state) => state.search.error;
export const selectRecentSearches = (state) => state.search.recentSearches;

// Computed selectors
export const selectHasActiveFilters = (state) => {
  const { filters } = state.search;
  return !!(
    filters.minPrice ||
    filters.maxPrice ||
    filters.minAge ||
    filters.maxAge ||
    filters.manufacturerId
  );
};

export const selectSearchState = (state) => ({
  query: state.search.query,
  filters: state.search.filters,
  results: state.search.results,
  pagination: state.search.pagination,
  loading: state.search.loading,
  error: state.search.error,
  recentSearches: state.search.recentSearches,
  hasActiveFilters: selectHasActiveFilters(state),
});

// Export reducer
export default searchSlice.reducer;
