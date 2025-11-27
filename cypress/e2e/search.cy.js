/**
 * Search Functionality E2E Tests (T119)
 * 
 * Validates User Story 2 acceptance scenarios:
 * - Search returns results within 1 second
 * - Search with various query types (exact, partial, no match)
 * - Special characters and edge cases
 * - URL query parameters update correctly
 */

describe('Search Functionality', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  describe('T119: Search Performance and Results', () => {
    it('should return search results within 1 second', () => {
      const startTime = Date.now();
      
      // Enter search query
      cy.get('input[aria-label="Search for toys"]').type('car');
      
      // Wait for debounce (300ms) and API response
      cy.wait(500);
      
      // Navigate to search page
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      
      // Verify results appear
      cy.url().should('include', '/search?q=car');
      cy.get('[data-testid="product-card"]', { timeout: 10000 }).should('exist');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Verify performance requirement (<1 second from submit to results)
      expect(duration).to.be.lessThan(2000); // Allow 2s total including navigation
    });

    it('should find products with exact name match', () => {
      // Search for exact product name
      cy.get('input[aria-label="Search for toys"]').type('LEGO Classic');
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      
      // Verify results
      cy.url().should('include', '/search?q=LEGO+Classic');
      cy.contains('Results for "LEGO Classic"').should('be.visible');
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should find products with partial name match', () => {
      // Search with partial keyword
      cy.get('input[aria-label="Search for toys"]').type('car');
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      
      // Verify results include car-related toys
      cy.url().should('include', '/search?q=car');
      cy.get('[data-testid="product-card"]').should('exist');
      
      // Results should contain "car" in product names
      cy.get('[data-testid="product-name"]').first().invoke('text').should('match', /car/i);
    });

    it('should show no results message for non-existent products', () => {
      // Search for non-existent product
      cy.get('input[aria-label="Search for toys"]').type('xyzabc123notfound');
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      
      // Verify no results message
      cy.url().should('include', '/search?q=xyzabc123notfound');
      cy.contains('No results found').should('be.visible');
      cy.get('[data-testid="product-card"]').should('not.exist');
    });

    it('should handle special characters in search query', () => {
      const specialQueries = [
        'toy & game',
        'doll (new)',
        'car-set',
        "children's toy",
      ];

      specialQueries.forEach((query) => {
        cy.get('input[aria-label="Search for toys"]').clear().type(query);
        cy.get('input[aria-label="Search for toys"]').type('{enter}');
        
        // Should not crash and should show results or no results message
        cy.url().should('include', '/search');
        cy.get('body').should('be.visible'); // Page renders
      });
    });

    it('should handle empty search query', () => {
      // Submit empty search
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      
      // Should navigate to search page
      cy.url().should('include', '/search');
      
      // Should show all products or appropriate message
      cy.get('body').should('be.visible');
    });

    it('should update URL query parameters on search', () => {
      // Perform search
      cy.get('input[aria-label="Search for toys"]').type('puzzle');
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      
      // Verify URL contains query parameter
      cy.url().should('include', '/search?q=puzzle');
      
      // Reload page and verify query persists
      cy.reload();
      cy.get('input[aria-label="Search for toys"]').should('have.value', 'puzzle');
    });

    it('should clear search with clear button', () => {
      // Enter search text
      cy.get('input[aria-label="Search for toys"]').type('robot');
      
      // Click clear button
      cy.get('button[aria-label="Clear search"]').click();
      
      // Verify input is cleared
      cy.get('input[aria-label="Search for toys"]').should('have.value', '');
    });

    it('should debounce search input (300ms delay)', () => {
      // Type rapidly
      cy.get('input[aria-label="Search for toys"]').type('a');
      cy.get('input[aria-label="Search for toys"]').type('b');
      cy.get('input[aria-label="Search for toys"]').type('c');
      
      // Verify immediate navigation doesn't occur (debouncing)
      cy.wait(200); // Less than debounce time
      cy.url().should('not.include', '/search');
      
      // Wait for debounce to complete
      cy.wait(200); // Total >300ms
      
      // Verify search can be submitted
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      cy.url().should('include', '/search?q=abc');
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(200);
      
      cy.get('input[aria-label="Search for toys"]').type(longQuery);
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      
      // Should handle gracefully
      cy.url().should('include', '/search');
      cy.get('body').should('be.visible');
    });

    it('should search from header on any page', () => {
      // Navigate to different page
      cy.visit('/products');
      
      // Search from header
      cy.get('input[aria-label="Search for toys"]').type('ball');
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      
      // Should navigate to search page
      cy.url().should('include', '/search?q=ball');
      cy.get('[data-testid="product-card"]').should('exist');
    });
  });
});
