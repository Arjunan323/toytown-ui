import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminManufacturerService from '../services/adminManufacturerService';

/**
 * Fetch all manufacturers with pagination
 */
export const fetchAdminManufacturers = createAsyncThunk(
  'adminManufacturer/fetchAll',
  async ({ page = 0, size = 20, sort = 'name,asc' }, { rejectWithValue }) => {
    try {
      const response = await adminManufacturerService.getAllManufacturers(page, size, sort);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch manufacturers');
    }
  }
);

/**
 * Fetch active manufacturers
 */
export const fetchActiveManufacturers = createAsyncThunk(
  'adminManufacturer/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminManufacturerService.getActiveManufacturers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active manufacturers');
    }
  }
);

/**
 * Fetch manufacturer by ID
 */
export const fetchAdminManufacturerById = createAsyncThunk(
  'adminManufacturer/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminManufacturerService.getManufacturerById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch manufacturer');
    }
  }
);

/**
 * Create a new manufacturer
 */
export const createAdminManufacturer = createAsyncThunk(
  'adminManufacturer/create',
  async (manufacturerData, { rejectWithValue }) => {
    try {
      const response = await adminManufacturerService.createManufacturer(manufacturerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create manufacturer');
    }
  }
);

/**
 * Update an existing manufacturer
 */
export const updateAdminManufacturer = createAsyncThunk(
  'adminManufacturer/update',
  async ({ id, manufacturerData }, { rejectWithValue }) => {
    try {
      const response = await adminManufacturerService.updateManufacturer(id, manufacturerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update manufacturer');
    }
  }
);

/**
 * Upload logo for manufacturer
 */
export const uploadManufacturerLogo = createAsyncThunk(
  'adminManufacturer/uploadLogo',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const response = await adminManufacturerService.uploadLogo(id, file);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload logo');
    }
  }
);

/**
 * Delete a manufacturer (soft delete)
 */
export const deleteAdminManufacturer = createAsyncThunk(
  'adminManufacturer/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminManufacturerService.deleteManufacturer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete manufacturer');
    }
  }
);

/**
 * Toggle manufacturer active status
 */
export const toggleManufacturerStatus = createAsyncThunk(
  'adminManufacturer/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminManufacturerService.toggleActiveStatus(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle manufacturer status');
    }
  }
);

const initialState = {
  manufacturers: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 20
  },
  activeManufacturers: [],
  selectedManufacturer: null,
  loading: false,
  uploadingLogo: false,
  error: null,
  success: null
};

const adminManufacturerSlice = createSlice({
  name: 'adminManufacturer',
  initialState,
  reducers: {
    clearAdminManufacturerError: (state) => {
      state.error = null;
    },
    clearAdminManufacturerSuccess: (state) => {
      state.success = null;
    },
    clearSelectedManufacturer: (state) => {
      state.selectedManufacturer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all manufacturers
      .addCase(fetchAdminManufacturers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminManufacturers.fulfilled, (state, action) => {
        state.loading = false;
        state.manufacturers = action.payload;
      })
      .addCase(fetchAdminManufacturers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch active manufacturers
      .addCase(fetchActiveManufacturers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveManufacturers.fulfilled, (state, action) => {
        state.loading = false;
        state.activeManufacturers = action.payload;
      })
      .addCase(fetchActiveManufacturers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch manufacturer by ID
      .addCase(fetchAdminManufacturerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminManufacturerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedManufacturer = action.payload;
      })
      .addCase(fetchAdminManufacturerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create manufacturer
      .addCase(createAdminManufacturer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createAdminManufacturer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Manufacturer created successfully';
        state.manufacturers.content.push(action.payload);
      })
      .addCase(createAdminManufacturer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update manufacturer
      .addCase(updateAdminManufacturer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateAdminManufacturer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Manufacturer updated successfully';
        const index = state.manufacturers.content.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.manufacturers.content[index] = action.payload;
        }
        if (state.selectedManufacturer?.id === action.payload.id) {
          state.selectedManufacturer = action.payload;
        }
      })
      .addCase(updateAdminManufacturer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload logo
      .addCase(uploadManufacturerLogo.pending, (state) => {
        state.uploadingLogo = true;
        state.error = null;
      })
      .addCase(uploadManufacturerLogo.fulfilled, (state, action) => {
        state.uploadingLogo = false;
        state.success = 'Logo uploaded successfully';
        const index = state.manufacturers.content.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.manufacturers.content[index] = action.payload;
        }
        if (state.selectedManufacturer?.id === action.payload.id) {
          state.selectedManufacturer = action.payload;
        }
      })
      .addCase(uploadManufacturerLogo.rejected, (state, action) => {
        state.uploadingLogo = false;
        state.error = action.payload;
      })
      // Delete manufacturer
      .addCase(deleteAdminManufacturer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteAdminManufacturer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Manufacturer deleted successfully';
        state.manufacturers.content = state.manufacturers.content.filter(m => m.id !== action.payload);
      })
      .addCase(deleteAdminManufacturer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle manufacturer status
      .addCase(toggleManufacturerStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleManufacturerStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Manufacturer status updated successfully';
        const index = state.manufacturers.content.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.manufacturers.content[index] = action.payload;
        }
      })
      .addCase(toggleManufacturerStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAdminManufacturerError, clearAdminManufacturerSuccess, clearSelectedManufacturer } = adminManufacturerSlice.actions;

export default adminManufacturerSlice.reducer;
