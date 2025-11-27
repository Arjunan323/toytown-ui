# Redux Slices

State management slices for Aadhav's ToyTown frontend application using Redux Toolkit.

## Slices Overview

### authSlice.js
User authentication and profile state management.

**State:**
- `user` - Current user object
- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token
- `isAuthenticated` - Authentication status
- `loading` - Loading state
- `error` - Error message

**Async Thunks:**
- `login(credentials)` - Login with email/password
- `register(userData)` - Register new account
- `oauthLoginSuccess(oauthData)` - Handle OAuth callback
- `logout()` - Logout user

**Actions:**
- `clearError()` - Clear error state
- `updateUser(userData)` - Update user profile in state

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';

const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);
const dispatch = useDispatch();

dispatch(login({ email: 'user@example.com', password: 'password' }));
```

---

### productSlice.js
Product catalog and search state management.

**State:**
- `products` - Current product list
- `currentProduct` - Selected product details
- `featuredProducts` - Featured products
- `newArrivals` - New arrival products
- `searchResults` - Search results
- `filters` - Active filters (category, price, age, etc.)
- `pagination` - Pagination info (page, size, totalPages, totalElements)
- `loading` - Loading state
- `error` - Error message

**Async Thunks:**
- `fetchProducts(params)` - Get all products with pagination
- `searchProducts({ query, params })` - Search products
- `fetchProductById(productId)` - Get product details
- `fetchProductsByCategory({ categoryId, params })` - Filter by category
- `fetchProductsByManufacturer({ manufacturerId, params })` - Filter by manufacturer
- `fetchFeaturedProducts(params)` - Get featured products
- `fetchNewArrivals(params)` - Get new arrivals
- `fetchProductsByPriceRange({ minPrice, maxPrice, params })` - Filter by price
- `fetchProductsByAge({ age, params })` - Get age-appropriate products

**Actions:**
- `clearError()` - Clear error state
- `clearCurrentProduct()` - Clear selected product
- `setFilters(filters)` - Update active filters
- `clearFilters()` - Reset all filters
- `setPagination(pagination)` - Update pagination
- `clearSearchResults()` - Clear search results

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, searchProducts } from '../store/slices/productSlice';

const { products, loading, pagination } = useSelector((state) => state.product);
const dispatch = useDispatch();

// Fetch products
dispatch(fetchProducts({ page: 0, size: 20 }));

// Search products
dispatch(searchProducts({ query: 'lego', params: { page: 0, size: 20 } }));
```

---

### cartSlice.js
Shopping cart state management.

**State:**
- `cart` - Full cart object
- `items` - Cart items array
- `totalItems` - Total item count
- `subtotal` - Cart subtotal
- `loading` - Loading state
- `error` - Error message
- `itemLoading` - Per-item loading states (object with itemId keys)

**Async Thunks:**
- `fetchCart()` - Get current user's cart
- `addToCart({ productId, quantity })` - Add item to cart
- `updateCartItem({ itemId, quantity })` - Update item quantity
- `removeFromCart(itemId)` - Remove item from cart
- `clearCart()` - Clear all cart items

**Actions:**
- `clearError()` - Clear error state
- `resetCart()` - Reset cart (for logout)
- `setItemLoading({ itemId, loading })` - Set item loading state

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, addToCart } from '../store/slices/cartSlice';

const { items, totalItems, subtotal, loading } = useSelector((state) => state.cart);
const dispatch = useDispatch();

// Add to cart
dispatch(addToCart({ productId: 1, quantity: 2 }));

// Get cart
dispatch(fetchCart());
```

---

### orderSlice.js
Order and shipping address state management.

**State:**
- `orders` - Orders array
- `currentOrder` - Selected order details
- `orderHistory` - Order history array
- `shippingAddresses` - User's shipping addresses
- `pagination` - Pagination info
- `loading` - Loading state
- `error` - Error message
- `paymentLoading` - Payment processing state
- `paymentError` - Payment error message

**Async Thunks:**
- `createOrder(orderData)` - Create order (initiate checkout)
- `confirmPayment({ orderId, paymentData })` - Confirm Razorpay payment
- `fetchOrderById(orderId)` - Get order details
- `fetchOrderByNumber(orderNumber)` - Get order by number
- `fetchOrderHistory(params)` - Get order history
- `cancelOrder(orderId)` - Cancel order
- `fetchShippingAddresses()` - Get shipping addresses
- `addShippingAddress(addressData)` - Add new address
- `updateShippingAddress({ addressId, addressData })` - Update address
- `deleteShippingAddress(addressId)` - Delete address
- `setDefaultAddress(addressId)` - Set default address

**Actions:**
- `clearError()` - Clear error states
- `clearCurrentOrder()` - Clear selected order
- `resetOrders()` - Reset orders (for logout)

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, fetchOrderHistory } from '../store/slices/orderSlice';

const { currentOrder, orderHistory, loading } = useSelector((state) => state.order);
const dispatch = useDispatch();

// Create order
dispatch(createOrder({ shippingAddressId: 1 }));

// Get order history
dispatch(fetchOrderHistory({ page: 0, size: 10 }));
```

---

## Store Configuration

The Redux store is configured in `store.js`:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
```

## Common Patterns

### Loading States
```javascript
const { loading, error } = useSelector((state) => state.product);

if (loading) return <Spinner />;
if (error) return <Alert severity="error">{error}</Alert>;
```

### Dispatching Actions
```javascript
const dispatch = useDispatch();

// Simple action
dispatch(clearError());

// Async thunk
const result = await dispatch(fetchProducts({ page: 0 }));
if (result.type.endsWith('/fulfilled')) {
  // Success
}
```

### Handling Errors
```javascript
try {
  await dispatch(addToCart({ productId: 1, quantity: 2 })).unwrap();
  // Success
} catch (error) {
  // Error handling
  console.error('Failed to add to cart:', error);
}
```

### Pagination
```javascript
const { pagination } = useSelector((state) => state.product);
const handlePageChange = (page) => {
  dispatch(fetchProducts({ page, size: pagination.size }));
};
```

### Filters
```javascript
const { filters } = useSelector((state) => state.product);

// Update filter
dispatch(setFilters({ categoryId: 1 }));

// Clear filters
dispatch(clearFilters());
```

## State Persistence

Auth state is persisted to localStorage:
- `accessToken` - Stored on login, cleared on logout
- `refreshToken` - Stored on login, cleared on logout
- `user` - Stored on login, cleared on logout

Cart, product, and order states are session-based and not persisted.

## Error Handling

All slices handle errors consistently:
1. Set `error` state on thunk rejection
2. Provide error messages from API or fallback messages
3. Clear error on next action or manual clear

## Best Practices

1. **Use `unwrap()` for Promise handling:**
   ```javascript
   const order = await dispatch(createOrder(data)).unwrap();
   ```

2. **Clear errors before new actions:**
   ```javascript
   dispatch(clearError());
   dispatch(fetchProducts());
   ```

3. **Check loading states:**
   ```javascript
   if (loading) return <Spinner />;
   ```

4. **Reset state on logout:**
   ```javascript
   dispatch(logout());
   dispatch(resetCart());
   dispatch(resetOrders());
   ```

5. **Use selectors for computed values:**
   ```javascript
   const cartTotal = useSelector((state) => state.cart.subtotal);
   ```

## Integration with Services

All slices use the service layer (`services/`) for API calls:
- Slices handle state management
- Services handle HTTP requests
- Clean separation of concerns

## Testing

Slices can be tested with Redux Toolkit's testing utilities:
```javascript
import { configureStore } from '@reduxjs/toolkit';
import productReducer, { fetchProducts } from './productSlice';

const store = configureStore({ reducer: { product: productReducer } });
await store.dispatch(fetchProducts());
expect(store.getState().product.loading).toBe(false);
```

## Redux DevTools

Redux DevTools is enabled in development mode:
- Time-travel debugging
- Action history
- State inspection
- Action replay

Access at: http://localhost:5173 (with Redux DevTools extension)
