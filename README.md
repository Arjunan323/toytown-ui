# ToyTown Frontend

React 18 + Vite frontend for Aadhav's ToyTown online toy store.

## Tech Stack

- **React 18.3**: UI library
- **Vite 5.4**: Build tool and dev server
- **React Router 6**: Client-side routing (to be installed)
- **Redux Toolkit**: State management (to be installed)
- **Axios**: HTTP client (to be installed)
- **Material-UI**: Component library (to be installed)

## Project Structure

```
src/
├── components/        # Reusable React components
│   ├── common/       # Shared components (Header, Footer, Button)
│   ├── product/      # Product-related components
│   ├── cart/         # Shopping cart components
│   └── order/        # Order-related components
├── pages/            # Page components
│   └── customer/     # Customer-facing pages
├── services/         # API service layer
├── store/            # Redux store configuration
│   └── slices/       # Redux slices
├── utils/            # Utility functions
└── assets/           # Static assets (images, fonts)
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## API Configuration

The development server proxies API requests to the backend:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api/v1`

API requests to `/api/*` are automatically proxied to `http://localhost:8080`.

## Environment Variables

Create `.env.development` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

## Next Steps (Per tasks.md)

**Phase 2 - Frontend Infrastructure (T019-T025)**:
1. T019: Install dependencies (React Router, Redux Toolkit, Axios, Material-UI)
2. T020: Create `.env.development` with API base URL and Razorpay key
3. T021: Create Axios instance with JWT interceptors
4. T022: Setup Redux store
5. T023: Create auth slice
6. T024: Setup React Router
7. T025: Create reusable common components

**Phase 3 - User Story 1 Implementation (T052-T074)**:
- Services, Redux slices, components, and pages for browse and purchase flow

## Related Documentation

- [Plan](../specs/001-toytown-app/plan.md) - Implementation plan
- [Tasks](../specs/001-toytown-app/tasks.md) - Development tasks
- [API Specification](../specs/001-toytown-app/api-specification.md) - Backend API docs
