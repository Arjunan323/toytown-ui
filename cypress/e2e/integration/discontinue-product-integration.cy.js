/**
 * Integration Test: Discontinue Product Workflow
 * 
 * Verifies that when an admin discontinues a product:
 * - Product is hidden from customer browsing (category, search, featured)
 * - Product is still visible in historical orders
 * - Product details are preserved (name, price, image)
 * - Product can be reactivated by admin
 */

describe('T232: Discontinue Product Admin → Customer Integration', () => {
  const adminCredentials = {
    username: 'admin',
    password: 'Admin@123'
  };

  const customerCredentials = {
    email: 'john.doe@example.com',
    password: 'Password@123'
  };

  let testProductId = null;
  let testProductSku = null;
  let testProductName = null;
  let testProductPrice = null;
  let orderId = null;

  before(() => {
    // Setup: Create test product and place an order
    cy.clearLocalStorage();
    cy.clearCookies();

    // Admin creates product
    cy.visit('/admin/login');
    cy.get('input[name="username"]').type(adminCredentials.username);
    cy.get('input[name="password"]').type(adminCredentials.password);
    cy.get('button[type="submit"]').click();

    cy.visit('/admin/products/new');
    testProductName = `Discontinue Test ${Date.now()}`;
    testProductSku = `DISC-TEST-${Date.now()}`;
    testProductPrice = '39.99';

    cy.get('input[name="name"]').type(testProductName);
    cy.get('textarea[name="description"]').type('Product to test discontinue workflow');
    cy.get('input[name="price"]').clear().type(testProductPrice);
    cy.get('input[name="stockQuantity"]').clear().type('20');
    cy.get('input[name="minAge"]').clear().type('5');
    cy.get('input[name="maxAge"]').clear().type('12');
    cy.get('input[name="sku"]').type(testProductSku);
    cy.get('select[name="categoryId"]').select('1');
    cy.get('select[name="manufacturerId"]').select('1');
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('match', /\/admin\/products/);
    cy.get('button').contains(/logout/i).click();

    // Customer places order with this product
    cy.visit('/login');
    cy.get('input[name="email"]').type(customerCredentials.email);
    cy.get('input[name="password"]').type(customerCredentials.password);
    cy.get('button[type="submit"]').click();

    cy.visit('/products');
    cy.get('input[placeholder*="Search"]').type(testProductSku);
    cy.get('button[aria-label="Search"]').click();
    cy.contains(testProductName, { timeout: 10000 }).click();

    // Capture product ID
    cy.url().then((url) => {
      const match = url.match(/\/products\/(\d+)/);
      if (match) {
        testProductId = parseInt(match[1]);
      }
    });

    // Add to cart
    cy.get('button').contains(/add to cart/i).click();
    cy.contains(/added to cart/i, { timeout: 5000 }).should('be.visible');

    // Complete purchase (simplified flow)
    cy.visit('/cart');
    cy.contains(testProductName).should('be.visible');
    cy.get('button').contains(/checkout|proceed/i).click();

    // Assume order is placed successfully
    // Capture order ID from confirmation page or API
    cy.url({ timeout: 15000 }).should('match', /\/order\/\d+|\/orders/);
    cy.url().then((url) => {
      const match = url.match(/\/order\/(\d+)/);
      if (match) {
        orderId = parseInt(match[1]);
      }
    });

    cy.clearLocalStorage();
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Discontinue Product Workflow', () => {
    it('should discontinue product via admin panel', () => {
      // Admin login
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      // Navigate to products
      cy.visit('/admin/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.contains(testProductSku, { timeout: 10000 }).should('be.visible');

      // Click discontinue button
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.get('button[aria-label="Discontinue"]').click();
      });

      // Confirm discontinue in dialog
      cy.get('[role="dialog"]').within(() => {
        cy.contains(/are you sure/i).should('be.visible');
        cy.get('button').contains(/discontinue|confirm/i).click();
      });

      // Verify success message
      cy.contains(/product discontinued successfully/i, { timeout: 5000 }).should('be.visible');

      // Verify status updated to Discontinued in admin table
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.contains(/discontinued/i).should('be.visible');
      });
    });

    it('should hide discontinued product from customer category browsing', () => {
      // Customer login
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      // Browse category (Action Figures)
      cy.visit('/products');
      cy.get('button').contains(/categories/i).click();
      cy.contains('Action Figures').click();

      // Verify discontinued product is NOT visible
      cy.contains(testProductName).should('not.exist');
    });

    it('should hide discontinued product from customer search results', () => {
      // Customer already logged in
      cy.visit('/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.get('button[aria-label="Search"]').click();

      // Verify no results or product not shown
      cy.contains(/no products found|no results/i).should('be.visible');
      cy.contains(testProductName).should('not.exist');
    });

    it('should hide discontinued product from featured products', () => {
      // If product was featured, it should not appear
      cy.visit('/');
      cy.get('[data-testid="featured-products"]').within(() => {
        cy.contains(testProductName).should('not.exist');
      });
    });

    it('should prevent customer from accessing discontinued product detail page directly', () => {
      // Try to access product by ID
      if (testProductId) {
        cy.visit(`/products/${testProductId}`, { failOnStatusCode: false });

        // Should show 404 or "Product not available"
        cy.contains(/not found|not available|discontinued/i).should('be.visible');
      }
    });

    it('should preserve discontinued product details in historical orders', () => {
      // Customer views order history
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.visit('/profile/orders');

      // Find order containing discontinued product
      if (orderId) {
        cy.contains(`Order #${orderId}`).click();
      } else {
        // Find first order
        cy.get('[data-testid="order-item"]').first().click();
      }

      // Verify product still shows in order details
      cy.contains(testProductName).should('be.visible');
      cy.contains(`$${testProductPrice}`).should('be.visible');
      cy.contains(`SKU: ${testProductSku}`).should('be.visible');

      // Product name should NOT be a link to product detail
      cy.contains(testProductName).should('not.have.attr', 'href');
    });

    it('should show discontinued status in admin product list filters', () => {
      // Admin login
      cy.clearLocalStorage();
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.visit('/admin/products');

      // Filter by discontinued status
      cy.get('select[name="status"]').select('Discontinued');

      // Verify test product appears
      cy.contains(testProductSku, { timeout: 10000 }).should('be.visible');

      // Filter by active status
      cy.get('select[name="status"]').select('Active');

      // Verify test product does NOT appear
      cy.contains(testProductSku).should('not.exist');
    });

    it('should allow admin to reactivate discontinued product', () => {
      // Admin already logged in
      cy.visit('/admin/products');

      // Filter by discontinued
      cy.get('select[name="status"]').select('Discontinued');
      cy.contains(testProductSku, { timeout: 10000 }).should('be.visible');

      // Click reactivate button
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.get('button[aria-label="Reactivate"]').click();
      });

      // Confirm reactivate
      cy.get('[role="dialog"]').within(() => {
        cy.contains(/are you sure/i).should('be.visible');
        cy.get('button').contains(/reactivate|confirm/i).click();
      });

      // Verify success message
      cy.contains(/product reactivated successfully/i, { timeout: 5000 }).should('be.visible');

      // Verify status updated to Active
      cy.get('select[name="status"]').select('Active');
      cy.get('input[placeholder*="Search"]').clear().type(testProductSku);
      cy.contains(testProductSku, { timeout: 10000 }).should('be.visible');
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.contains(/active/i).should('be.visible');
      });
    });

    it('should show reactivated product in customer browsing', () => {
      // Admin logout
      cy.get('button').contains(/logout/i).click();

      // Customer login
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      // Search for product
      cy.visit('/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.get('button[aria-label="Search"]').click();

      // Verify product appears again
      cy.contains(testProductName, { timeout: 10000 }).should('be.visible');

      // Click to view details
      cy.contains(testProductName).click();
      cy.url().should('include', `/products/${testProductId}`);

      // Verify can add to cart again
      cy.get('button').contains(/add to cart/i).should('not.be.disabled');
    });
  });

  after(() => {
    // Cleanup
    if (testProductId) {
      cy.log(`Test product ID: ${testProductId}, Order ID: ${orderId}`);
    }
  });
});
