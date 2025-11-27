import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import homepageService from '../../services/homepageService';

/**
 * Async thunk to fetch complete homepage content.
 */
export const fetchHomepageContent = createAsyncThunk(
  'homepage/fetchContent',
  async (_, { rejectWithValue }) => {
    try {
      const data = await homepageService.getHomepageContent();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load homepage content'
      );
    }
  }
);

/**
 * Async thunk to fetch banners only.
 */
export const fetchBanners = createAsyncThunk(
  'homepage/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const data = await homepageService.getBanners();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load banners'
      );
    }
  }
);

/**
 * Async thunk to fetch featured products only.
 */
export const fetchFeaturedProducts = createAsyncThunk(
  'homepage/fetchFeaturedProducts',
  async (limit = 12, { rejectWithValue }) => {
    try {
      const data = await homepageService.getFeaturedProducts(limit);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load featured products'
      );
    }
  }
);

/**
 * Async thunk to fetch new arrivals only.
 */
export const fetchNewArrivals = createAsyncThunk(
  'homepage/fetchNewArrivals',
  async (limit = 12, { rejectWithValue }) => {
    try {
      const data = await homepageService.getNewArrivals(limit);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load new arrivals'
      );
    }
  }
);

const initialState = {
  banners: [],
  featuredProducts: [],
  newArrivals: [],
  loading: false,
  error: null,
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    clearHomepageError: (state) => {
      state.error = null;
    },
    resetHomepage: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch complete homepage content
    builder
      .addCase(fetchHomepageContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomepageContent.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.banners || [];
        state.featuredProducts = action.payload.featuredProducts || [];
        state.newArrivals = action.payload.newArrivals || [];
      })
      .addCase(fetchHomepageContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch banners only
    builder
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.banners = action.payload;
      });

    // Fetch featured products only
    builder
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      });

    // Fetch new arrivals only
    builder
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload;
      });
  },
});

export const { clearHomepageError, resetHomepage } = homepageSlice.actions;

export default homepageSlice.reducer;
