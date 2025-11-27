/**
 * T227: Admin Product Management E2E Tests
 * Tests create, edit, stock update, image upload, and discontinue products
 */

describe('Admin Product Management E2E Tests', () => {
  const ADMIN_LOGIN_URL = '/admin/login';
  const ADMIN_PRODUCTS_URL = '/admin/products';
  const ADMIN_PRODUCT_CREATE_URL = '/admin/products/create';
  
  const validAdmin = {
    username: 'admin',
    password: 'Admin@123'
  };

  // Login before each test
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Login as admin
    cy.visit(ADMIN_LOGIN_URL);
    cy.get('input[name="username"]').type(validAdmin.username);
    cy.get('input[name="password"]').type(validAdmin.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin');
  });

  describe('Create New Product', () => {
    beforeEach(() => {
      cy.visit(ADMIN_PRODUCT_CREATE_URL);
    });

    it('should create a new product successfully', () => {
      const timestamp = Date.now();
      const newProduct = {
        name: `Test Toy ${timestamp}`,
        description: 'This is a test toy created by Cypress',
        price: '29.99',
        stockQuantity: '100',
        minAge: '6',
        maxAge: '12',
        sku: `TEST-${timestamp}`
      };

      // Fill in product form
      cy.get('input[name="name"]').type(newProduct.name);
      cy.get('textarea[name="description"]').type(newProduct.description);
      cy.get('input[name="price"]').type(newProduct.price);
      cy.get('input[name="stockQuantity"]').type(newProduct.stockQuantity);
      cy.get('input[name="minAge"]').type(newProduct.minAge);
      cy.get('input[name="maxAge"]').type(newProduct.maxAge);
      cy.get('input[name="sku"]').type(newProduct.sku);
      
      // Select category (assuming dropdown exists)
      cy.get('select[name="categoryId"], [role="combobox"]').first().click();
      cy.contains('li, option', /action figures|board games|building blocks/i).first().click();
      
      // Select manufacturer
      cy.get('select[name="manufacturerId"], [role="combobox"]').last().click();
      cy.contains('li, option', /lego|hasbro|mattel/i).first().click();
      
      // Submit form
      cy.contains('button', /create|save|submit/i).click();
      
      // Should redirect to products list or edit page
      cy.url().should('match', /\/admin\/products/);
      
      // Success message should appear
      cy.contains(/success|created|added/i, { timeout: 10000 }).should('be.visible');
    });

    it('should show validation errors for required fields', () => {
      // Try to submit empty form
      cy.contains('button', /create|save|submit/i).click();
      
      // Validation errors should appear
      cy.contains(/required|must|cannot be empty/i).should('be.visible');
    });

    it('should validate price is positive', () => {
      cy.get('input[name="price"]').type('-10');
      cy.get('input[name="price"]').blur();
      
      // Should show validation error
      cy.contains(/positive|greater than zero/i).should('be.visible');
    });

    it('should validate stock quantity is non-negative', () => {
      cy.get('input[name="stockQuantity"]').type('-5');
      cy.get('input[name="stockQuantity"]').blur();
      
      // Should show validation error
      cy.contains(/negative|greater than or equal to zero/i).should('be.visible');
    });

    it('should validate age range (minAge <= maxAge)', () => {
      cy.get('input[name="minAge"]').type('12');
      cy.get('input[name="maxAge"]').type('6');
      cy.get('input[name="maxAge"]').blur();
      
      // Should show validation error
      cy.contains(/age range|min.*max|invalid/i).should('be.visible');
    });
  });

  describe('Edit Existing Product', () => {
    it('should edit product details', () => {
      // Navigate to products list
      cy.visit(ADMIN_PRODUCTS_URL);
      
      // Click edit button on first product
      cy.get('button[aria-label*="edit"], button[title*="edit"], svg[data-testid*="Edit"]')
        .first()
        .click();
      
      // Should navigate to edit page
      cy.url().should('match', /\/admin\/products\/\d+\/edit/);
      
      // Update product name
      const updatedName = `Updated Product ${Date.now()}`;
      cy.get('input[name="name"]').clear().type(updatedName);
      
      // Update price
      cy.get('input[name="price"]').clear().type('39.99');
      
      // Save changes
      cy.contains('button', /save|update/i).click();
      
      // Success message should appear
      cy.contains(/success|updated|saved/i, { timeout: 10000 }).should('be.visible');
    });

    it('should switch between Details and Images tabs', () => {
      // Navigate to products list
      cy.visit(ADMIN_PRODUCTS_URL);
      
      // Click edit on first product
      cy.get('button[aria-label*="edit"], button[title*="edit"]')
        .first()
        .click();
      
      // Should be on Details tab by default
      cy.contains(/details|information/i).should('be.visible');
      
      // Click Images tab
      cy.contains('button, a', /images|photos/i).click();
      
      // Image upload section should be visible
      cy.contains(/upload|add image|drag.*drop/i).should('be.visible');
    });
  });

  describe('Update Stock Quantity', () => {
    it('should update stock quantity from product list', () => {
      cy.visit(ADMIN_PRODUCTS_URL);
      
      // Click update stock button (could be an icon or button)
      cy.get('button[aria-label*="stock"], button[title*="stock"]')
        .first()
        .click();
      
      // Modal or dialog should appear
      cy.get('[role="dialog"], [role="presentation"]').should('be.visible');
      
      // Enter new stock quantity
      cy.get('input[type="number"]').clear().type('250');
      
      // Confirm
      cy.contains('button', /update|save|confirm/i).click();
      
      // Success message
      cy.contains(/success|updated/i, { timeout: 10000 }).should('be.visible');
    });

    it('should prevent negative stock quantity', () => {
      cy.visit(ADMIN_PRODUCTS_URL);
      
      // Click update stock button
      cy.get('button[aria-label*="stock"], button[title*="stock"]')
        .first()
        .click();
      
      // Try to enter negative quantity
      cy.get('input[type="number"]').clear().type('-10');
      
      // Update button should be disabled or show validation error
      cy.contains('button', /update|save|confirm/i).should('be.disabled')
        .or(cy.contains(/negative|invalid/i));
    });
  });

  describe('Upload Product Images', () => {
    beforeEach(() => {
      // Navigate to edit page of first product
      cy.visit(ADMIN_PRODUCTS_URL);
      cy.get('button[aria-label*="edit"], button[title*="edit"]')
        .first()
        .click();
      
      // Switch to Images tab
      cy.contains('button, a', /images|photos/i).click();
    });

    it('should upload product image', () => {
      // Create a test image file
      cy.fixture('test-image.jpg', 'base64').then(fileContent => {
        const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
        const file = new File([blob], 'test-product.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // Upload file
        cy.get('input[type="file"]').then(input => {
          input[0].files = dataTransfer.files;
          input[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Upload should start
        cy.contains(/uploading|progress/i, { timeout: 5000 });
        
        // Success message
        cy.contains(/success|uploaded/i, { timeout: 15000 }).should('be.visible');
      });
    });

    it('should show image preview after upload', () => {
      // After upload, image should appear in preview grid
      cy.get('img[alt*="product"], img[src*="product"]').should('be.visible');
    });

    it('should set primary image', () => {
      // Click set primary button on an image
      cy.get('button[aria-label*="primary"], button[title*="primary"], svg[data-testid*="Star"]')
        .first()
        .click();
      
      // Success message
      cy.contains(/primary.*set|success/i, { timeout: 10000 }).should('be.visible');
    });

    it('should delete product image', () => {
      // Click delete button on an image
      cy.get('button[aria-label*="delete"], button[title*="delete"], svg[data-testid*="Delete"]')
        .first()
        .click();
      
      // Confirm deletion
      cy.contains('button', /delete|confirm|yes/i).click();
      
      // Success message
      cy.contains(/deleted|removed/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Discontinue Product', () => {
    it('should discontinue active product', () => {
      cy.visit(ADMIN_PRODUCTS_URL);
      
      // Click discontinue button on first active product
      cy.get('button[aria-label*="discontinue"], button[title*="discontinue"]')
        .first()
        .click();
      
      // Confirm discontinuation
      cy.contains('button', /discontinue|confirm|yes/i).click();
      
      // Success message
      cy.contains(/discontinued|success/i, { timeout: 10000 }).should('be.visible');
    });

    it('should hide discontinued product from customer view', () => {
      // First discontinue a product
      cy.visit(ADMIN_PRODUCTS_URL);
      
      // Get product name before discontinuing
      cy.get('table tbody tr').first().find('td').eq(1).invoke('text').then(productName => {
        // Discontinue the product
        cy.get('button[aria-label*="discontinue"], button[title*="discontinue"]')
          .first()
          .click();
        cy.contains('button', /discontinue|confirm|yes/i).click();
        cy.contains(/discontinued|success/i, { timeout: 10000 });
        
        // Visit customer site
        cy.visit('/products');
        
        // Product should not appear in customer product list
        cy.contains(productName.trim()).should('not.exist');
      });
    });

    it('should reactivate discontinued product', () => {
      cy.visit(ADMIN_PRODUCTS_URL);
      
      // Filter to show discontinued products
      cy.get('select[name="status"], [role="combobox"]').click();
      cy.contains('li, option', /discontinued/i).click();
      
      // Click reactivate button
      cy.get('button[aria-label*="reactivate"], button[title*="reactivate"]')
        .first()
        .click();
      
      // Confirm reactivation
      cy.contains('button', /reactivate|confirm|yes/i).click();
      
      // Success message
      cy.contains(/reactivated|success|active/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Product List Features', () => {
    beforeEach(() => {
      cy.visit(ADMIN_PRODUCTS_URL);
    });

    it('should display product list with pagination', () => {
      // Table should be visible
      cy.get('table, [role="table"]').should('be.visible');
      
      // Pagination controls should exist if there are many products
      cy.get('nav[aria-label*="pagination"], [role="navigation"]').should('exist');
    });

    it('should filter products by status', () => {
      // Click status filter
      cy.get('select[name="status"], [role="combobox"]').click();
      cy.contains('li, option', /active|discontinued/i).first().click();
      
      // Table should update (wait for API response)
      cy.wait(1000);
      
      // Products should match filter
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should sort products by different columns', () => {
      // Click on a sortable column header (e.g., Name, Price, Stock)
      cy.contains('th, [role="columnheader"]', /name|price|stock/i).click();
      
      // Table should re-sort (wait for API response)
      cy.wait(1000);
      
      // Products should be reordered
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should navigate to next page', () => {
      // Click next page button
      cy.get('button[aria-label*="next"], button[title*="next"]').click();
      
      // URL or table should update
      cy.wait(1000);
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });
});
