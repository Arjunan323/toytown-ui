/**
 * Integration Tests: Admin-Customer Interaction
 * 
 * These tests verify that admin actions (create, update, discontinue products)
 * are correctly reflected in the customer-facing site.
 */

describe('Admin-Customer Integration Tests', () => {
  const adminCredentials = {
    username: 'admin',
    password: 'Admin@123'
  };

  const customerCredentials = {
    email: 'john.doe@example.com',
    password: 'Password@123'
  };

  // Unique product data to avoid conflicts
  const uniqueProduct = {
    name: `Test Robot ${Date.now()}`,
    description: 'Advanced robot toy with LED lights and sounds. Perfect for young engineers.',
    price: 79.99,
    stockQuantity: 50,
    minAge: 6,
    maxAge: 12,
    sku: `TEST-ROBOT-${Date.now()}`,
    categoryId: 1, // Assuming Action Figures
    manufacturerId: 1, // Assuming LEGO
    isFeatured: true
  };

  let createdProductId = null;

  beforeEach(() => {
    // Clean up localStorage
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  /**
   * T230: Integration Test - Create Product via Admin, Verify Visible on Customer Site
   */
  describe('T230: Create Product Admin → Customer Flow', () => {
    it('should allow admin to create product and customer to view it', () => {
      // Step 1: Admin login
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      // Verify redirect to admin dashboard
      cy.url().should('include', '/admin/dashboard');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('adminAccessToken')).to.exist;
      });

      // Step 2: Navigate to create product page
      cy.visit('/admin/products/new');
      cy.url().should('include', '/admin/products/new');

      // Step 3: Fill in product form
      cy.get('input[name="name"]').type(uniqueProduct.name);
      cy.get('textarea[name="description"]').type(uniqueProduct.description);
      cy.get('input[name="price"]').clear().type(uniqueProduct.price.toString());
      cy.get('input[name="stockQuantity"]').clear().type(uniqueProduct.stockQuantity.toString());
      cy.get('input[name="minAge"]').clear().type(uniqueProduct.minAge.toString());
      cy.get('input[name="maxAge"]').clear().type(uniqueProduct.maxAge.toString());
      cy.get('input[name="sku"]').type(uniqueProduct.sku);
      
      // Select category and manufacturer
      cy.get('select[name="categoryId"]').select(uniqueProduct.categoryId.toString());
      cy.get('select[name="manufacturerId"]').select(uniqueProduct.manufacturerId.toString());
      
      // Mark as featured
      cy.get('input[name="isFeatured"]').check();

      // Step 4: Submit form
      cy.get('button[type="submit"]').contains(/create product|add product/i).click();

      // Wait for success message
      cy.contains(/product created successfully/i, { timeout: 10000 }).should('be.visible');

      // Capture product ID from URL or response
      cy.url().should('match', /\/admin\/products\/\d+\/edit|\/admin\/products$/);
      cy.url().then((url) => {
        const match = url.match(/\/admin\/products\/(\d+)/);
        if (match) {
          createdProductId = parseInt(match[1]);
        }
      });

      // Step 5: Admin logout
      cy.get('button').contains(/logout/i).click();
      cy.url().should('include', '/admin/login');

      // Step 6: Customer login
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      // Verify redirect to home
      cy.url().should('match', /\/$|\/home/);

      // Step 7: Customer browses products
      cy.visit('/products');

      // Step 8: Search for the newly created product
      cy.get('input[placeholder*="Search"]').type(uniqueProduct.name);
      cy.get('button[aria-label="Search"]').click();

      // Verify product appears in search results
      cy.contains(uniqueProduct.name, { timeout: 10000 }).should('be.visible');
      cy.contains(`$${uniqueProduct.price}`).should('be.visible');

      // Step 9: Click on product to view details
      cy.contains(uniqueProduct.name).click();
      cy.url().should('include', '/products/');

      // Verify product details
      cy.get('h1').should('contain', uniqueProduct.name);
      cy.contains(uniqueProduct.description).should('be.visible');
      cy.contains(`$${uniqueProduct.price}`).should('be.visible');
      cy.contains(/in stock/i).should('be.visible');
      cy.contains(`Ages ${uniqueProduct.minAge}-${uniqueProduct.maxAge}`).should('be.visible');
      cy.contains(`SKU: ${uniqueProduct.sku}`).should('be.visible');

      // Step 10: Customer adds product to cart
      cy.get('button').contains(/add to cart/i).click();
      cy.contains(/added to cart/i, { timeout: 5000 }).should('be.visible');

      // Step 11: Verify cart contains product
      cy.visit('/cart');
      cy.contains(uniqueProduct.name).should('be.visible');
      cy.contains(`$${uniqueProduct.price}`).should('be.visible');
    });

    it('should display featured product on homepage', () => {
      // Customer visits homepage
      cy.visit('/');

      // Verify featured products section exists
      cy.contains(/featured products/i).should('be.visible');

      // Search for the featured product
      cy.get('[data-testid="featured-products"]').within(() => {
        cy.contains(uniqueProduct.name).should('be.visible');
      });
    });

    it('should allow customer to browse by category', () => {
      // Visit products page
      cy.visit('/products');

      // Filter by category (Action Figures)
      cy.get('button').contains(/categories/i).click();
      cy.contains('Action Figures').click();

      // Verify product appears in category filter
      cy.contains(uniqueProduct.name, { timeout: 10000 }).should('be.visible');
    });
  });

  after(() => {
    // Cleanup: Delete created product (optional, depends on test strategy)
    // This ensures tests don't leave data behind
    if (createdProductId) {
      cy.log(`Test product created with ID: ${createdProductId}`);
      // Uncomment to enable cleanup:
      // cy.request({
      //   method: 'DELETE',
      //   url: `/api/v1/admin/products/${createdProductId}`,
      //   headers: {
      //     Authorization: `Bearer ${adminToken}`
      //   }
      // });
    }
  });
});
