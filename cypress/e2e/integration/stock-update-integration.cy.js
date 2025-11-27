/**
 * Integration Test: Stock Update Flow
 * 
 * Verifies that stock updates made by admin are immediately reflected
 * on the customer site, including product detail pages, cart validation,
 * and purchase flow.
 */

describe('T231: Stock Update Admin → Customer Integration', () => {
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
  let originalStock = 0;
  let newStock = 0;

  before(() => {
    // Setup: Create a test product with known stock
    cy.clearLocalStorage();
    cy.clearCookies();

    // Admin login
    cy.visit('/admin/login');
    cy.get('input[name="username"]').type(adminCredentials.username);
    cy.get('input[name="password"]').type(adminCredentials.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');

    // Create test product
    cy.visit('/admin/products/new');
    const uniqueName = `Stock Test Product ${Date.now()}`;
    testProductSku = `STOCK-TEST-${Date.now()}`;
    originalStock = 10;

    cy.get('input[name="name"]').type(uniqueName);
    cy.get('textarea[name="description"]').type('Product for testing stock updates');
    cy.get('input[name="price"]').clear().type('29.99');
    cy.get('input[name="stockQuantity"]').clear().type(originalStock.toString());
    cy.get('input[name="minAge"]').clear().type('5');
    cy.get('input[name="maxAge"]').clear().type('10');
    cy.get('input[name="sku"]').type(testProductSku);
    cy.get('select[name="categoryId"]').select('1');
    cy.get('select[name="manufacturerId"]').select('1');
    cy.get('button[type="submit"]').click();

    // Capture product ID
    cy.url({ timeout: 10000 }).should('match', /\/admin\/products(\/\d+)?/);
    cy.url().then((url) => {
      const match = url.match(/\/admin\/products\/(\d+)/);
      if (match) {
        testProductId = parseInt(match[1]);
      } else {
        // If redirected to list, search for product
        cy.visit('/admin/products');
        cy.get('input[placeholder*="Search"]').type(testProductSku);
        cy.contains(testProductSku).parent().should('have.attr', 'data-product-id').then((id) => {
          testProductId = parseInt(id);
        });
      }
    });

    cy.get('button').contains(/logout/i).click();
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Stock Update Workflow', () => {
    it('should update stock via admin and reflect on customer product detail page', () => {
      newStock = 25;

      // Admin login
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      // Navigate to products list
      cy.visit('/admin/products');

      // Search for test product
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.contains(testProductSku, { timeout: 10000 }).should('be.visible');

      // Click update stock button
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.get('button[aria-label="Update Stock"]').click();
      });

      // Update stock modal
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[name="stockQuantity"]').clear().type(newStock.toString());
        cy.get('button').contains(/update|save/i).click();
      });

      // Verify success message
      cy.contains(/stock updated successfully/i, { timeout: 5000 }).should('be.visible');

      // Verify new stock appears in table
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.contains(newStock.toString()).should('be.visible');
      });

      // Admin logout
      cy.get('button').contains(/logout/i).click();

      // Customer login
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      // Navigate to product detail page
      cy.visit('/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.get('button[aria-label="Search"]').click();
      cy.contains(testProductSku, { timeout: 10000 }).click();

      // Verify updated stock is displayed
      cy.contains(/in stock/i).should('be.visible');
      cy.contains(`${newStock} available`).should('be.visible');
    });

    it('should prevent customer from adding more than available stock to cart', () => {
      // Customer already logged in from previous test
      cy.visit('/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.get('button[aria-label="Search"]').click();
      cy.contains(testProductSku).click();

      // Try to add quantity > stock
      const overStock = newStock + 10;
      cy.get('input[type="number"][name="quantity"]').clear().type(overStock.toString());
      cy.get('button').contains(/add to cart/i).click();

      // Should show error
      cy.contains(/only \d+ available|insufficient stock/i, { timeout: 5000 }).should('be.visible');

      // Try valid quantity
      cy.get('input[type="number"][name="quantity"]').clear().type('5');
      cy.get('button').contains(/add to cart/i).click();

      // Should succeed
      cy.contains(/added to cart/i, { timeout: 5000 }).should('be.visible');
    });

    it('should reduce stock to low level and display warning', () => {
      newStock = 3; // Below low stock threshold (typically 5 or 10)

      // Admin login
      cy.clearLocalStorage();
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      // Update stock to low level
      cy.visit('/admin/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.get('button[aria-label="Update Stock"]').click();
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[name="stockQuantity"]').clear().type(newStock.toString());
        cy.get('button').contains(/update|save/i).click();
      });

      cy.contains(/stock updated successfully/i, { timeout: 5000 }).should('be.visible');

      // Verify low stock indicator in admin panel
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.get('[data-testid="stock-badge"]').should('have.class', 'low-stock');
        cy.contains(/low stock/i).should('be.visible');
      });

      // Check low stock products view
      cy.visit('/admin/products/low-stock');
      cy.contains(testProductSku).should('be.visible');

      // Admin logout
      cy.get('button').contains(/logout/i).click();

      // Customer view
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.visit('/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.get('button[aria-label="Search"]').click();
      cy.contains(testProductSku).click();

      // Should show low stock warning to customer
      cy.contains(/only \d+ left|limited stock/i).should('be.visible');
    });

    it('should mark product as out of stock when quantity is 0', () => {
      newStock = 0;

      // Admin login
      cy.clearLocalStorage();
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      // Update stock to 0
      cy.visit('/admin/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.contains(testProductSku).parent().parent().within(() => {
        cy.get('button[aria-label="Update Stock"]').click();
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[name="stockQuantity"]').clear().type('0');
        cy.get('button').contains(/update|save/i).click();
      });

      cy.contains(/stock updated successfully/i, { timeout: 5000 }).should('be.visible');

      // Admin logout
      cy.get('button').contains(/logout/i).click();

      // Customer view
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.visit('/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.get('button[aria-label="Search"]').click();
      cy.contains(testProductSku).click();

      // Should show out of stock
      cy.contains(/out of stock/i).should('be.visible');

      // Add to cart button should be disabled
      cy.get('button').contains(/add to cart/i).should('be.disabled');
    });
  });

  after(() => {
    // Cleanup: Optional, delete test product
    if (testProductId) {
      cy.log(`Test product ID: ${testProductId}`);
    }
  });
});
