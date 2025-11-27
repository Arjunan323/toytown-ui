import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, addressService } from '../../services';

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchAddresses = createAsyncThunk(
  'profile/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getAddresses();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk(
  'profile/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await addressService.addAddress(addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'profile/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await addressService.updateAddress(addressId, addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'profile/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(addressId);
      return addressId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'profile/setDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await addressService.setDefaultAddress(addressId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default address');
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    addresses: [],
    loading: false,
    error: null,
    addressesLoading: false,
    addressesError: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.addresses = [];
      state.error = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.addressesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.addresses = action.payload.addresses || [];
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      // Add address
      .addCase(addAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.addresses.push(action.payload);
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        const index = state.addresses.findIndex((addr) => addr.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.addresses = state.addresses.filter((addr) => addr.id !== action.payload);
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        // Clear all defaults and set the new one
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === action.payload.id,
        }));
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      });
  },
});

export const { clearProfile, setProfile, setAddresses, clearError } = profileSlice.actions;

// Selectors
export const selectProfile = (state) => state.profile.profile;
export const selectAddresses = (state) => state.profile.addresses;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;
export const selectAddressesLoading = (state) => state.profile.addressesLoading;
export const selectAddressesError = (state) => state.profile.addressesError;

export default profileSlice.reducer;
