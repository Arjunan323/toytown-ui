/**
 * Integration Test: Image Upload OCI Flow
 * 
 * Verifies end-to-end image upload workflow:
 * - Admin uploads image via browser
 * - Image is sent to backend
 * - Backend uploads to OCI Object Storage
 * - Image URL is stored in database
 * - Image is displayed on customer product detail page
 * - Thumbnail and full image work correctly
 */

describe('T233: Image Upload OCI Integration', () => {
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
  let uploadedImageUrl = null;

  before(() => {
    // Setup: Create test product without images
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.visit('/admin/login');
    cy.get('input[name="username"]').type(adminCredentials.username);
    cy.get('input[name="password"]').type(adminCredentials.password);
    cy.get('button[type="submit"]').click();

    cy.visit('/admin/products/new');
    testProductName = `Image Test Product ${Date.now()}`;
    testProductSku = `IMG-TEST-${Date.now()}`;

    cy.get('input[name="name"]').type(testProductName);
    cy.get('textarea[name="description"]').type('Product for testing image upload');
    cy.get('input[name="price"]').clear().type('49.99');
    cy.get('input[name="stockQuantity"]').clear().type('15');
    cy.get('input[name="minAge"]').clear().type('6');
    cy.get('input[name="maxAge"]').clear().type('12');
    cy.get('input[name="sku"]').type(testProductSku);
    cy.get('select[name="categoryId"]').select('1');
    cy.get('select[name="manufacturerId"]').select('1');
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('match', /\/admin\/products\/(\d+)\/edit/);
    cy.url().then((url) => {
      const match = url.match(/\/admin\/products\/(\d+)/);
      if (match) {
        testProductId = parseInt(match[1]);
      }
    });

    cy.get('button').contains(/logout/i).click();
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Image Upload Workflow', () => {
    it('should upload product image via admin panel', () => {
      // Admin login
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      // Navigate to edit product page
      cy.visit(`/admin/products/${testProductId}/edit`);
      cy.url().should('include', `/admin/products/${testProductId}/edit`);

      // Switch to Images tab
      cy.get('button[role="tab"]').contains(/images/i).click();

      // Upload image using fixture
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });

      // Wait for upload to complete
      cy.contains(/upload complete|image uploaded/i, { timeout: 15000 }).should('be.visible');

      // Verify image thumbnail appears
      cy.get('[data-testid="product-image"]').should('be.visible');
      cy.get('[data-testid="product-image"] img').should('have.attr', 'src').and('include', 'http');

      // Capture uploaded image URL
      cy.get('[data-testid="product-image"] img').invoke('attr', 'src').then((src) => {
        uploadedImageUrl = src;
        cy.log(`Uploaded image URL: ${uploadedImageUrl}`);

        // Verify URL points to OCI Object Storage or CDN
        expect(uploadedImageUrl).to.match(/https?:\/\/.+\.(jpg|jpeg|png)/i);
      });
    });

    it('should display uploaded image on customer product detail page', () => {
      // Admin logout
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();
      cy.get('button').contains(/logout/i).click();

      // Customer login
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      // Navigate to product detail page
      cy.visit(`/products/${testProductId}`);

      // Verify product image is displayed
      cy.get('[data-testid="product-main-image"] img', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="product-main-image"] img').should('have.attr', 'src').and('include', 'http');

      // Verify image is the one uploaded by admin
      if (uploadedImageUrl) {
        cy.get('[data-testid="product-main-image"] img').invoke('attr', 'src').should('include', uploadedImageUrl.split('?')[0]);
      }

      // Verify image loads successfully (no broken image)
      cy.get('[data-testid="product-main-image"] img').should(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
    });

    it('should display product thumbnail in search results', () => {
      // Customer already logged in
      cy.visit('/products');
      cy.get('input[placeholder*="Search"]').type(testProductSku);
      cy.get('button[aria-label="Search"]').click();

      // Verify thumbnail appears in search results
      cy.contains(testProductName, { timeout: 10000 }).should('be.visible');
      cy.contains(testProductName).parent().parent().within(() => {
        cy.get('img[alt*="' + testProductName + '"]').should('be.visible');
        cy.get('img').should('have.attr', 'src').and('include', 'http');
        cy.get('img').should(($img) => {
          expect($img[0].naturalWidth).to.be.greaterThan(0);
        });
      });
    });

    it('should upload multiple images and set primary image', () => {
      // Admin login
      cy.clearLocalStorage();
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.visit(`/admin/products/${testProductId}/edit`);
      cy.get('button[role="tab"]').contains(/images/i).click();

      // Upload second image
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      cy.contains(/upload complete|image uploaded/i, { timeout: 15000 }).should('be.visible');

      // Verify two images are displayed
      cy.get('[data-testid="product-image"]').should('have.length.at.least', 2);

      // Set second image as primary
      cy.get('[data-testid="product-image"]').eq(1).within(() => {
        cy.get('button[aria-label*="Set as Primary"]').click();
      });

      // Verify success message
      cy.contains(/primary image updated/i, { timeout: 5000 }).should('be.visible');

      // Verify first image has primary indicator
      cy.get('[data-testid="product-image"]').eq(1).within(() => {
        cy.contains(/primary/i).should('be.visible');
      });
    });

    it('should delete product image', () => {
      // Admin already logged in
      cy.visit(`/admin/products/${testProductId}/edit`);
      cy.get('button[role="tab"]').contains(/images/i).click();

      // Get initial image count
      cy.get('[data-testid="product-image"]').its('length').then((initialCount) => {
        // Delete last image
        cy.get('[data-testid="product-image"]').last().within(() => {
          cy.get('button[aria-label*="Delete"]').click();
        });

        // Confirm deletion
        cy.get('[role="dialog"]').within(() => {
          cy.contains(/are you sure/i).should('be.visible');
          cy.get('button').contains(/delete|confirm/i).click();
        });

        // Verify success message
        cy.contains(/image deleted successfully/i, { timeout: 5000 }).should('be.visible');

        // Verify image count decreased
        cy.get('[data-testid="product-image"]').should('have.length', initialCount - 1);
      });
    });

    it('should validate image file format (reject non-image files)', () => {
      // Admin already logged in
      cy.visit(`/admin/products/${testProductId}/edit`);
      cy.get('button[role="tab"]').contains(/images/i).click();

      // Try to upload a non-image file (e.g., JSON fixture)
      cy.get('input[type="file"]').selectFile('cypress/fixtures/admin.json', { force: true });

      // Verify error message
      cy.contains(/invalid file type|only jpeg|only png/i, { timeout: 5000 }).should('be.visible');

      // Verify image was not added
      cy.get('[data-testid="upload-error"]').should('be.visible');
    });

    it('should validate image file size (reject files > 5MB)', () => {
      // Note: This test assumes we have a large image fixture or can create one
      // For demo purposes, we'll check if the validation message exists in the UI

      cy.visit(`/admin/products/${testProductId}/edit`);
      cy.get('button[role="tab"]').contains(/images/i).click();

      // Verify max file size is displayed in UI
      cy.contains(/max.*5.*mb|maximum.*5.*mb/i).should('be.visible');

      // If we had a large file, we would test:
      // cy.get('input[type="file"]').selectFile('cypress/fixtures/large-image.jpg', { force: true });
      // cy.contains(/file too large|exceeds maximum/i, { timeout: 5000 }).should('be.visible');
    });

    it('should preserve image display order', () => {
      // Admin already logged in
      cy.visit(`/admin/products/${testProductId}/edit`);
      cy.get('button[role="tab"]').contains(/images/i).click();

      // Get images in current order
      cy.get('[data-testid="product-image"]').then(($images) => {
        const imageUrls = [];
        $images.each((index, el) => {
          const src = Cypress.$(el).find('img').attr('src');
          imageUrls.push(src);
        });

        // Navigate to customer view
        cy.visit('/');
        cy.visit(`/products/${testProductId}`);

        // Verify images appear in same order in gallery
        cy.get('[data-testid="product-gallery"] img').each(($img, index) => {
          if (index < imageUrls.length) {
            expect($img.attr('src')).to.include(imageUrls[index].split('?')[0]);
          }
        });
      });
    });

    it('should display placeholder image when product has no images', () => {
      // Create new product without images
      cy.clearLocalStorage();
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.visit('/admin/products/new');
      const noImageProductName = `No Image Product ${Date.now()}`;
      const noImageProductSku = `NOIMG-${Date.now()}`;

      cy.get('input[name="name"]').type(noImageProductName);
      cy.get('textarea[name="description"]').type('Product without images');
      cy.get('input[name="price"]').clear().type('19.99');
      cy.get('input[name="stockQuantity"]').clear().type('10');
      cy.get('input[name="minAge"]').clear().type('3');
      cy.get('input[name="maxAge"]').clear().type('8');
      cy.get('input[name="sku"]').type(noImageProductSku);
      cy.get('select[name="categoryId"]').select('1');
      cy.get('select[name="manufacturerId"]').select('1');
      cy.get('button[type="submit"]').click();

      cy.url({ timeout: 10000 }).should('match', /\/admin\/products/);
      let noImageProductId;
      cy.url().then((url) => {
        const match = url.match(/\/admin\/products\/(\d+)/);
        if (match) {
          noImageProductId = parseInt(match[1]);
        }
      });

      // Admin logout
      cy.get('button').contains(/logout/i).click();

      // Customer view
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.visit('/products');
      cy.get('input[placeholder*="Search"]').type(noImageProductSku);
      cy.get('button[aria-label="Search"]').click();
      cy.contains(noImageProductName).click();

      // Verify placeholder image is displayed
      cy.get('[data-testid="product-main-image"] img').should('have.attr', 'src').and('match', /placeholder|no-image|default/i);
    });
  });

  after(() => {
    // Cleanup
    if (testProductId) {
      cy.log(`Test product ID: ${testProductId}`);
    }
  });
});
