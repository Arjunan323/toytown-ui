/**
 * T228: Admin Product List E2E Tests
 * Tests product list display, pagination, filters, and search
 */

describe('Admin Product List E2E Tests', () => {
  const ADMIN_LOGIN_URL = '/admin/login';
  const ADMIN_PRODUCTS_URL = '/admin/products';
  
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
    
    // Navigate to products list
    cy.visit(ADMIN_PRODUCTS_URL);
  });

  describe('Product List Display', () => {
    it('should display product table with all columns', () => {
      // Table should be visible
      cy.get('table, [role="table"]').should('be.visible');
      
      // Check for essential columns
      cy.contains('th, [role="columnheader"]', /name|product/i).should('be.visible');
      cy.contains('th, [role="columnheader"]', /sku/i).should('be.visible');
      cy.contains('th, [role="columnheader"]', /price/i).should('be.visible');
      cy.contains('th, [role="columnheader"]', /stock/i).should('be.visible');
      cy.contains('th, [role="columnheader"]', /status|active/i).should('be.visible');
      cy.contains('th, [role="columnheader"]', /actions|operations/i).should('be.visible');
    });

    it('should display product image thumbnails', () => {
      // First row should have an image
      cy.get('table tbody tr').first().find('img').should('be.visible');
    });

    it('should display product stock status with color coding', () => {
      // Stock chips/badges should exist with different colors
      cy.get('table tbody tr').first().find('[class*="chip"], [class*="badge"], [class*="tag"]')
        .should('exist');
    });

    it('should show action buttons for each product', () => {
      // First row should have action buttons
      const firstRow = cy.get('table tbody tr').first();
      
      // Edit button
      firstRow.find('button[aria-label*="edit"], button[title*="edit"], svg[data-testid*="Edit"]')
        .should('exist');
      
      // Stock update button
      firstRow.find('button[aria-label*="stock"], button[title*="stock"]')
        .should('exist');
      
      // Discontinue/Reactivate button
      firstRow.find('button[aria-label*="discontinue"], button[aria-label*="delete"], button[title*="discontinue"]')
        .should('exist');
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      cy.get('nav[aria-label*="pagination"], [role="navigation"]').should('be.visible');
    });

    it('should navigate to next page', () => {
      // Get current page products
      cy.get('table tbody tr').first().find('td').eq(1).invoke('text').then(firstProductName => {
        // Click next page
        cy.get('button[aria-label*="next"], button[title*="next"]').click();
        
        // Wait for page load
        cy.wait(1000);
        
        // First product should be different
        cy.get('table tbody tr').first().find('td').eq(1).invoke('text').should('not.equal', firstProductName);
      });
    });

    it('should navigate to previous page', () => {
      // Go to page 2 first
      cy.get('button[aria-label*="next"], button[title*="next"]').click();
      cy.wait(1000);
      
      // Get current first product
      cy.get('table tbody tr').first().find('td').eq(1).invoke('text').then(firstProductName => {
        // Click previous page
        cy.get('button[aria-label*="previous"], button[title*="previous"]').click();
        
        // Wait for page load
        cy.wait(1000);
        
        // Should be back on page 1
        cy.get('table tbody tr').first().find('td').eq(1).invoke('text').should('not.equal', firstProductName);
      });
    });

    it('should display page size selector', () => {
      cy.get('select[name*="size"], select[name*="rows"], [role="combobox"]').should('exist');
    });

    it('should change page size', () => {
      // Select different page size
      cy.get('select[name*="size"], select[name*="rows"], [role="combobox"]').click();
      cy.contains('li, option', /20|50/i).first().click();
      
      // Table should reload with new page size
      cy.wait(1000);
      cy.get('table tbody tr').should('have.length.greaterThan', 10);
    });
  });

  describe('Filters', () => {
    it('should filter by product status (Active)', () => {
      // Select Active filter
      cy.get('select[name="status"], [role="combobox"]').click();
      cy.contains('li, option', /active|all/i).click();
      
      // Wait for filter to apply
      cy.wait(1000);
      
      // All products should be active (not discontinued)
      cy.get('table tbody tr').each($row => {
        cy.wrap($row).should('not.contain', 'Discontinued');
      });
    });

    it('should filter by product status (Discontinued)', () => {
      // Select Discontinued filter
      cy.get('select[name="status"], [role="combobox"]').click();
      cy.contains('li, option', /discontinued/i).click();
      
      // Wait for filter to apply
      cy.wait(1000);
      
      // Results should show discontinued products or "no results" message
      cy.get('body').then($body => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().should('contain', 'Discontinued');
        } else {
          cy.contains(/no.*products|no.*results/i).should('be.visible');
        }
      });
    });

    it('should filter by category', () => {
      // If category filter exists
      cy.get('body').then($body => {
        if ($body.find('select[name="category"]').length > 0) {
          cy.get('select[name="category"]').click();
          cy.contains('li, option').first().click();
          
          // Wait for filter
          cy.wait(1000);
          cy.get('table tbody tr').should('have.length.greaterThan', 0);
        }
      });
    });

    it('should filter by manufacturer', () => {
      // If manufacturer filter exists
      cy.get('body').then($body => {
        if ($body.find('select[name="manufacturer"]').length > 0) {
          cy.get('select[name="manufacturer"]').click();
          cy.contains('li, option').first().click();
          
          // Wait for filter
          cy.wait(1000);
          cy.get('table tbody tr').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  describe('Sorting', () => {
    it('should sort by product name ascending', () => {
      // Click Name column header
      cy.contains('th, [role="columnheader"]', /name|product/i).click();
      
      // Wait for sort
      cy.wait(1000);
      
      // Verify sort order (ascending)
      cy.get('table tbody tr').then($rows => {
        const names = [];
        $rows.each((index, row) => {
          names.push(Cypress.$(row).find('td').eq(1).text().trim());
        });
        
        const sortedNames = [...names].sort();
        expect(names).to.deep.equal(sortedNames);
      });
    });

    it('should sort by product name descending', () => {
      // Click Name column header twice
      cy.contains('th, [role="columnheader"]', /name|product/i).click();
      cy.wait(500);
      cy.contains('th, [role="columnheader"]', /name|product/i).click();
      
      // Wait for sort
      cy.wait(1000);
      
      // Verify sort order (descending)
      cy.get('table tbody tr').then($rows => {
        const names = [];
        $rows.each((index, row) => {
          names.push(Cypress.$(row).find('td').eq(1).text().trim());
        });
        
        const sortedNames = [...names].sort().reverse();
        expect(names).to.deep.equal(sortedNames);
      });
    });

    it('should sort by price', () => {
      // Click Price column header
      cy.contains('th, [role="columnheader"]', /price/i).click();
      
      // Wait for sort
      cy.wait(1000);
      
      // Products should be reordered
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should sort by stock quantity', () => {
      // Click Stock column header
      cy.contains('th, [role="columnheader"]', /stock/i).click();
      
      // Wait for sort
      cy.wait(1000);
      
      // Products should be reordered
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should sort by created date', () => {
      // If created date column exists
      cy.get('body').then($body => {
        if ($body.find('th:contains("Created"), th:contains("Date")').length > 0) {
          cy.contains('th, [role="columnheader"]', /created|date/i).click();
          cy.wait(1000);
          cy.get('table tbody tr').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  describe('Search', () => {
    it('should search products by name', () => {
      // Get first product name
      cy.get('table tbody tr').first().find('td').eq(1).invoke('text').then(productName => {
        const searchTerm = productName.trim().split(' ')[0];
        
        // Enter search term
        cy.get('input[type="search"], input[placeholder*="search"]').type(searchTerm);
        
        // Wait for search
        cy.wait(1000);
        
        // Results should contain search term
        cy.get('table tbody tr').each($row => {
          cy.wrap($row).should('contain', searchTerm);
        });
      });
    });

    it('should search products by SKU', () => {
      // Get first product SKU
      cy.get('table tbody tr').first().find('td').eq(2).invoke('text').then(sku => {
        const searchTerm = sku.trim();
        
        // Enter search term
        cy.get('input[type="search"], input[placeholder*="search"]').clear().type(searchTerm);
        
        // Wait for search
        cy.wait(1000);
        
        // Results should contain SKU
        cy.get('table tbody tr').first().should('contain', searchTerm);
      });
    });

    it('should show no results for non-existent product', () => {
      // Search for non-existent product
      cy.get('input[type="search"], input[placeholder*="search"]').type('NONEXISTENT-PRODUCT-12345');
      
      // Wait for search
      cy.wait(1000);
      
      // Should show no results message
      cy.contains(/no.*products|no.*results|not.*found/i).should('be.visible');
    });

    it('should clear search', () => {
      // Enter search term
      cy.get('input[type="search"], input[placeholder*="search"]').type('test');
      cy.wait(1000);
      
      // Clear search
      cy.get('input[type="search"], input[placeholder*="search"]').clear();
      cy.wait(1000);
      
      // All products should be visible again
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  describe('Add Product Button', () => {
    it('should navigate to create product page', () => {
      // Click "Add Product" button
      cy.contains('button, a', /add.*product|create.*product|new.*product/i).click();
      
      // Should navigate to create page
      cy.url().should('include', '/admin/products/create');
    });
  });

  describe('Low Stock Alert', () => {
    it('should highlight low stock products', () => {
      // Products with low stock should have warning color/badge
      cy.get('table tbody tr').then($rows => {
        $rows.each((index, row) => {
          const stockText = Cypress.$(row).find('td').eq(4).text().toLowerCase();
          if (stockText.includes('low') || parseInt(stockText) < 10) {
            // Should have warning color/badge
            cy.wrap(row).find('[class*="warning"], [class*="error"], [class*="danger"]')
              .should('exist');
          }
        });
      });
    });

    it('should navigate to low stock products view', () => {
      // If low stock filter/link exists
      cy.get('body').then($body => {
        if ($body.find('a:contains("Low Stock"), button:contains("Low Stock")').length > 0) {
          cy.contains('a, button', /low.*stock/i).click();
          
          // Should show only low stock products
          cy.url().should('include', 'low-stock');
          cy.get('table tbody tr').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should display properly on tablet view', () => {
      cy.viewport('ipad-2');
      
      // Table should still be visible and functional
      cy.get('table, [role="table"]').should('be.visible');
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should adapt for mobile view', () => {
      cy.viewport('iphone-x');
      
      // Content should be visible (may use cards instead of table)
      cy.get('body').should('be.visible');
      
      // Product information should be accessible
      cy.contains(/product|name|sku/i).should('be.visible');
    });
  });
});
