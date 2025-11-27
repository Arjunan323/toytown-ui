// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @example cy.login('customer@example.com', 'password123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('accessToken');
    
    // Store token in localStorage
    window.localStorage.setItem('accessToken', response.body.accessToken);
    window.localStorage.setItem('refreshToken', response.body.refreshToken);
    window.localStorage.setItem('customer', JSON.stringify(response.body.customer));
  });
});

/**
 * Custom command to logout a user
 * @example cy.logout()
 */
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');
  window.localStorage.removeItem('customer');
});

/**
 * Custom command to register a new user
 * @param {Object} userData - User registration data
 * @example cy.register({ email: 'test@example.com', password: 'Test123!', firstName: 'Test', lastName: 'User' })
 */
Cypress.Commands.add('register', (userData) => {
  const defaultUserData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'Test123!',
    phoneNumber: '+919876543210',
  };

  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: { ...defaultUserData, ...userData },
  }).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body).to.have.property('accessToken');
  });
});

/**
 * Custom command to add a product to cart
 * @param {number} productId - Product ID to add
 * @param {number} quantity - Quantity to add (default: 1)
 * @example cy.addToCart(123, 2)
 */
Cypress.Commands.add('addToCart', (productId, quantity = 1) => {
  const token = window.localStorage.getItem('accessToken');
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/cart/items`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      productId,
      quantity,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

/**
 * Custom command to update cart item quantity
 * @param {number} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 * @example cy.updateCartItem(456, 3)
 */
Cypress.Commands.add('updateCartItem', (cartItemId, quantity) => {
  const token = window.localStorage.getItem('accessToken');
  
  cy.request({
    method: 'PUT',
    url: `${Cypress.env('apiUrl')}/cart/items/${cartItemId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      quantity,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

/**
 * Custom command to remove item from cart
 * @param {number} cartItemId - Cart item ID to remove
 * @example cy.removeFromCart(456)
 */
Cypress.Commands.add('removeFromCart', (cartItemId) => {
  const token = window.localStorage.getItem('accessToken');
  
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/cart/items/${cartItemId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    expect(response.status).to.eq(204);
  });
});

/**
 * Custom command to get cart contents
 * @example cy.getCart()
 */
Cypress.Commands.add('getCart', () => {
  const token = window.localStorage.getItem('accessToken');
  
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/cart`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

/**
 * Custom command to complete checkout process
 * @param {number} shippingAddressId - Shipping address ID
 * @param {Object} paymentDetails - Payment details (optional for testing)
 * @example cy.completeCheckout(789, { razorpayPaymentId: 'pay_test123' })
 */
Cypress.Commands.add('completeCheckout', (shippingAddressId, paymentDetails = null) => {
  const token = window.localStorage.getItem('accessToken');
  
  // Step 1: Create order
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/orders`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      shippingAddressId,
    },
  }).then((orderResponse) => {
    expect(orderResponse.status).to.eq(201);
    expect(orderResponse.body).to.have.property('id');
    expect(orderResponse.body).to.have.property('razorpayOrderId');
    
    const orderId = orderResponse.body.id;
    
    // Step 2: Confirm payment (if payment details provided)
    if (paymentDetails) {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/orders/${orderId}/confirm`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          razorpayPaymentId: paymentDetails.razorpayPaymentId || 'pay_test_' + Date.now(),
          razorpaySignature: paymentDetails.razorpaySignature || 'signature_test_' + Date.now(),
        },
      }).then((confirmResponse) => {
        expect(confirmResponse.status).to.eq(200);
        return confirmResponse.body;
      });
    } else {
      return orderResponse.body;
    }
  });
});

/**
 * Custom command to create a shipping address
 * @param {Object} addressData - Address details
 * @example cy.createShippingAddress({ addressLine1: '123 Main St', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India' })
 */
Cypress.Commands.add('createShippingAddress', (addressData) => {
  const token = window.localStorage.getItem('accessToken');
  
  const defaultAddress = {
    addressLine1: '123 Test Street',
    addressLine2: 'Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    isDefault: true,
  };
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/customers/addresses`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: { ...defaultAddress, ...addressData },
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

/**
 * Custom command to search for products
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Optional filters (category, minPrice, maxPrice, etc.)
 * @example cy.searchProducts('action figures', { categoryId: 1, minPrice: 10, maxPrice: 100 })
 */
Cypress.Commands.add('searchProducts', (searchTerm, filters = {}) => {
  const params = new URLSearchParams({
    search: searchTerm,
    ...filters,
  });
  
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/products?${params.toString()}`,
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

/**
 * Custom command to intercept and mock Razorpay payment
 * @example cy.mockRazorpayPayment()
 */
Cypress.Commands.add('mockRazorpayPayment', () => {
  cy.window().then((win) => {
    win.Razorpay = class {
      constructor(options) {
        this.options = options;
        // Auto-trigger success handler with mock payment details
        setTimeout(() => {
          if (options.handler) {
            options.handler({
              razorpay_payment_id: 'pay_test_' + Date.now(),
              razorpay_order_id: options.order_id,
              razorpay_signature: 'signature_test_' + Date.now(),
            });
          }
        }, 100);
      }
      open() {
        // Mock open method
      }
    };
  });
});

/**
 * Custom command to wait for API call
 * @param {string} alias - Intercept alias
 * @example cy.waitForApi('@getProducts')
 */
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias).its('response.statusCode').should('be.oneOf', [200, 201, 204]);
});

/**
 * Custom command to setup API intercepts for common endpoints
 * @example cy.setupApiIntercepts()
 */
Cypress.Commands.add('setupApiIntercepts', () => {
  cy.intercept('GET', `${Cypress.env('apiUrl')}/products*`).as('getProducts');
  cy.intercept('GET', `${Cypress.env('apiUrl')}/categories*`).as('getCategories');
  cy.intercept('GET', `${Cypress.env('apiUrl')}/cart*`).as('getCart');
  cy.intercept('POST', `${Cypress.env('apiUrl')}/cart/items*`).as('addToCart');
  cy.intercept('POST', `${Cypress.env('apiUrl')}/orders*`).as('createOrder');
  cy.intercept('GET', `${Cypress.env('apiUrl')}/orders*`).as('getOrders');
});
