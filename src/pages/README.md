# Customer Pages Documentation

This document provides an overview of all customer-facing pages in the ToyTown application.

## Page Overview

All pages are located in `frontend/src/pages/customer/` and follow consistent patterns for Redux integration, navigation, and Material-UI styling.

---

## 1. HomePage (`HomePage.jsx`)

**Purpose**: Landing page showcasing categories, featured products, and new arrivals

**Key Features**:
- Hero section with gradient background and CTA
- Category grid with 6 categories (Action Figures, Building Blocks, Dolls, Educational, Board Games, Outdoor)
- Featured Products section using ProductGrid component
- New Arrivals section using ProductGrid component
- "Why Choose Us" section highlighting free shipping, secure payments, and authentic products

**Redux Integration**:
- Dispatches: `fetchFeaturedProducts()`, `fetchNewArrivals()`
- Selectors: `featuredProducts`, `newArrivals`, `loading`, `error`

**Navigation**:
- Category click → `/category/{id}`
- Product click → Handled by ProductCard component
- "View All Featured" → `/products?featured=true`
- "View All New" → `/products?new=true`

**Components Used**: ProductGrid, Spinner

---

## 2. CategoryPage (`CategoryPage.jsx`)

**Purpose**: Browse products by category with filtering, sorting, and pagination

**Key Features**:
- Breadcrumbs navigation (Home → Categories → Category Name)
- Filter panel (desktop sidebar, mobile drawer):
  - Price range slider (₹0-₹10,000)
  - Age range slider (0-18 years)
  - Active filters chips with delete
  - Clear all filters button
- Sort dropdown (Name A-Z/Z-A, Price Low-High/High-Low, Newest, Highest Rated)
- Product grid with pagination (12 items per page)
- Responsive layout (filters in drawer on mobile)

**Redux Integration**:
- Dispatches: `fetchProductsByCategory()`, `setFilters()`, `clearFilters()`, `setPagination()`
- Selectors: `products`, `loading`, `error`, `totalPages`, `filters`

**URL Parameters**:
- Route param: `categoryId`
- Query params: `page`, `sort`

**Components Used**: ProductGrid, Spinner

**Helper Functions**:
- `getCategoryName(categoryId)` - Maps category IDs to display names

---

## 3. ProductDetailPage (`ProductDetailPage.jsx`)

**Purpose**: Display full product details with images, reviews, and purchase options

**Key Features**:
- Breadcrumbs navigation (Home → Products → Category → Product Name)
- ProductDetail component integration
- Loading skeleton during data fetch
- Error handling with navigation back to products
- Placeholder for related products section

**Redux Integration**:
- Dispatches: `fetchProductById()`, `clearCurrentProduct()`, `clearError()`
- Selectors: `currentProduct`, `loading`, `error`

**URL Parameters**:
- Route param: `productId`

**Components Used**: ProductDetail, Spinner

**Event Handlers**:
- `handleAddReview(reviewData)` - Placeholder for future review submission

---

## 4. LoginPage (`LoginPage.jsx`)

**Purpose**: User authentication with email/password and OAuth options

**Key Features**:
- Email and password form fields with validation
- Password visibility toggle
- OAuth buttons (Google, Facebook) - placeholders
- "Forgot password?" link
- "Sign Up" link to registration
- Redirect preservation for protected routes
- Form validation with error messages

**Redux Integration**:
- Dispatches: `login(formData)`
- Selectors: `loading`, `error`

**Form Validation**:
- Email: Valid format (regex: `/\S+@\S+\.\S+/`)
- Password: Minimum 6 characters

**Navigation**:
- Success → Redirect to `location.state?.from?.pathname` or `/`
- "Forgot Password" → `/forgot-password`
- "Sign Up" → `/register`

**OAuth Integration**: Placeholder (console.log) - TODO: Implement actual OAuth

---

## 5. RegisterPage (`RegisterPage.jsx`)

**Purpose**: New user account creation with comprehensive validation

**Key Features**:
- 6-field form: firstName, lastName, email, phoneNumber, password, confirmPassword
- Grid layout (firstName/lastName in 2 columns on desktop)
- Comprehensive validation rules
- Password visibility toggles (separate for password and confirmPassword)
- OAuth signup buttons (Google, Facebook) - placeholders
- Terms of Service and Privacy Policy links
- "Sign In" link to login page

**Redux Integration**:
- Dispatches: `register(registerData)` (removes confirmPassword before API call)
- Selectors: `loading`, `error`

**Form Validation**:
- Names: Required, max 100 characters
- Email: Required, valid format
- Phone: Optional, exactly 10 digits (regex: `/^\d{10}$/`)
- Password: Min 8 characters, must contain letters AND numbers (regex: `/(?=.*[a-zA-Z])(?=.*\d)/`)
- Confirm Password: Must match password

**Navigation**:
- Success → Redirect to `/login` or `location.state?.from`
- "Sign In" → `/login`

---

## 6. CartPage (`CartPage.jsx`)

**Purpose**: Shopping cart display with item management and checkout

**Key Features**:
- Empty cart state with large icon and "Continue Shopping" CTA
- Page header with item count
- Grid layout: Cart items (8 cols) + CartSummary sidebar (4 cols)
- CartItem list with update/remove handlers
- Mobile checkout button (duplicate of sidebar button)
- Security badges footer (Secure Checkout, Authentic, Free Shipping)
- Authentication check before checkout

**Redux Integration**:
- Dispatches: `fetchCart()`, `clearError()`
- Selectors: `items`, `totalItems`, `subtotal`, `loading`, `error`, `isAuthenticated`

**Event Handlers**:
- `handleUpdateItem(itemId, quantity)` - Update cart item quantity
- `handleRemoveItem(itemId)` - Remove item from cart
- `handleCheckout()` - Navigate to checkout (checks authentication)

**Components Used**: CartItem, CartSummary, Spinner

**Navigation**:
- "Continue Shopping" → `/products`
- "Checkout" → `/checkout` (or `/login` if not authenticated)

---

## 7. CheckoutPage (`CheckoutPage.jsx`)

**Purpose**: Multi-step checkout with shipping address, order review, and payment

**Key Features**:
- 3-step stepper (Shipping Address, Review Order, Payment)
- Shipping address selection from saved addresses
- "Add New Address" form with validation
- Order review with items and totals
- Razorpay payment integration
- Back/Continue navigation between steps

**Redux Integration**:
- Dispatches: `fetchCart()`, `fetchShippingAddresses()`, `addShippingAddress()`, `createOrder()`, `confirmPayment()`, `clearCartError()`, `clearOrderError()`
- Selectors: Cart - `items`, `subtotal`, `loading`, `error`; Order - `shippingAddresses`, `loading`, `error`, `paymentLoading`; Auth - `user`

**Address Form Fields**:
- recipientName, addressLine1, addressLine2, city, state, postalCode, phoneNumber

**Payment Flow**:
1. Create order via Redux
2. Load Razorpay script
3. Process payment with Razorpay modal
4. Confirm payment on success
5. Navigate to confirmation page

**Calculations**:
- Subtotal from cart
- Shipping: Free if subtotal >= ₹500, else ₹50
- Tax: 18% GST on subtotal
- Total: Subtotal + Shipping + Tax

**Components Used**: Spinner

**Navigation**:
- Success → `/orders/confirmation/{orderNumber}`
- "Back" → Navigate to cart if empty

---

## 8. OrderConfirmationPage (`OrderConfirmationPage.jsx`)

**Purpose**: Display order confirmation after successful payment

**Key Features**:
- Large success icon (CheckCircleIcon)
- "Order Placed Successfully" message
- Order number display in highlighted box
- Order details section (date, payment status, order status, shipping address)
- OrderSummary component integration
- "What's Next?" section with delivery information
- Action buttons (View All Orders, Continue Shopping)
- Help contact information

**Redux Integration**:
- Dispatches: `fetchOrderById()`, `clearError()`
- Selectors: `currentOrder`, `loading`, `error`

**URL Parameters**:
- Route param: `orderNumber`

**Components Used**: OrderSummary, Spinner

**Navigation**:
- "View All Orders" → `/order-history`
- "Continue Shopping" → `/products`

**Error Handling**:
- Displays error alert if order not found
- "Back to Shopping" button on error

---

## 9. OrderHistoryPage (`OrderHistoryPage.jsx`)

**Purpose**: Paginated list of customer's past orders with filtering

**Key Features**:
- Page header with "Continue Shopping" button
- Status filter dropdown (All, Pending, Processing, Shipped, Delivered, Cancelled)
- Empty state with "No Orders Yet" message and CTA
- Order cards grid with:
  - Order number and date
  - Status chip with color-coding and icon
  - Items preview (first 3 thumbnails + count)
  - Total amount
  - "View Details" button
  - Delivery/shipping alerts
- Pagination controls
- Help contact information

**Redux Integration**:
- Dispatches: `fetchOrderHistory({ page, size, status })`, `clearError()`
- Selectors: `orders`, `totalPages`, `loading`, `error`

**Pagination**:
- 10 orders per page
- MUI Pagination component

**Status Color-Coding**:
- PENDING: Warning (orange)
- PROCESSING: Info (blue)
- SHIPPED: Primary
- DELIVERED: Success (green)
- CANCELLED: Error (red)

**Components Used**: Spinner

**Navigation**:
- "View Details" → `/orders/{orderNumber}`
- "Continue Shopping" → `/products`
- "Start Shopping" (empty state) → `/products`

---

## Common Patterns

### Redux Integration
All pages follow this pattern:
```javascript
const dispatch = useDispatch();
const { data, loading, error } = useSelector((state) => state.sliceName);

useEffect(() => {
  dispatch(fetchAction());
  return () => {
    dispatch(clearError());
  };
}, [dispatch]);
```

### Loading States
- Full-page spinner: `<Spinner fullPage />` when no data
- Inline loading: Skeleton components or loading text
- Button loading: `disabled={loading}` with loading text

### Error Handling
- MUI Alert component for errors
- Conditional rendering based on error state
- Clear error on component unmount

### Navigation
- React Router hooks: `useNavigate()`, `useParams()`, `useLocation()`, `useSearchParams()`
- Link components for static navigation
- Programmatic navigation with `navigate()`

### Form Validation
- Client-side validation with regex
- Field-level error state
- Error clearing on field change
- Submit button disabled during loading

### Responsive Design
- MUI Grid breakpoints (xs, sm, md, lg)
- Mobile drawer, desktop sidebar pattern
- Conditional rendering based on screen size
- Flexible typography and spacing

### Currency Formatting
```javascript
Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
// Or simple: ₹{amount.toFixed(2)}
```

### Date Formatting
```javascript
new Date(dateString).toLocaleDateString('en-IN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
```

---

## Protected Routes

The following routes require authentication (implemented in `App.jsx`):
- `/checkout` → CheckoutPage
- `/orders/confirmation/:orderNumber` → OrderConfirmationPage
- `/order-history` → OrderHistoryPage
- `/orders/:orderNumber` → OrderConfirmationPage (reused for order details)

**Implementation**:
```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = window.location;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  }
  
  return children;
};
```

---

## Route Configuration (App.jsx)

```javascript
// Public Routes
<Route path="/" element={<HomePage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/products" element={<CategoryPage />} />
<Route path="/category/:categoryId" element={<CategoryPage />} />
<Route path="/products/:productId" element={<ProductDetailPage />} />
<Route path="/cart" element={<CartPage />} />

// Protected Routes
<Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
<Route path="/orders/confirmation/:orderNumber" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
<Route path="/order-history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
<Route path="/orders/:orderNumber" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

// Redirects
<Route path="/orders" element={<Navigate to="/order-history" replace />} />
<Route path="*" element={<Navigate to="/" replace />} />
```

---

## Dependencies

All pages depend on the following:

**Components** (T059-T065):
- ProductCard
- ProductGrid
- ProductDetail
- CartItem
- CartSummary
- OrderSummary
- OrderTracking
- Spinner (common)

**Redux Slices** (T056-T058, T023):
- authSlice
- productSlice
- cartSlice
- orderSlice

**Services** (T052-T055):
- authService
- productService
- cartService
- orderService

**Material-UI Components**:
- Container, Box, Paper, Grid, Card, Typography
- Button, TextField, Select, Slider
- Alert, Chip, Divider, Breadcrumbs
- Stepper, Pagination, Drawer
- Icons (from @mui/icons-material)

**React Router**:
- useNavigate, useParams, useLocation, useSearchParams
- Link, Navigate

---

## Future Enhancements

### T066 - HomePage
- [ ] Dynamic category fetching from API (currently hardcoded)
- [ ] Carousel for featured products
- [ ] Testimonials section
- [ ] Newsletter signup

### T067 - CategoryPage
- [ ] Additional filters (brand, rating, availability)
- [ ] Product comparison feature
- [ ] Save filter preferences
- [ ] Grid/List view toggle

### T068 - ProductDetailPage
- [ ] Related products section (currently commented out)
- [ ] Review submission implementation
- [ ] Image zoom/gallery modal
- [ ] Share product functionality
- [ ] Wishlist integration

### T069 - LoginPage
- [ ] Actual OAuth integration (Google, Facebook)
- [ ] Social login with backend
- [ ] Remember me functionality
- [ ] Two-factor authentication

### T070 - RegisterPage
- [ ] Actual OAuth signup integration
- [ ] Email verification
- [ ] Password strength meter
- [ ] Terms acceptance checkbox

### T071 - CartPage
- [ ] Save for later functionality
- [ ] Apply coupon codes
- [ ] Estimated delivery date
- [ ] Recommended products

### T072 - CheckoutPage
- [ ] Multiple payment methods (COD, UPI, cards)
- [ ] Gift wrapping option
- [ ] Delivery time slot selection
- [ ] Order notes/instructions
- [ ] Guest checkout

### T073 - OrderConfirmationPage
- [ ] Download invoice/receipt
- [ ] Share order details
- [ ] Rate delivery experience
- [ ] Similar product recommendations

### T074 - OrderHistoryPage
- [ ] Date range filter
- [ ] Search by order number
- [ ] Bulk actions (cancel, return)
- [ ] Export order history
- [ ] Reorder functionality

---

## Testing Checklist

### T066 - HomePage
- [ ] Hero section displays correctly
- [ ] Categories navigate to correct pages
- [ ] Featured products load and display
- [ ] New arrivals load and display
- [ ] "View All" buttons work
- [ ] Responsive on mobile/tablet
- [ ] Loading states show correctly
- [ ] Error states handle gracefully

### T067 - CategoryPage
- [ ] Breadcrumbs navigate correctly
- [ ] Filters apply to product list
- [ ] Sort options work correctly
- [ ] Pagination works
- [ ] Mobile drawer opens/closes
- [ ] Clear filters resets all
- [ ] URL syncs with filters/page
- [ ] Category name displays correctly

### T068 - ProductDetailPage
- [ ] Product details load correctly
- [ ] Breadcrumbs show category chain
- [ ] Add to cart works
- [ ] Loading skeleton displays
- [ ] Error handling works
- [ ] Image gallery functional
- [ ] Reviews display correctly

### T069 - LoginPage
- [ ] Form validation works
- [ ] Login successful with valid credentials
- [ ] Error message shows on failure
- [ ] Password visibility toggle works
- [ ] Forgot password link navigates
- [ ] Sign up link navigates
- [ ] Redirect after login works
- [ ] OAuth buttons display (placeholders)

### T070 - RegisterPage
- [ ] All form validations work
- [ ] Password strength validation
- [ ] Confirm password matching
- [ ] Phone number format validation
- [ ] Registration successful
- [ ] Error messages display correctly
- [ ] Password visibility toggles work
- [ ] Navigate to login after success

### T071 - CartPage
- [ ] Empty cart state displays
- [ ] Cart items load correctly
- [ ] Update quantity works
- [ ] Remove item works
- [ ] Subtotal calculates correctly
- [ ] Checkout requires authentication
- [ ] Mobile checkout button shows
- [ ] Continue shopping navigates

### T072 - CheckoutPage
- [ ] Stepper navigation works
- [ ] Address selection works
- [ ] Add new address saves
- [ ] Order review displays correctly
- [ ] Totals calculate correctly
- [ ] Razorpay integration works
- [ ] Order creation successful
- [ ] Payment confirmation works
- [ ] Navigate to confirmation

### T073 - OrderConfirmationPage
- [ ] Order details display
- [ ] Order number shows correctly
- [ ] Shipping address displays
- [ ] Order summary shows items
- [ ] Navigation buttons work
- [ ] Error handling for missing order
- [ ] "What's Next" section displays

### T074 - OrderHistoryPage
- [ ] Orders list displays
- [ ] Status filter works
- [ ] Pagination works
- [ ] Empty state shows when no orders
- [ ] View details navigates correctly
- [ ] Status chips color-coded
- [ ] Item previews display
- [ ] Delivery alerts show correctly

---

## File Sizes

- HomePage.jsx: ~280 lines
- CategoryPage.jsx: ~320 lines
- ProductDetailPage.jsx: ~110 lines
- LoginPage.jsx: ~180 lines
- RegisterPage.jsx: ~260 lines
- CartPage.jsx: ~140 lines
- CheckoutPage.jsx: ~375 lines
- OrderConfirmationPage.jsx: ~175 lines
- OrderHistoryPage.jsx: ~265 lines

**Total**: ~2,105 lines of code across 9 pages
