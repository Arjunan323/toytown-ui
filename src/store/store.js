import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import searchReducer from './slices/searchSlice';
import profileReducer from './slices/profileSlice';
import reviewReducer from './slices/reviewSlice';
import homepageReducer from './slices/homepageSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import adminProductReducer from './slices/adminProductSlice';
import adminBannerReducer from './slices/adminBannerSlice';
import adminCategoryReducer from './adminCategorySlice';
import adminManufacturerReducer from './adminManufacturerSlice';
import adminOrderReducer from './slices/adminOrderSlice';

// Configure Redux store with slices
export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    search: searchReducer,
    profile: profileReducer,
    reviews: reviewReducer,
    homepage: homepageReducer,
    adminAuth: adminAuthReducer,
    adminProduct: adminProductReducer,
    adminBanner: adminBannerReducer,
    adminCategory: adminCategoryReducer,
    adminManufacturer: adminManufacturerReducer,
    adminOrder: adminOrderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'auth/oauthLoginSuccess/fulfilled',
        ],
      },
    }),
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

export default store;
