import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminCategoryService from '../services/adminCategoryService';

/**
 * Fetch all categories with pagination
 */
export const fetchAdminCategories = createAsyncThunk(
  'adminCategory/fetchAll',
  async ({ page = 0, size = 20, sort = 'displayOrder,asc' }, { rejectWithValue }) => {
    try {
      const response = await adminCategoryService.getAllCategories(page, size, sort);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

/**
 * Fetch category tree
 */
export const fetchCategoryTree = createAsyncThunk(
  'adminCategory/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminCategoryService.getCategoryTree();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category tree');
    }
  }
);

/**
 * Fetch category by ID
 */
export const fetchAdminCategoryById = createAsyncThunk(
  'adminCategory/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminCategoryService.getCategoryById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
    }
  }
);

/**
 * Create a new category
 */
export const createAdminCategory = createAsyncThunk(
  'adminCategory/create',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await adminCategoryService.createCategory(categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

/**
 * Update an existing category
 */
export const updateAdminCategory = createAsyncThunk(
  'adminCategory/update',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await adminCategoryService.updateCategory(id, categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

/**
 * Delete a category (soft delete)
 */
export const deleteAdminCategory = createAsyncThunk(
  'adminCategory/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminCategoryService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

/**
 * Toggle category active status
 */
export const toggleCategoryStatus = createAsyncThunk(
  'adminCategory/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminCategoryService.toggleActiveStatus(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle category status');
    }
  }
);

/**
 * Reorder categories
 */
export const reorderCategories = createAsyncThunk(
  'adminCategory/reorder',
  async (reorderList, { rejectWithValue }) => {
    try {
      await adminCategoryService.reorderCategories(reorderList);
      return reorderList;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder categories');
    }
  }
);

const initialState = {
  categories: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 20
  },
  categoryTree: [],
  selectedCategory: null,
  loading: false,
  error: null,
  success: null
};

const adminCategorySlice = createSlice({
  name: 'adminCategory',
  initialState,
  reducers: {
    clearAdminCategoryError: (state) => {
      state.error = null;
    },
    clearAdminCategorySuccess: (state) => {
      state.success = null;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchAdminCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch category tree
      .addCase(fetchCategoryTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryTree = action.payload;
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch category by ID
      .addCase(fetchAdminCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchAdminCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create category
      .addCase(createAdminCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createAdminCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Category created successfully';
        state.categories.content.push(action.payload);
      })
      .addCase(createAdminCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update category
      .addCase(updateAdminCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateAdminCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Category updated successfully';
        const index = state.categories.content.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories.content[index] = action.payload;
        }
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateAdminCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete category
      .addCase(deleteAdminCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteAdminCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Category deleted successfully';
        state.categories.content = state.categories.content.filter(c => c.id !== action.payload);
      })
      .addCase(deleteAdminCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle category status
      .addCase(toggleCategoryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Category status updated successfully';
        const index = state.categories.content.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories.content[index] = action.payload;
        }
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reorder categories
      .addCase(reorderCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Categories reordered successfully';
        // Update display orders in state
        action.payload.forEach(item => {
          const category = state.categories.content.find(c => c.id === item.categoryId);
          if (category) {
            category.displayOrder = item.displayOrder;
          }
        });
      })
      .addCase(reorderCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAdminCategoryError, clearAdminCategorySuccess, clearSelectedCategory } = adminCategorySlice.actions;

export default adminCategorySlice.reducer;
