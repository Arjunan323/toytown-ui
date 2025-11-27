# Frontend Services

API service layer for Aadhav's ToyTown frontend application.

## Services Overview

### api.js
Core Axios instance with JWT token management and automatic token refresh.

**Features:**
- Base URL configuration from environment variables
- Request interceptor: Automatically adds JWT Bearer token to all requests
- Response interceptor: Handles 401 errors and token refresh
- Automatic redirect to login on authentication failure
- Error logging and handling

### authService.js
Authentication and user management operations.

**Methods:**
- `register(userData)` - Register new customer account
- `login(credentials)` - Login with email/password
- `oauthLoginSuccess(oauthData)` - Handle OAuth callback
- `logout()` - Logout and clear tokens
- `getProfile()` - Get current user profile
- `updateProfile(profileData)` - Update user profile
- `forgotPassword(email)` - Request password reset
- `refreshToken(refreshToken)` - Refresh access token
- `loginWithGoogle()` - Initiate Google OAuth
- `loginWithFacebook()` - Initiate Facebook OAuth

### productService.js
Product catalog browsing and searching.

**Methods:**
- `getAllProducts(params)` - Get all products with pagination
- `searchProducts(query, params)` - Search products by keyword
- `getProductById(productId)` - Get product details
- `getProductsByCategory(categoryId, params)` - Filter by category
- `getProductsByManufacturer(manufacturerId, params)` - Filter by manufacturer
- `getFeaturedProducts(params)` - Get featured products
- `getNewArrivals(params)` - Get new arrivals
- `getProductsByPriceRange(minPrice, maxPrice, params)` - Filter by price
- `getProductsByAge(age, params)` - Get age-appropriate products
- `getProductReviews(productId, params)` - Get product reviews
- `addProductReview(productId, reviewData)` - Add review (authenticated)

### cartService.js
Shopping cart operations.

**Methods:**
- `getCart()` - Get current user's cart
- `addItemToCart(itemData)` - Add product to cart
- `updateCartItemQuantity(itemId, quantity)` - Update item quantity
- `removeCartItem(itemId)` - Remove item from cart
- `clearCart()` - Clear all cart items
- `getCartItemCount()` - Get total items count
- `isProductInCart(productId)` - Check if product is in cart

### orderService.js
Order management and payment processing.

**Methods:**
- `createOrder(orderData)` - Create order from cart
- `confirmPayment(orderId, paymentData)` - Confirm Razorpay payment
- `getOrderById(orderId)` - Get order details
- `getOrderByOrderNumber(orderNumber)` - Get order by number
- `getOrderHistory(params)` - Get order history with pagination
- `cancelOrder(orderId)` - Cancel order
- `getShippingAddresses()` - Get user's shipping addresses
- `addShippingAddress(addressData)` - Add new address
- `updateShippingAddress(addressId, addressData)` - Update address
- `deleteShippingAddress(addressId)` - Delete address
- `setDefaultAddress(addressId)` - Set default address
- `loadRazorpayScript()` - Load Razorpay checkout script
- `processRazorpayPayment(orderData, onSuccess, onFailure)` - Process payment

### categoryService.js
Product category hierarchy management.

**Methods:**
- `getAllCategories()` - Get all categories
- `getCategoryById(categoryId)` - Get category details
- `getRootCategories()` - Get top-level categories
- `getSubcategories(parentCategoryId)` - Get subcategories
- `buildCategoryTree(categories)` - Build hierarchical tree structure

## Usage Examples

### Authentication
```javascript
import { authService } from '../services';

// Login
const { accessToken, refreshToken, user } = await authService.login({
  email: 'customer@example.com',
  password: 'password123'
});

// Register
const newUser = await authService.register({
  email: 'new@example.com',
  password: 'SecurePass123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+919876543210'
});
```

### Product Browsing
```javascript
import { productService } from '../services';

// Search products
const results = await productService.searchProducts('lego', {
  page: 0,
  size: 20
});

// Get featured products
const featured = await productService.getFeaturedProducts({ size: 12 });

// Get product details
const product = await productService.getProductById(1);
```

### Shopping Cart
```javascript
import { cartService } from '../services';

// Add to cart
const cart = await cartService.addItemToCart({
  productId: 1,
  quantity: 2
});

// Update quantity
await cartService.updateCartItemQuantity(itemId, 3);

// Get cart
const currentCart = await cartService.getCart();
```

### Order & Payment
```javascript
import { orderService } from '../services';

// Create order
const order = await orderService.createOrder({
  shippingAddressId: 1
});

// Process Razorpay payment
await orderService.processRazorpayPayment(
  order,
  (confirmedOrder) => {
    console.log('Payment successful:', confirmedOrder);
  },
  (error) => {
    console.error('Payment failed:', error);
  }
);

// Get order history
const orders = await orderService.getOrderHistory({ page: 0, size: 10 });
```

## Error Handling

All services use the centralized `api.js` instance which handles:
- 401 Unauthorized → Automatic token refresh or redirect to login
- Network errors → Console logging
- API errors → Response data with error messages

Services throw errors that should be caught in components or Redux thunks:

```javascript
try {
  const products = await productService.searchProducts('toys');
} catch (error) {
  console.error('Search failed:', error.response?.data?.message);
}
```

## Environment Variables

Required in `.env.development`:
- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8080/api/v1)
- `VITE_RAZORPAY_KEY_ID` - Razorpay key for payment processing
- `VITE_APP_NAME` - Application name for display

## Authentication Flow

1. User logs in → `authService.login()` → Receives JWT tokens
2. Tokens stored in `localStorage` by Redux slice
3. All subsequent API calls include `Authorization: Bearer <token>` header via `api.js` interceptor
4. On 401 error → `api.js` attempts token refresh
5. If refresh fails → Clear tokens and redirect to `/login`

## Notes

- All services return Promises (use async/await or .then/.catch)
- Pagination uses 0-indexed pages
- All authenticated endpoints require user to be logged in
- Cart and order operations require `CUSTOMER` role
- Services are stateless - state management handled by Redux slices
