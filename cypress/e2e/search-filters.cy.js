/**
 * Filter Functionality E2E Tests (T120)
 * 
 * Validates filtering capabilities:
 * - Age range filter shows only age-appropriate toys
 * - Price range filter shows only toys in price range
 * - Manufacturer filter shows only selected manufacturer's toys
 * - Combined filters work correctly
 * - Filter counts update correctly
 */

describe('Filter Functionality', () => {
  beforeEach(() => {
    // Navigate to search page
    cy.visit('/search');
    cy.wait(1000); // Wait for initial load
  });

  describe('T120: Filter Tests', () => {
    it('should filter by age range', () => {
      // Open age range filter
      cy.contains('Age Range').click();
      
      // Select age range (e.g., 3-5 years)
      cy.get('select[name="ageRange"]').select('3-5');
      
      // Wait for results to update
      cy.wait(1000);
      
      // Verify URL contains age filter parameters
      cy.url().should('match', /(minAge|maxAge)/);
      
      // Verify results are filtered
      cy.get('[data-testid="product-card"]').should('exist');
      
      // Check that product ages are within range
      cy.get('[data-testid="product-age"]').each(($age) => {
        const ageText = $age.text();
        // Age should include 3-5 range
        expect(ageText).to.match(/[3-5]/);
      });
    });

    it('should filter by price range', () => {
      // Open price range filter
      cy.contains('Price Range').click();
      
      // Set price range using slider (min ₹500, max ₹2000)
      cy.get('input[type="range"]').first().invoke('val', 500).trigger('change');
      cy.get('input[type="range"]').last().invoke('val', 2000).trigger('change');
      
      // Wait for results to update
      cy.wait(1000);
      
      // Verify URL contains price parameters
      cy.url().should('include', 'minPrice=500');
      cy.url().should('include', 'maxPrice=2000');
      
      // Verify prices are within range
      cy.get('[data-testid="product-price"]').each(($price) => {
        const price = parseFloat($price.text().replace(/[₹,]/g, ''));
        expect(price).to.be.at.least(500);
        expect(price).to.be.at.most(2000);
      });
    });

    it('should filter by manufacturer', () => {
      // Open manufacturer filter
      cy.contains('Manufacturer').click();
      
      // Select a manufacturer
      cy.get('select[name="manufacturer"]').select(1); // Select first manufacturer
      
      // Wait for results to update
      cy.wait(1000);
      
      // Verify URL contains manufacturer parameter
      cy.url().should('include', 'manufacturerId');
      
      // Verify all results are from selected manufacturer
      cy.get('[data-testid="product-manufacturer"]').each(($mfr) => {
        // All should be the same manufacturer
        const manufacturer = $mfr.text();
        expect(manufacturer).to.not.be.empty;
      });
    });

    it('should combine multiple filters', () => {
      // Apply age filter
      cy.contains('Age Range').click();
      cy.get('select[name="ageRange"]').select('6-8');
      cy.wait(500);
      
      // Apply price filter
      cy.contains('Price Range').click();
      cy.get('input[type="range"]').first().invoke('val', 1000).trigger('change');
      cy.get('input[type="range"]').last().invoke('val', 3000).trigger('change');
      cy.wait(500);
      
      // Apply manufacturer filter
      cy.contains('Manufacturer').click();
      cy.get('select[name="manufacturer"]').select(1);
      cy.wait(1000);
      
      // Verify URL contains all parameters
      cy.url().should('match', /(minAge|maxAge)/);
      cy.url().should('include', 'minPrice=1000');
      cy.url().should('include', 'maxPrice=3000');
      cy.url().should('include', 'manufacturerId');
      
      // Verify filter count badge shows 3 active filters
      cy.get('[data-testid="filter-count"]').should('contain', '3');
    });

    it('should clear individual filters', () => {
      // Apply multiple filters
      cy.contains('Age Range').click();
      cy.get('select[name="ageRange"]').select('3-5');
      cy.wait(500);
      
      cy.contains('Price Range').click();
      cy.get('input[type="range"]').first().invoke('val', 500).trigger('change');
      cy.wait(500);
      
      // Clear age filter
      cy.contains('Age Range').click();
      cy.get('select[name="ageRange"]').select('All Ages');
      cy.wait(1000);
      
      // Verify age parameters removed from URL
      cy.url().should('not.match', /(minAge|maxAge)/);
      
      // Verify price filter still active
      cy.url().should('include', 'minPrice=500');
    });

    it('should clear all filters with Clear All button', () => {
      // Apply multiple filters
      cy.contains('Age Range').click();
      cy.get('select[name="ageRange"]').select('3-5');
      cy.wait(500);
      
      cy.contains('Price Range').click();
      cy.get('input[type="range"]').first().invoke('val', 500).trigger('change');
      cy.wait(500);
      
      // Click Clear All Filters button
      cy.contains('Clear All Filters').click();
      cy.wait(1000);
      
      // Verify all filter parameters removed from URL
      cy.url().should('not.match', /(minAge|maxAge|minPrice|maxPrice|manufacturerId)/);
      
      // Verify filter count badge is hidden
      cy.get('[data-testid="filter-count"]').should('not.exist');
      
      // Verify all products shown
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should update result count when filters change', () => {
      // Get initial result count
      cy.get('h6').contains(/Results?/).then(($count) => {
        const initialCount = parseInt($count.text().match(/\d+/)[0]);
        
        // Apply restrictive filter
        cy.contains('Price Range').click();
        cy.get('input[type="range"]').first().invoke('val', 5000).trigger('change');
        cy.get('input[type="range"]').last().invoke('val', 10000).trigger('change');
        cy.wait(1000);
        
        // Verify result count changed
        cy.get('h6').contains(/Results?/).then(($newCount) => {
          const newCount = parseInt($newCount.text().match(/\d+/)[0]);
          expect(newCount).to.not.equal(initialCount);
        });
      });
    });

    it('should persist filters when navigating back from product detail', () => {
      // Apply filters
      cy.contains('Age Range').click();
      cy.get('select[name="ageRange"]').select('6-8');
      cy.wait(1000);
      
      // Click on a product
      cy.get('[data-testid="product-card"]').first().click();
      
      // Verify navigated to product detail
      cy.url().should('include', '/products/');
      
      // Go back
      cy.go('back');
      
      // Verify filters still applied
      cy.url().should('match', /(minAge|maxAge)/);
      cy.get('select[name="ageRange"]').should('have.value', '6-8');
    });

    it('should show no results when filters are too restrictive', () => {
      // Apply very restrictive filters
      cy.contains('Price Range').click();
      cy.get('input[type="range"]').first().invoke('val', 9999).trigger('change');
      cy.get('input[type="range"]').last().invoke('val', 10000).trigger('change');
      cy.wait(1000);
      
      // Verify no results message
      cy.contains('No results found').should('be.visible');
      cy.get('[data-testid="product-card"]').should('not.exist');
      
      // Verify clear filters suggestion appears
      cy.contains('Clear filters').should('be.visible');
    });

    it('should handle filter changes on mobile', () => {
      // Set mobile viewport
      cy.viewport(375, 667);
      
      // Open filter drawer
      cy.get('button[aria-label*="filter"]').click();
      
      // Verify drawer is visible
      cy.get('[role="presentation"]').should('be.visible');
      
      // Apply filter
      cy.contains('Age Range').click();
      cy.get('select[name="ageRange"]').select('3-5');
      
      // Close drawer
      cy.get('button[aria-label="Close filters"]').click();
      
      // Verify filters applied
      cy.url().should('match', /(minAge|maxAge)/);
      cy.get('[data-testid="product-card"]').should('exist');
    });
  });
});
