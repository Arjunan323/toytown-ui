describe('Shopping Cart E2E Tests', () => {
  let testUser;

  before(() => {
    // Register a test user once for all cart tests
    const timestamp = Date.now();
    testUser = {
      firstName: 'Cart',
      lastName: 'Test',
      email: `carttest${timestamp}@example.com`,
      password: 'Test123!',
      phoneNumber: '+919876543210'
    };
    
    cy.register(testUser);
  });

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    // Login before each test
    cy.visit('/login');
    cy.login(testUser.email, testUser.password);
  });

  afterEach(() => {
    // Logout after each test
    cy.logout();
  });

  it('should add product to cart using custom command', () => {
    cy.fixture('products').then((products) => {
      const product = products[0];
      
      // Add product to cart using custom command
      cy.addToCart(product.id, 2);
      
      // Visit cart page
      cy.visit('/cart');
      cy.waitForApi('@getCart');
      
      // Verify product is in cart
      cy.get('[data-testid="cart-item"]').should('have.length.at.least', 1);
      cy.get('[data-testid="cart-item"]').first()
        .should('contain', product.name);
    });
  });

  it('should update cart item quantity', () => {
    cy.fixture('products').then((products) => {
      // Add product to cart
      cy.addToCart(products[0].id, 1);
      
      // Visit cart page
      cy.visit('/cart');
      cy.waitForApi('@getCart');
      
      // Update quantity
      cy.get('[data-testid="quantity-input"]').first().clear().type('3');
      cy.get('[data-testid="update-quantity-button"]').first().click();
      
      cy.waitForApi('@getCart');
      
      // Verify updated quantity
      cy.get('[data-testid="quantity-input"]').first().should('have.value', '3');
    });
  });

  it('should remove item from cart', () => {
    cy.fixture('products').then((products) => {
      // Add product to cart
      cy.addToCart(products[0].id, 1);
      
      // Visit cart page
      cy.visit('/cart');
      cy.waitForApi('@getCart');
      
      // Get initial cart item count
      cy.get('[data-testid="cart-item"]').its('length').then((initialCount) => {
        // Remove first item
        cy.get('[data-testid="remove-item-button"]').first().click();
        
        // Verify item was removed
        cy.get('[data-testid="cart-item"]').should('have.length', initialCount - 1);
      });
    });
  });

  it('should display correct cart total', () => {
    cy.fixture('products').then((products) => {
      // Add multiple products
      cy.addToCart(products[0].id, 2);
      cy.addToCart(products[1].id, 1);
      
      // Visit cart page
      cy.visit('/cart');
      cy.waitForApi('@getCart');
      
      // Verify cart summary displays total
      cy.get('[data-testid="cart-total"]').should('be.visible');
      cy.get('[data-testid="cart-total"]').invoke('text').should('match', /₹\d+/);
    });
  });

  it('should proceed to checkout from cart', () => {
    cy.fixture('products').then((products) => {
      // Add product to cart
      cy.addToCart(products[0].id, 1);
      
      // Visit cart page
      cy.visit('/cart');
      cy.waitForApi('@getCart');
      
      // Click checkout button
      cy.get('[data-testid="checkout-button"]').click();
      
      // Should navigate to checkout page
      cy.url().should('include', '/checkout');
    });
  });
});
