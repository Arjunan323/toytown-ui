/**
 * Sort Functionality E2E Tests (T121)
 * 
 * Validates sorting capabilities:
 * - Sort by price (low to high, high to low)
 * - Sort by name (A-Z)
 * - Sort by newest first
 * - Sort persists across pagination
 */

describe('Sort Functionality', () => {
  beforeEach(() => {
    // Navigate to search page with query to get results
    cy.visit('/search?q=toy');
    cy.wait(1000); // Wait for initial load
  });

  describe('T121: Sort Tests', () => {
    it('should sort by price low to high', () => {
      // Open sort dropdown
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Price: Low to High');
      cy.wait(1000);
      
      // Verify URL contains sort parameters
      cy.url().should('include', 'sortBy=price');
      cy.url().should('include', 'sortDirection=asc');
      
      // Verify products are sorted by price ascending
      cy.get('[data-testid="product-price"]').then(($prices) => {
        const prices = $prices.toArray().map((el) => 
          parseFloat(el.innerText.replace(/[₹,]/g, ''))
        );
        
        // Check if sorted ascending
        for (let i = 0; i < prices.length - 1; i++) {
          expect(prices[i]).to.be.at.most(prices[i + 1]);
        }
      });
    });

    it('should sort by price high to low', () => {
      // Open sort dropdown
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Price: High to Low');
      cy.wait(1000);
      
      // Verify URL contains sort parameters
      cy.url().should('include', 'sortBy=price');
      cy.url().should('include', 'sortDirection=desc');
      
      // Verify products are sorted by price descending
      cy.get('[data-testid="product-price"]').then(($prices) => {
        const prices = $prices.toArray().map((el) => 
          parseFloat(el.innerText.replace(/[₹,]/g, ''))
        );
        
        // Check if sorted descending
        for (let i = 0; i < prices.length - 1; i++) {
          expect(prices[i]).to.be.at.least(prices[i + 1]);
        }
      });
    });

    it('should sort by name A-Z', () => {
      // Open sort dropdown
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Name: A-Z');
      cy.wait(1000);
      
      // Verify URL contains sort parameters
      cy.url().should('include', 'sortBy=name');
      cy.url().should('include', 'sortDirection=asc');
      
      // Verify products are sorted alphabetically
      cy.get('[data-testid="product-name"]').then(($names) => {
        const names = $names.toArray().map((el) => el.innerText.toLowerCase());
        
        // Check if sorted alphabetically
        for (let i = 0; i < names.length - 1; i++) {
          expect(names[i].localeCompare(names[i + 1])).to.be.at.most(0);
        }
      });
    });

    it('should sort by newest first', () => {
      // Open sort dropdown
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Newest First');
      cy.wait(1000);
      
      // Verify URL contains sort parameters
      cy.url().should('include', 'sortBy=createdDate');
      cy.url().should('include', 'sortDirection=desc');
      
      // Verify products appear (can't easily verify dates without displaying them)
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should default to relevance sort', () => {
      // Verify default sort
      cy.get('select[name="sortBy"]').should('have.value', 'relevance');
      
      // Should not have sortBy in URL for default
      cy.url().should('not.include', 'sortBy=relevance');
    });

    it('should persist sort across pagination', () => {
      // Apply sort
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Price: Low to High');
      cy.wait(1000);
      
      // Get first product price on page 1
      cy.get('[data-testid="product-price"]').first().then(($firstPrice) => {
        const page1FirstPrice = parseFloat($firstPrice.text().replace(/[₹,]/g, ''));
        
        // Navigate to page 2 (if exists)
        cy.get('button[aria-label="Go to page 2"]').then(($btn) => {
          if ($btn.length > 0) {
            cy.wrap($btn).click();
            cy.wait(1000);
            
            // Verify sort persists in URL
            cy.url().should('include', 'sortBy=price');
            cy.url().should('include', 'sortDirection=asc');
            cy.url().should('include', 'page=2');
            
            // Verify sort still applied (first product on page 2 >= last on page 1)
            cy.go('back');
            cy.get('[data-testid="product-price"]').last().then(($lastPrice) => {
              const page1LastPrice = parseFloat($lastPrice.text().replace(/[₹,]/g, ''));
              
              cy.get('button[aria-label="Go to page 2"]').click();
              cy.wait(1000);
              
              cy.get('[data-testid="product-price"]').first().then(($page2First) => {
                const page2FirstPrice = parseFloat($page2First.text().replace(/[₹,]/g, ''));
                expect(page2FirstPrice).to.be.at.least(page1LastPrice);
              });
            });
          }
        });
      });
    });

    it('should combine sort with filters', () => {
      // Apply filter
      cy.contains('Price Range').click();
      cy.get('input[type="range"]').first().invoke('val', 500).trigger('change');
      cy.wait(500);
      
      // Apply sort
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Name: A-Z');
      cy.wait(1000);
      
      // Verify both in URL
      cy.url().should('include', 'minPrice=500');
      cy.url().should('include', 'sortBy=name');
      
      // Verify results are both filtered and sorted
      cy.get('[data-testid="product-price"]').each(($price) => {
        const price = parseFloat($price.text().replace(/[₹,]/g, ''));
        expect(price).to.be.at.least(500);
      });
      
      cy.get('[data-testid="product-name"]').then(($names) => {
        const names = $names.toArray().map((el) => el.innerText.toLowerCase());
        for (let i = 0; i < names.length - 1; i++) {
          expect(names[i].localeCompare(names[i + 1])).to.be.at.most(0);
        }
      });
    });

    it('should maintain sort when search query changes', () => {
      // Apply sort
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Price: High to Low');
      cy.wait(1000);
      
      // Change search query
      cy.get('input[aria-label="Search for toys"]').clear().type('car');
      cy.get('input[aria-label="Search for toys"]').type('{enter}');
      cy.wait(1000);
      
      // Verify sort persists
      cy.url().should('include', 'sortBy=price');
      cy.url().should('include', 'sortDirection=desc');
      
      // Verify new results are sorted
      cy.get('[data-testid="product-price"]').then(($prices) => {
        const prices = $prices.toArray().map((el) => 
          parseFloat(el.innerText.replace(/[₹,]/g, ''))
        );
        
        for (let i = 0; i < prices.length - 1; i++) {
          expect(prices[i]).to.be.at.least(prices[i + 1]);
        }
      });
    });

    it('should reset sort when clicking relevance', () => {
      // Apply sort
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Price: Low to High');
      cy.wait(1000);
      
      // Reset to relevance
      cy.contains('Sort By').click();
      cy.get('select[name="sortBy"]').select('Relevance');
      cy.wait(1000);
      
      // Verify sort removed from URL
      cy.url().should('not.include', 'sortBy=price');
      
      // Verify results shown
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
    });
  });
});
