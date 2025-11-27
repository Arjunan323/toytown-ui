import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminBannerService from '../../services/adminBannerService';

/**
 * Async thunk to fetch all banners (admin view).
 */
export const fetchAllBanners = createAsyncThunk(
  'adminBanner/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminBannerService.getAllBanners();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load banners'
      );
    }
  }
);

/**
 * Async thunk to fetch banner by ID.
 */
export const fetchBannerById = createAsyncThunk(
  'adminBanner/fetchById',
  async (bannerId, { rejectWithValue }) => {
    try {
      const data = await adminBannerService.getBannerById(bannerId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load banner'
      );
    }
  }
);

/**
 * Async thunk to create new banner.
 */
export const createBanner = createAsyncThunk(
  'adminBanner/create',
  async (bannerData, { rejectWithValue }) => {
    try {
      const data = await adminBannerService.createBanner(bannerData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create banner'
      );
    }
  }
);

/**
 * Async thunk to update banner.
 */
export const updateBanner = createAsyncThunk(
  'adminBanner/update',
  async ({ bannerId, bannerData }, { rejectWithValue }) => {
    try {
      const data = await adminBannerService.updateBanner(bannerId, bannerData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update banner'
      );
    }
  }
);

/**
 * Async thunk to delete banner.
 */
export const deleteBanner = createAsyncThunk(
  'adminBanner/delete',
  async (bannerId, { rejectWithValue }) => {
    try {
      await adminBannerService.deleteBanner(bannerId);
      return bannerId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete banner'
      );
    }
  }
);

/**
 * Async thunk to toggle banner active status.
 */
export const toggleBannerStatus = createAsyncThunk(
  'adminBanner/toggleStatus',
  async (bannerId, { rejectWithValue }) => {
    try {
      const data = await adminBannerService.toggleBannerStatus(bannerId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle banner status'
      );
    }
  }
);

/**
 * Async thunk to upload banner image.
 */
export const uploadBannerImage = createAsyncThunk(
  'adminBanner/uploadImage',
  async ({ bannerId, file }, { rejectWithValue }) => {
    try {
      const data = await adminBannerService.uploadBannerImage(bannerId, file);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload banner image'
      );
    }
  }
);

/**
 * Async thunk to toggle product featured status.
 */
export const toggleProductFeatured = createAsyncThunk(
  'adminBanner/toggleProductFeatured',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await adminBannerService.toggleProductFeatured(productId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle product featured status'
      );
    }
  }
);

const initialState = {
  banners: [],
  currentBanner: null,
  loading: false,
  uploading: false,
  error: null,
  success: null,
};

const adminBannerSlice = createSlice({
  name: 'adminBanner',
  initialState,
  reducers: {
    clearAdminBannerError: (state) => {
      state.error = null;
    },
    clearAdminBannerSuccess: (state) => {
      state.success = null;
    },
    clearCurrentBanner: (state) => {
      state.currentBanner = null;
    },
    resetAdminBanner: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch all banners
    builder
      .addCase(fetchAllBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchAllBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch banner by ID
    builder
      .addCase(fetchBannerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBanner = action.payload;
      })
      .addCase(fetchBannerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create banner
    builder
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.push(action.payload);
        state.success = 'Banner created successfully';
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update banner
    builder
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        state.currentBanner = action.payload;
        state.success = 'Banner updated successfully';
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete banner
    builder
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter(b => b.id !== action.payload);
        state.success = 'Banner deleted successfully';
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Toggle banner status
    builder
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        if (state.currentBanner?.id === action.payload.id) {
          state.currentBanner = action.payload;
        }
        state.success = 'Banner status toggled successfully';
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Upload banner image
    builder
      .addCase(uploadBannerImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadBannerImage.fulfilled, (state, action) => {
        state.uploading = false;
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        if (state.currentBanner?.id === action.payload.id) {
          state.currentBanner = action.payload;
        }
        state.success = 'Banner image uploaded successfully';
      })
      .addCase(uploadBannerImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });

    // Toggle product featured status
    builder
      .addCase(toggleProductFeatured.fulfilled, (state) => {
        state.success = 'Product featured status toggled successfully';
      })
      .addCase(toggleProductFeatured.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearAdminBannerError,
  clearAdminBannerSuccess,
  clearCurrentBanner,
  resetAdminBanner,
} = adminBannerSlice.actions;

export default adminBannerSlice.reducer;
