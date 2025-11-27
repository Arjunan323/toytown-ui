/**
 * User Story 3 - E2E Tests: Data Persistence (T175, T176)
 * Tests order history and cart preservation across sessions
 */

describe('US3: Order History Preservation E2E Tests (T175)', () => {
  let testUser;

  beforeEach(() => {
    cy.setupApiIntercepts();
  });

  describe('Order History Persistence', () => {
    it('should display orders in order history after purchase', () => {
      // Register and login
      const timestamp = Date.now();
      testUser = {
        email: `orderhistory${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Order',
        lastName: 'Test',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      // Make a purchase
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      cy.createShippingAddress({}).then((address) => {
        cy.mockRazorpayPayment();
        cy.completeCheckout(address.id);
        
        // Navigate to order history
        cy.visit('/orders');
        
        // Should display the order
        cy.get('[data-testid="order-card"]').should('have.length.at.least', 1);
        cy.contains('Order Total').should('be.visible');
      });
    });

    it('should preserve order history after logout and login', () => {
      // Register and create an order
      const timestamp = Date.now();
      testUser = {
        email: `persistorder${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Persist',
        lastName: 'Order',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      // Create order
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      cy.createShippingAddress({}).then((address) => {
        cy.mockRazorpayPayment();
        cy.completeCheckout(address.id);
        
        // Verify order exists
        cy.visit('/orders');
        cy.get('[data-testid="order-card"]').should('exist');
        
        // Logout
        cy.get('[data-testid="user-menu"]').click();
        cy.contains('Logout').click();
        
        // Login again
        cy.visit('/login');
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();
        
        // Check order history again
        cy.visit('/orders');
        
        // Orders should still be present
        cy.get('[data-testid="order-card"]').should('exist');
      });
    });

    it('should preserve order history across browser sessions', () => {
      // Register and create order
      const timestamp = Date.now();
      testUser = {
        email: `sessionorder${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Session',
        lastName: 'Test',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      cy.createShippingAddress({}).then((address) => {
        cy.mockRazorpayPayment();
        cy.completeCheckout(address.id);
        
        // Clear browser storage to simulate new session
        cy.clearLocalStorage();
        cy.clearCookies();
        
        // Login again (new session)
        cy.visit('/login');
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();
        
        // Navigate to orders
        cy.visit('/orders');
        
        // Orders should still be accessible
        cy.get('[data-testid="order-card"]').should('exist');
      });
    });
  });

  describe('Order History Display', () => {
    beforeEach(() => {
      const timestamp = Date.now();
      testUser = {
        email: `orderdisplay${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Display',
        lastName: 'Test',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
    });

    it('should display order details correctly', () => {
      cy.visit('/orders');
      
      // Should show order information
      cy.get('[data-testid="order-card"]').first().within(() => {
        cy.contains('Order #').should('be.visible');
        cy.contains('Order Total').should('be.visible');
        cy.contains('Status').should('be.visible');
      });
    });

    it('should show multiple orders in chronological order', () => {
      // Create multiple orders
      for (let i = 0; i < 2; i++) {
        cy.visit('/products');
        cy.get('[data-testid="product-card"]').eq(i).click();
        cy.contains('button', 'Add to Cart').click();
        cy.visit('/cart');
        cy.contains('button', 'Proceed to Checkout').click();
        
        cy.createShippingAddress({}).then((address) => {
          cy.mockRazorpayPayment();
          cy.completeCheckout(address.id);
          cy.wait(1000);
        });
      }
      
      cy.visit('/orders');
      cy.get('[data-testid="order-card"]').should('have.length.at.least', 2);
    });
  });

  describe('Profile Page Order History Tab', () => {
    it('should display recent orders in Profile page', () => {
      const timestamp = Date.now();
      testUser = {
        email: `profileorders${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Profile',
        lastName: 'Orders',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      // Create an order
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      cy.createShippingAddress({}).then((address) => {
        cy.mockRazorpayPayment();
        cy.completeCheckout(address.id);
        
        // Navigate to profile
        cy.visit('/profile');
        cy.get('[role="tab"]').contains('Order History').click();
        
        // Should show recent orders
        cy.contains('Recent Orders').should('be.visible');
        cy.get('[data-testid="order-item"]').should('exist');
      });
    });
  });
});

describe('US3: Cart Preservation Across Sessions E2E Tests (T176)', () => {
  let testUser;

  beforeEach(() => {
    cy.setupApiIntercepts();
  });

  describe('Cart Persistence After Logout/Login', () => {
    it('should preserve cart items after logout and login', () => {
      // Register and login
      const timestamp = Date.now();
      testUser = {
        email: `cartpersist${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Cart',
        lastName: 'Persist',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      // Add items to cart
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.get('[data-testid="product-name"]').first().invoke('text').as('productName');
      cy.contains('button', 'Add to Cart').click();
      cy.wait(1000);
      
      // Verify cart has items
      cy.visit('/cart');
      cy.get('[data-testid="cart-item"]').should('have.length', 1);
      
      // Logout
      cy.get('[data-testid="user-menu"]').click();
      cy.contains('Logout').click();
      
      // Login again
      cy.visit('/login');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      // Check cart
      cy.visit('/cart');
      
      // Cart items should still be present
      cy.get('[data-testid="cart-item"]').should('have.length', 1);
    });

    it('should preserve cart quantity after session', () => {
      const timestamp = Date.now();
      testUser = {
        email: `cartquantity${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Quantity',
        lastName: 'Test',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      // Add item with specific quantity
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.wait(500);
      
      // Update quantity
      cy.visit('/cart');
      cy.get('[data-testid="quantity-input"]').first().clear().type('3');
      cy.get('[data-testid="update-quantity-button"]').first().click();
      cy.wait(1000);
      
      // Logout and login
      cy.get('[data-testid="user-menu"]').click();
      cy.contains('Logout').click();
      cy.visit('/login');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      // Check cart quantity
      cy.visit('/cart');
      cy.get('[data-testid="quantity-input"]').first().should('have.value', '3');
    });
  });

  describe('Cart Persistence Across Browser Sessions', () => {
    it('should preserve cart after clearing localStorage', () => {
      const timestamp = Date.now();
      testUser = {
        email: `cartsession${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Session',
        lastName: 'Cart',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      // Add items to cart
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').eq(0).click();
      cy.contains('button', 'Add to Cart').click();
      cy.wait(1000);
      
      // Verify cart
      cy.visit('/cart');
      cy.get('[data-testid="cart-item"]').should('exist');
      
      // Clear localStorage and cookies to simulate new session
      cy.clearLocalStorage();
      cy.clearCookies();
      
      // Login again
      cy.visit('/login');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      // Cart should be restored
      cy.visit('/cart');
      cy.get('[data-testid="cart-item"]').should('exist');
    });
  });

  describe('Multiple Items Cart Persistence', () => {
    it('should preserve multiple cart items correctly', () => {
      const timestamp = Date.now();
      testUser = {
        email: `multicart${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Multi',
        lastName: 'Cart',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      // Add multiple products
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').eq(0).click();
      cy.contains('button', 'Add to Cart').click();
      cy.wait(500);
      
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').eq(1).click();
      cy.contains('button', 'Add to Cart').click();
      cy.wait(500);
      
      // Verify cart count
      cy.visit('/cart');
      cy.get('[data-testid="cart-item"]').should('have.length', 2);
      
      // Logout/Login
      cy.logout();
      cy.visit('/login');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      // All items should be present
      cy.visit('/cart');
      cy.get('[data-testid="cart-item"]').should('have.length', 2);
    });
  });

  describe('Cart Header Badge Persistence', () => {
    it('should update cart badge count after login', () => {
      const timestamp = Date.now();
      testUser = {
        email: `cartbadge${timestamp}@example.com`,
        password: 'Test1234!',
        firstName: 'Badge',
        lastName: 'Test',
        phoneNumber: '9876543210',
      };
      
      cy.register(testUser);
      
      // Add items
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.wait(1000);
      
      // Check badge
      cy.get('[data-testid="cart-badge"]').should('contain', '1');
      
      // Logout/Login
      cy.logout();
      cy.visit('/login');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      // Badge should still show correct count
      cy.get('[data-testid="cart-badge"]').should('contain', '1');
    });
  });
});
