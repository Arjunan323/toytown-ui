/**
 * No Results Scenario E2E Tests (T122)
 * 
 * Validates no results handling:
 * - Search for non-existent toy name
 * - Helpful message displays
 * - Suggestions appear
 * - Clear filters and browse all buttons work
 */

describe('No Results Scenario', () => {
  describe('T122: No Results Tests', () => {
    it('should show helpful message when no results found', () => {
      // Search for non-existent product
      cy.visit('/search?q=nonexistentproduct12345xyz');
      cy.wait(1000);
      
      // Verify no results message
      cy.contains('No results found').should('be.visible');
      cy.contains(/couldn't find any products|no products match/i).should('be.visible');
      
      // Verify no product cards shown
      cy.get('[data-testid="product-card"]').should('not.exist');
    });

    it('should show category suggestions when no results', () => {
      // Search for non-existent product
      cy.visit('/search?q=impossibleproductname999');
      cy.wait(1000);
      
      // Verify suggestions section appears
      cy.contains(/suggestions|try these categories|popular categories/i).should('be.visible');
      
      // Verify suggestion links are present
      cy.get('a[href*="/category/"]').should('have.length.greaterThan', 0);
    });

    it('should show search tips when no results', () => {
      // Search for non-existent product
      cy.visit('/search?q=zzznonexistent');
      cy.wait(1000);
      
      // Verify search tips appear
      cy.contains(/try|tips|suggestions/i).should('be.visible');
      cy.contains(/spelling|keywords|filters/i).should('be.visible');
    });

    it('should have working clear filters button when no results', () => {
      // Apply filters and search
      cy.visit('/search?q=toy&minPrice=9999&maxPrice=10000');
      cy.wait(1000);
      
      // Verify no results
      cy.contains('No results found').should('be.visible');
      
      // Click clear filters button
      cy.contains(/clear filters|remove filters/i).click();
      cy.wait(1000);
      
      // Verify filters cleared from URL
      cy.url().should('not.include', 'minPrice');
      cy.url().should('not.include', 'maxPrice');
      
      // Verify results now shown
      cy.get('[data-testid="product-card"]').should('exist');
    });

    it('should have working browse all button when no results', () => {
      // Search for non-existent product
      cy.visit('/search?q=impossibleproduct');
      cy.wait(1000);
      
      // Verify no results
      cy.contains('No results found').should('be.visible');
      
      // Click browse all products button
      cy.contains(/browse all|view all products|shop all/i).click();
      
      // Verify navigated to products page
      cy.url().should('match', /\/products|\/category/);
      
      // Verify products shown
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should show different message for no results with filters vs without', () => {
      // No results without filters
      cy.visit('/search?q=nonexistentxyz123');
      cy.wait(1000);
      
      cy.contains('No results found').should('be.visible');
      cy.get('body').then(($body) => {
        const noFilterMessage = $body.text();
        
        // No results with filters
        cy.visit('/search?q=toy&minPrice=9999');
        cy.wait(1000);
        
        cy.contains('No results found').should('be.visible');
        cy.get('body').then(($bodyWithFilters) => {
          const withFilterMessage = $bodyWithFilters.text();
          
          // Messages should be different or filter message should suggest clearing
          expect(withFilterMessage).to.include(/clear|remove|adjust/i);
        });
      });
    });

    it('should track no-results searches in analytics', () => {
      // Clear analytics first
      cy.window().then((win) => {
        win.localStorage.removeItem('toytown_search_analytics');
      });
      
      // Search for non-existent product
      cy.visit('/search?q=trackthisnoResults123');
      cy.wait(1500); // Wait for analytics tracking
      
      // Verify analytics recorded
      cy.window().then((win) => {
        const analytics = JSON.parse(
          win.localStorage.getItem('toytown_search_analytics') || '{}'
        );
        
        expect(analytics.noResults).to.be.an('array');
        expect(analytics.noResults.length).to.be.greaterThan(0);
        
        const lastNoResult = analytics.noResults[analytics.noResults.length - 1];
        expect(lastNoResult.query).to.include('trackthisnoResults123'.toLowerCase());
      });
    });

    it('should allow new search from no results page', () => {
      // Search for non-existent product
      cy.visit('/search?q=nonexistent123');
      cy.wait(1000);
      
      // Verify no results
      cy.contains('No results found').should('be.visible');
      
      // Enter new search
      cy.get('input[aria-label="Search for toys"]').clear().type('car');
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      cy.wait(1000);
      
      // Verify results found
      cy.url().should('include', '/search?q=car');
      cy.get('[data-testid="product-card"]').should('exist');
      cy.contains('No results found').should('not.exist');
    });

    it('should show no results when all filters exclude all products', () => {
      // Apply extremely restrictive filters
      cy.visit('/search');
      cy.wait(1000);
      
      // Set impossible price range
      cy.contains('Price Range').click();
      cy.get('input[type="range"]').first().invoke('val', 9990).trigger('change');
      cy.get('input[type="range"]').last().invoke('val', 10000).trigger('change');
      cy.wait(1000);
      
      // Verify no results
      cy.contains('No results found').should('be.visible');
      
      // Verify clear filters suggestion
      cy.contains(/clear|adjust|remove/i).should('be.visible');
    });

    it('should provide helpful suggestions based on query', () => {
      // Search for a category name that doesn't exist
      cy.visit('/search?q=electronics');
      cy.wait(1000);
      
      // Should show toy-related category suggestions
      cy.contains(/suggestions|categories/i).should('be.visible');
      cy.contains(/action figures|dolls|games|puzzles/i).should('be.visible');
    });
  });
});
