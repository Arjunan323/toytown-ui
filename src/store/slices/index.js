/**
 * Redux Slices Export
 * Centralized export for all Redux slices and their actions
 */

// Auth slice
export { default as authReducer } from './authSlice';
export {
  login,
  register,
  oauthLoginSuccess,
  logout,
  clearError as clearAuthError,
  updateUser,
} from './authSlice';

// Product slice
export { default as productReducer } from './productSlice';
export {
  fetchProducts,
  searchProducts,
  fetchProductById,
  fetchProductsByCategory,
  fetchProductsByManufacturer,
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchProductsByPriceRange,
  fetchProductsByAge,
  clearError as clearProductError,
  clearCurrentProduct,
  setFilters,
  clearFilters,
  setPagination,
} from './productSlice';

// Cart slice
export { default as cartReducer } from './cartSlice';
export {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  clearError as clearCartError,
  resetCart,
  setItemLoading,
} from './cartSlice';

// Order slice
export { default as orderReducer } from './orderSlice';
export {
  createOrder,
  confirmPayment,
  fetchOrderById,
  fetchOrderByNumber,
  fetchOrderHistory,
  cancelOrder,
  fetchShippingAddresses,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultAddress,
  clearError as clearOrderError,
  clearCurrentOrder,
  resetOrders,
} from './orderSlice';

// Search slice
export { default as searchReducer } from './searchSlice';
export {
  searchProductsAsync,
  setSearchQuery,
  setFilters as setSearchFilters,
  setPagination as setSearchPagination,
  clearSearch,
  clearResults as clearSearchResults,
  clearError as clearSearchError,
  clearRecentSearches,
  removeRecentSearch,
  selectSearchQuery,
  selectSearchFilters,
  selectSearchResults,
  selectSearchPagination,
  selectSearchLoading,
  selectSearchError,
  selectRecentSearches,
  selectHasActiveFilters,
  selectSearchState,
} from './searchSlice';

// Profile slice
export { default as profileReducer } from './profileSlice';
export {
  fetchProfile,
  updateProfile,
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress as setDefaultProfileAddress,
  clearProfile,
  setProfile,
  setAddresses,
  clearError as clearProfileError,
  selectProfile,
  selectAddresses,
  selectProfileLoading,
  selectProfileError,
  selectAddressesLoading,
  selectAddressesError,
} from './profileSlice';

// Review slice
export { default as reviewReducer } from './reviewSlice';
export {
  fetchProductReviews,
  submitReview,
  fetchMyReviews,
  clearReviews,
  clearSubmitError,
  addReviewToProduct,
  selectProductReviews,
  selectMyReviews,
  selectReviewsLoading,
  selectReviewsError,
  selectReviewSubmitting,
  selectSubmitError,
} from './reviewSlice';

// Admin Auth slice
export { default as adminAuthReducer } from './adminAuthSlice';
export {
  adminLogin,
  adminLogout,
  validateAdminToken,
  clearAdminError,
  setAdminFromStorage,
} from './adminAuthSlice';

// Admin Product slice
export { default as adminProductReducer } from './adminProductSlice';
export {
  fetchAdminProducts,
  fetchAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  updateProductStock,
  discontinueProduct,
  reactivateProduct,
  fetchLowStockProducts,
  uploadProductImages,
  deleteProductImage,
  setPrimaryProductImage,
  toggleFeaturedStatus,
  clearProductError as clearAdminProductError,
  setProductFilters,
  resetCurrentProduct,
  setImageUploadProgress,
} from './adminProductSlice';

// Admin Order slice
export { default as adminOrderReducer } from './adminOrderSlice';
export {
  fetchAdminOrders,
  fetchOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
  fetchOrderStats,
  filterAdminOrders,
  setOrderFilters,
  clearOrderFilters,
  clearCurrentOrder as clearAdminCurrentOrder,
  clearAdminOrderError,
  setOrderPagination,
} from './adminOrderSlice';
