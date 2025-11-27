import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../../services';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getProductReviews(productId, page, size);
      return { productId, reviews: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewService.submitReview(productId, reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const fetchMyReviews = createAsyncThunk(
  'reviews/fetchMyReviews',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await reviewService.getMyReviews(page, size);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my reviews');
    }
  }
);

// Slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviewsByProduct: {}, // { [productId]: { content: [], page, totalElements, ... } }
    myReviews: null,
    loading: false,
    error: null,
    submitting: false,
    submitError: null,
  },
  reducers: {
    clearReviews: (state) => {
      state.reviewsByProduct = {};
      state.myReviews = null;
      state.error = null;
    },
    clearSubmitError: (state) => {
      state.submitError = null;
    },
    addReviewToProduct: (state, action) => {
      const { productId, review } = action.payload;
      if (state.reviewsByProduct[productId]) {
        state.reviewsByProduct[productId].content.unshift(review);
        state.reviewsByProduct[productId].totalElements += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, reviews } = action.payload;
        state.reviewsByProduct[productId] = reviews;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        // Review will be added to the list after moderator approval
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })
      // Fetch my reviews
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.myReviews = action.payload;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviews, clearSubmitError, addReviewToProduct } = reviewSlice.actions;

// Selectors
export const selectProductReviews = (productId) => (state) =>
  state.reviews.reviewsByProduct[productId];
export const selectMyReviews = (state) => state.reviews.myReviews;
export const selectReviewsLoading = (state) => state.reviews.loading;
export const selectReviewsError = (state) => state.reviews.error;
export const selectReviewSubmitting = (state) => state.reviews.submitting;
export const selectSubmitError = (state) => state.reviews.submitError;

export default reviewSlice.reducer;
