describe('Checkout E2E Tests', () => {
  let testUser;

  before(() => {
    // Register a test user once for all checkout tests
    const timestamp = Date.now();
    testUser = {
      firstName: 'Checkout',
      lastName: 'Test',
      email: `checkouttest${timestamp}@example.com`,
      password: 'Test123!',
      phoneNumber: '+919876543210'
    };
    
    cy.register(testUser);
  });

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    // Login and add items to cart
    cy.visit('/login');
    cy.login(testUser.email, testUser.password);
    
    cy.fixture('products').then((products) => {
      cy.addToCart(products[0].id, 1);
    });
  });

  afterEach(() => {
    cy.logout();
  });

  it('should complete checkout with existing address', () => {
    cy.fixture('addresses').then((addresses) => {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      
      // Navigate to checkout
      cy.visit('/checkout');
      
      // Select shipping address
      cy.get(`[data-testid="address-${defaultAddress.id}"]`).click();
      
      // Mock Razorpay payment
      cy.mockRazorpayPayment();
      
      // Click place order
      cy.get('[data-testid="place-order-button"]').click();
      
      cy.waitForApi('@createOrder');
      
      // Should navigate to order confirmation page
      cy.url().should('include', '/order-confirmation');
      
      // Should display order details
      cy.get('[data-testid="order-number"]').should('be.visible');
      cy.get('[data-testid="order-status"]').should('contain', 'Confirmed');
    });
  });

  it('should complete checkout with new address using custom command', () => {
    // Create new shipping address
    cy.createShippingAddress({
      addressLine1: '456 Test Street',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      isDefault: false
    }).then((address) => {
      // Navigate to checkout
      cy.visit('/checkout');
      
      // Select the new address
      cy.get(`[data-testid="address-${address.id}"]`).click();
      
      // Mock Razorpay and complete checkout
      cy.mockRazorpayPayment();
      cy.get('[data-testid="place-order-button"]').click();
      
      cy.waitForApi('@createOrder');
      
      // Verify order confirmation
      cy.url().should('include', '/order-confirmation');
    });
  });

  it('should complete full checkout flow using custom command', () => {
    cy.fixture('addresses').then((addresses) => {
      const defaultAddress = addresses[0];
      
      // Use custom command to complete checkout
      cy.completeCheckout(defaultAddress.id, {
        razorpayPaymentId: 'pay_test_' + Date.now()
      });
      
      // Should be on order confirmation page
      cy.url().should('include', '/order-confirmation');
    });
  });

  it('should show validation errors for missing shipping address', () => {
    cy.visit('/checkout');
    
    // Try to place order without selecting address
    cy.get('[data-testid="place-order-button"]').click();
    
    // Should display validation error
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'address');
  });

  it('should display order summary with correct items and total', () => {
    cy.visit('/checkout');
    
    // Verify order summary section exists
    cy.get('[data-testid="order-summary"]').should('be.visible');
    
    // Verify items are listed
    cy.get('[data-testid="order-item"]').should('have.length.at.least', 1);
    
    // Verify total amount
    cy.get('[data-testid="order-total"]').should('be.visible');
    cy.get('[data-testid="order-total"]').invoke('text').should('match', /₹\d+/);
  });
});
