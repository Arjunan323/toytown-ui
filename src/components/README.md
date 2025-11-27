# Frontend Components

Reusable React components for Aadhav's ToyTown e-commerce platform.

## Component Categories

### Product Components (`components/product/`)
Components for displaying and interacting with toy products.

### Cart Components (`components/cart/`)
Components for managing shopping cart functionality.

### Order Components (`components/order/`)
Components for displaying order information and tracking.

### Common Components (`components/common/`)
Shared UI components used throughout the application.

---

## Product Components

### ProductCard.jsx
Display product in a card format with quick add-to-cart functionality.

**Props:**
- `id` (number, required) - Product ID
- `name` (string, required) - Product name
- `price` (number, required) - Product price
- `imageUrl` (string) - Product image URL
- `rating` (number) - Average rating (0-5)
- `reviewCount` (number) - Number of reviews
- `inStock` (boolean) - Stock availability
- `isFeatured` (boolean) - Featured product flag
- `isNew` (boolean) - New arrival flag
- `onClick` (function) - Custom click handler

**Features:**
- Hover animation (lift effect)
- Add to cart button with loading state
- Favorite/wishlist toggle
- Stock status badges (Featured, New, Out of Stock)
- Star rating display
- Responsive image loading (lazy)
- INR currency formatting

**Usage:**
```jsx
import ProductCard from '../components/product/ProductCard';

<ProductCard
  id={1}
  name="LEGO Star Wars Millennium Falcon"
  price={7999.99}
  imageUrl="/images/lego-falcon.jpg"
  rating={4.5}
  reviewCount={128}
  inStock={true}
  isFeatured={true}
/>
```

---

### ProductGrid.jsx
Grid layout for displaying multiple products with pagination.

**Props:**
- `products` (array) - Array of product objects
- `loading` (boolean) - Loading state
- `error` (string) - Error message
- `page` (number) - Current page number (1-based)
- `totalPages` (number) - Total number of pages
- `onPageChange` (function) - Page change handler
- `onProductClick` (function) - Product click handler
- `emptyMessage` (string) - Message when no products
- `columns` (object) - Grid breakpoints `{ xs, sm, md, lg }`

**Features:**
- Responsive grid layout (1-4 columns)
- Loading spinner
- Error display
- Empty state message
- Pagination controls
- Auto-scroll to top on page change
- Result count summary

**Usage:**
```jsx
import ProductGrid from '../components/product/ProductGrid';

<ProductGrid
  products={products}
  loading={loading}
  error={error}
  page={currentPage}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
  columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
/>
```

---

### ProductDetail.jsx
Full product details view with image gallery and purchase options.

**Props:**
- `product` (object, required) - Product details object
- `onAddReview` (function) - Add review handler

**Product Object:**
```javascript
{
  id: number,
  name: string,
  description: string,
  price: number,
  stockQuantity: number,
  minAge: number,
  maxAge: number,
  imageUrls: string[],
  manufacturer: { name: string } | string,
  category: { name: string } | string,
  averageRating: number,
  reviewCount: number,
  sku: string,
  isFeatured: boolean
}
```

**Features:**
- Image gallery with thumbnails
- Quantity selector (1-10 or stock limit)
- Add to cart with quantity
- Favorite/wishlist toggle
- Share functionality (Web Share API + clipboard fallback)
- Product specifications display
- Stock availability indicator
- Shipping and authenticity badges
- Responsive layout (2-column on desktop, stacked on mobile)

**Usage:**
```jsx
import ProductDetail from '../components/product/ProductDetail';

<ProductDetail
  product={productData}
  onAddReview={(reviewData) => handleAddReview(reviewData)}
/>
```

---

## Cart Components

### CartItem.jsx
Individual cart item with quantity controls and remove functionality.

**Props:**
- `item` (object, required) - Cart item object
- `onUpdate` (function) - Update quantity handler
- `onRemove` (function) - Remove item handler
- `disabled` (boolean) - Disable interactions

**Item Object:**
```javascript
{
  id: number,
  product: {
    id: number,
    name: string,
    price: number,
    imageUrls: string[],
    stockQuantity: number
  },
  quantity: number,
  subtotal: number
}
```

**Features:**
- Product image and name (clickable to product detail)
- Quantity adjustment buttons (increment/decrement)
- Remove button with confirmation
- Stock availability warnings
- Subtotal calculation
- Loading states during updates
- Error handling with alerts

**Usage:**
```jsx
import CartItem from '../components/cart/CartItem';

<CartItem
  item={cartItem}
  onUpdate={(itemId, newQuantity) => updateCart(itemId, newQuantity)}
  onRemove={(itemId) => removeFromCart(itemId)}
/>
```

---

### CartSummary.jsx
Order summary with totals and checkout button.

**Props:**
- `items` (array) - Cart items array
- `subtotal` (number) - Subtotal amount
- `tax` (number) - Tax amount (auto-calculated 18% GST if not provided)
- `shipping` (number) - Shipping cost (auto-calculated based on subtotal)
- `discount` (number) - Discount amount
- `total` (number) - Total amount
- `itemCount` (number) - Total item count
- `onCheckout` (function) - Checkout handler
- `onApplyPromo` (function) - Promo code handler
- `checkoutButtonText` (string) - Custom button text
- `showPromoCode` (boolean) - Show promo input
- `loading` (boolean) - Loading state
- `disabled` (boolean) - Disable checkout

**Features:**
- Auto-calculation of subtotal, tax, shipping, total
- Free shipping threshold (₹500)
- Progress indicator for free shipping
- Promo code input
- Sticky positioning on scroll
- Security badge (Razorpay)
- Empty cart detection

**Usage:**
```jsx
import CartSummary from '../components/cart/CartSummary';

<CartSummary
  items={cartItems}
  onCheckout={() => navigate('/checkout')}
  onApplyPromo={(code) => applyPromoCode(code)}
  showPromoCode={true}
/>
```

---

## Order Components

### OrderSummary.jsx
Comprehensive order details display.

**Props:**
- `order` (object, required) - Order object
- `showShippingAddress` (boolean) - Display shipping section
- `showPaymentInfo` (boolean) - Display payment section
- `showItemDetails` (boolean) - Display items table

**Order Object:**
```javascript
{
  orderNumber: string,
  orderDate: string (ISO),
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  items: [{
    id: number,
    product: { name, price, imageUrls },
    quantity: number,
    price: number,
    subtotal: number
  }],
  subtotal: number,
  tax: number,
  shipping: number,
  total: number,
  shippingAddress: {
    recipientName: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
    phoneNumber: string
  },
  paymentMethod: string,
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
}
```

**Features:**
- Order header with status badge
- Items table with product images
- Shipping address card
- Payment information card
- Price breakdown (subtotal, tax, shipping, total)
- Status color coding
- Responsive grid layout

**Usage:**
```jsx
import OrderSummary from '../components/order/OrderSummary';

<OrderSummary
  order={orderData}
  showShippingAddress={true}
  showPaymentInfo={true}
  showItemDetails={true}
/>
```

---

### OrderTracking.jsx
Order status timeline with visual progress indicators.

**Props:**
- `order` (object, required) - Order tracking object
- `showHeader` (boolean) - Display header section

**Order Object:**
```javascript
{
  orderNumber: string,
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  orderDate: string (ISO),
  estimatedDelivery: string (ISO),
  trackingNumber: string,
  carrier: string
}
```

**Features:**
- Vertical stepper with 4 stages (Placed → Processing → Shipped → Delivered)
- Active step highlighting
- Completed step checkmarks
- Status-based icons and colors
- Tracking number display (when shipped)
- Estimated delivery date
- Cancellation handling
- Delivery confirmation message

**Status Flow:**
1. **PENDING** - Order placed
2. **PROCESSING** - Being prepared
3. **SHIPPED** - In transit (shows tracking info)
4. **DELIVERED** - Completed
5. **CANCELLED** - Cancelled (alternative end state)

**Usage:**
```jsx
import OrderTracking from '../components/order/OrderTracking';

<OrderTracking
  order={{
    orderNumber: 'TT-2024-001',
    status: 'SHIPPED',
    orderDate: '2024-11-15T10:30:00Z',
    estimatedDelivery: '2024-11-20T18:00:00Z',
    trackingNumber: 'TRACK123456',
    carrier: 'Blue Dart'
  }}
  showHeader={true}
/>
```

---

## Common Components

Documented in `frontend/src/components/common/` directory:
- **Header.jsx** - Navigation bar with cart badge and user menu
- **Footer.jsx** - Site footer with links and copyright
- **Button.jsx** - Styled button with loading state
- **Spinner.jsx** - Loading indicator with optional overlay

---

## Integration with Redux

All components integrate with Redux state management:

**Product Components:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchProductById } from '../../store/slices/productSlice';

const { products, loading, error } = useSelector((state) => state.product);
```

**Cart Components:**
```javascript
import { addToCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';

const { items, totalItems, subtotal } = useSelector((state) => state.cart);
dispatch(addToCart({ productId: 1, quantity: 2 }));
```

**Order Components:**
```javascript
import { fetchOrderById, fetchOrderHistory } from '../../store/slices/orderSlice';

const { currentOrder, orderHistory } = useSelector((state) => state.order);
```

---

## Styling

All components use Material-UI (MUI) components and styling:

**Theme Integration:**
```javascript
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
// theme.palette.primary.main = '#1976d2'
// theme.palette.secondary.main = '#dc004e'
```

**Responsive Breakpoints:**
- `xs`: 0px+ (mobile)
- `sm`: 600px+ (tablet)
- `md`: 900px+ (small desktop)
- `lg`: 1200px+ (large desktop)

**Common Patterns:**
```javascript
sx={{
  display: 'flex',
  justifyContent: 'space-between',
  mb: 2, // margin-bottom: theme.spacing(2)
  '&:hover': { transform: 'translateY(-4px)' }
}}
```

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- Semantic HTML elements (`<button>`, `<img>`, `<h1-h6>`)
- ARIA labels on icon-only buttons
- Keyboard navigation support
- Sufficient color contrast
- Screen reader friendly
- Focus indicators

**Example:**
```jsx
<IconButton aria-label="Add to favorites">
  <FavoriteIcon />
</IconButton>
```

---

## Testing

Components can be tested with React Testing Library:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import ProductCard from './ProductCard';

test('renders product name and price', () => {
  render(
    <Provider store={store}>
      <ProductCard id={1} name="Test Toy" price={99.99} />
    </Provider>
  );
  expect(screen.getByText('Test Toy')).toBeInTheDocument();
  expect(screen.getByText(/₹99.99/)).toBeInTheDocument();
});
```

---

## Performance Optimizations

- **Lazy Loading**: Images use `loading="lazy"` attribute
- **Memoization**: Consider wrapping with `React.memo()` for frequently re-rendered components
- **Debouncing**: Search inputs use `useDebounce` hook
- **Pagination**: Large lists split across pages to reduce DOM size
- **Code Splitting**: Components loaded on-demand via React.lazy()

**Example:**
```javascript
const ProductGrid = React.lazy(() => import('./components/product/ProductGrid'));

<Suspense fallback={<Spinner fullPage />}>
  <ProductGrid products={products} />
</Suspense>
```

---

## File Structure

```
frontend/src/components/
├── product/
│   ├── ProductCard.jsx          (T059) ✓
│   ├── ProductGrid.jsx          (T060) ✓
│   └── ProductDetail.jsx        (T061) ✓
├── cart/
│   ├── CartItem.jsx             (T062) ✓
│   └── CartSummary.jsx          (T063) ✓
├── order/
│   ├── OrderSummary.jsx         (T064) ✓
│   └── OrderTracking.jsx        (T065) ✓
└── common/
    ├── Header.jsx
    ├── Footer.jsx
    ├── Button.jsx
    └── Spinner.jsx
```

---

## Next Steps

After implementing these components (T059-T065), proceed with:

1. **T066-T074**: Frontend Pages
   - HomePage with featured products
   - CategoryPage with product grid
   - ProductDetailPage
   - LoginPage and RegisterPage
   - CartPage
   - CheckoutPage with Razorpay
   - OrderConfirmationPage
   - OrderHistoryPage

2. **Integration**: Connect components to pages and Redux state

3. **Testing**: Write unit tests for each component

4. **Storybook**: Create stories for component documentation
