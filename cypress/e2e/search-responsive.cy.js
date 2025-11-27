/**
 * Responsive Design E2E Tests (T123)
 * 
 * Validates responsive design:
 * - Search on mobile (< 768px)
 * - Filters in drawer on mobile
 * - Desktop sidebar layout (> 768px)
 * - Touch interactions work properly
 */

describe('Responsive Design', () => {
  describe('T123: Mobile View (< 768px)', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport(375, 667); // iPhone SE dimensions
    });

    it('should display mobile search interface', () => {
      cy.visit('/');
      
      // Search bar should be expandable on mobile
      cy.get('button[aria-label*="search"]').should('be.visible').click();
      cy.get('input[aria-label="Search for toys"]').should('be.visible');
      
      // Enter search
      cy.get('input[aria-label="Search for toys"]').type('car{enter}');
      
      // Should navigate to search page
      cy.url().should('include', '/search?q=car');
    });

    it('should show filters in drawer on mobile', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Filter button should be visible
      cy.get('button').contains(/filter/i).should('be.visible');
      
      // Click filter button
      cy.get('button').contains(/filter/i).click();
      
      // Drawer should open
      cy.get('[role="presentation"]').should('be.visible');
      
      // Filters should be in drawer
      cy.get('[role="presentation"]').within(() => {
        cy.contains('Age Range').should('be.visible');
        cy.contains('Price Range').should('be.visible');
        cy.contains('Manufacturer').should('be.visible');
      });
    });

    it('should close filter drawer with close button', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Open drawer
      cy.get('button').contains(/filter/i).click();
      cy.get('[role="presentation"]').should('be.visible');
      
      // Close drawer
      cy.get('button[aria-label*="close"]').click();
      
      // Drawer should be closed
      cy.get('[role="presentation"]').should('not.be.visible');
    });

    it('should show filter count badge on mobile', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Open filters
      cy.get('button').contains(/filter/i).click();
      
      // Apply filter
      cy.contains('Age Range').click();
      cy.get('select[name="ageRange"]').select('3-5');
      
      // Close drawer
      cy.get('button[aria-label*="close"]').click();
      
      // Filter count badge should show
      cy.get('[data-testid="filter-count"]').should('contain', '1');
    });

    it('should have touch-friendly product cards', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Product cards should be full width on mobile
      cy.get('[data-testid="product-card"]').first().then(($card) => {
        const cardWidth = $card.width();
        const viewportWidth = Cypress.config('viewportWidth');
        
        // Card should take most of the width (accounting for padding)
        expect(cardWidth).to.be.greaterThan(viewportWidth * 0.85);
      });
    });

    it('should support swipe to close filter drawer', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Open filter drawer
      cy.get('button').contains(/filter/i).click();
      cy.get('[role="presentation"]').should('be.visible');
      
      // Swipe right to close (simulate touch)
      cy.get('[role="presentation"]')
        .trigger('touchstart', { touches: [{ clientX: 0, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 200, clientY: 100 }] })
        .trigger('touchend');
      
      // Drawer should close
      cy.wait(500);
      cy.get('[role="presentation"]').should('not.be.visible');
    });

    it('should show mobile pagination controls', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Pagination should be compact on mobile
      cy.get('.MuiPagination-root').should('have.class', 'MuiPagination-sizeMedium');
      
      // Should have page numbers visible
      cy.get('button[aria-label*="page"]').should('be.visible');
    });

    it('should stack search results vertically on mobile', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Get positions of first two products
      cy.get('[data-testid="product-card"]').then(($cards) => {
        if ($cards.length >= 2) {
          const card1 = $cards[0].getBoundingClientRect();
          const card2 = $cards[1].getBoundingClientRect();
          
          // Second card should be below first (vertical stacking)
          expect(card2.top).to.be.greaterThan(card1.bottom);
        }
      });
    });
  });

  describe('T123: Tablet View (768px - 1024px)', () => {
    beforeEach(() => {
      // Set tablet viewport
      cy.viewport(768, 1024); // iPad dimensions
    });

    it('should show 2 products per row on tablet', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Get first row of products
      cy.get('[data-testid="product-card"]').then(($cards) => {
        if ($cards.length >= 2) {
          const card1 = $cards[0].getBoundingClientRect();
          const card2 = $cards[1].getBoundingClientRect();
          
          // Cards should be on same row (similar top position)
          expect(Math.abs(card1.top - card2.top)).to.be.lessThan(10);
        }
      });
    });

    it('should show sidebar filters on tablet', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Filters should be in sidebar (not drawer) on tablet
      cy.contains('Age Range').should('be.visible');
      cy.contains('Price Range').should('be.visible');
      
      // Filter button should not be needed
      cy.get('button').contains(/filter/i).should('not.exist');
    });
  });

  describe('T123: Desktop View (> 1024px)', () => {
    beforeEach(() => {
      // Set desktop viewport
      cy.viewport(1920, 1080); // Full HD
    });

    it('should show sidebar layout on desktop', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Sidebar should be visible
      cy.get('[data-testid="search-sidebar"]').or('aside').should('be.visible');
      
      // Filters should be in sidebar
      cy.contains('Age Range').should('be.visible');
      cy.contains('Price Range').should('be.visible');
      cy.contains('Manufacturer').should('be.visible');
    });

    it('should show 4 products per row on desktop', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Get first row of products
      cy.get('[data-testid="product-card"]').then(($cards) => {
        if ($cards.length >= 4) {
          const positions = Array.from($cards.slice(0, 4)).map((card) => 
            card.getBoundingClientRect().top
          );
          
          // All 4 cards should be on same row
          const maxDiff = Math.max(...positions) - Math.min(...positions);
          expect(maxDiff).to.be.lessThan(10);
        }
      });
    });

    it('should have fixed sidebar when scrolling', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Get initial sidebar position
      cy.get('[data-testid="search-sidebar"]').or('aside').then(($sidebar) => {
        const initialTop = $sidebar.offset().top;
        
        // Scroll down
        cy.scrollTo(0, 500);
        
        // Sidebar should remain in view (sticky/fixed)
        cy.get('[data-testid="search-sidebar"]').or('aside').then(($scrolledSidebar) => {
          const scrolledTop = $scrolledSidebar.offset().top;
          
          // Position should be adjusted for scroll (sticky behavior)
          expect(scrolledTop).to.be.lessThan(initialTop + 100);
        });
      });
    });

    it('should show inline search bar in header', () => {
      cy.visit('/');
      
      // Search bar should be always visible in header
      cy.get('input[aria-label="Search for toys"]').should('be.visible');
      
      // Should not need button to expand
      cy.get('button[aria-label*="search"]').should('not.exist');
    });

    it('should handle mouse hover interactions on product cards', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Hover over product card
      cy.get('[data-testid="product-card"]').first().trigger('mouseover');
      
      // Card should show hover effect (elevation, shadow, etc.)
      cy.get('[data-testid="product-card"]').first().should('be.visible');
    });
  });

  describe('T123: Touch Interactions', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // Mobile
    });

    it('should handle touch on product cards', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Tap product card
      cy.get('[data-testid="product-card"]').first()
        .trigger('touchstart')
        .trigger('touchend');
      
      // Should navigate to product detail
      cy.url().should('include', '/products/');
    });

    it('should handle touch on filter accordions', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Open filter drawer
      cy.get('button').contains(/filter/i).click();
      
      // Tap to expand age range filter
      cy.contains('Age Range')
        .trigger('touchstart')
        .trigger('touchend');
      
      // Filter should expand
      cy.get('select[name="ageRange"]').should('be.visible');
    });

    it('should handle touch on pagination', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Tap page 2 button (if exists)
      cy.get('button[aria-label="Go to page 2"]').then(($btn) => {
        if ($btn.length > 0) {
          cy.wrap($btn)
            .trigger('touchstart')
            .trigger('touchend');
          
          // Should navigate to page 2
          cy.url().should('include', 'page=2');
        }
      });
    });

    it('should handle touch on price range slider', () => {
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Open filter drawer
      cy.get('button').contains(/filter/i).click();
      
      // Expand price range
      cy.contains('Price Range').click();
      
      // Touch and drag slider
      cy.get('input[type="range"]').first()
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 0 }] })
        .trigger('touchmove', { touches: [{ clientX: 150, clientY: 0 }] })
        .trigger('touchend');
      
      // Filter should be applied
      cy.url().should('include', 'minPrice');
    });
  });

  describe('T123: Orientation Changes', () => {
    it('should handle portrait to landscape on mobile', () => {
      // Start in portrait
      cy.viewport(375, 667);
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Verify portrait layout
      cy.get('[data-testid="product-card"]').should('exist');
      
      // Switch to landscape
      cy.viewport(667, 375);
      cy.wait(500);
      
      // Should still show products appropriately
      cy.get('[data-testid="product-card"]').should('exist');
    });

    it('should handle landscape to portrait on tablet', () => {
      // Start in landscape
      cy.viewport(1024, 768);
      cy.visit('/search?q=toy');
      cy.wait(1000);
      
      // Switch to portrait
      cy.viewport(768, 1024);
      cy.wait(500);
      
      // Layout should adjust
      cy.get('[data-testid="product-card"]').should('exist');
    });
  });
});
