/**
 * User Story 3 - E2E Tests: Responsive Design (T178)
 * Tests US3 pages on different screen sizes (mobile, tablet, desktop)
 */

describe('US3: Responsive Design E2E Tests (T178)', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ];

  let testUser;

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    const timestamp = Date.now();
    testUser = {
      email: `responsive${timestamp}@example.com`,
      password: 'Test1234!',
      firstName: 'Responsive',
      lastName: 'Test',
      phoneNumber: '9876543210',
    };
    
    cy.register(testUser);
  });

  describe('RegisterPage Responsive Design', () => {
    viewports.forEach((viewport) => {
      it(`should be usable on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.logout();
        cy.visit('/register');
        
        // All form fields should be visible and accessible
        cy.get('input[name="firstName"]').should('be.visible');
        cy.get('input[name="lastName"]').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('input[name="confirmPassword"]').should('be.visible');
        cy.get('input[name="phoneNumber"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
        
        // Form should be scrollable if needed
        cy.scrollTo('bottom');
        cy.get('button[type="submit"]').should('be.visible');
      });

      it(`should allow form submission on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.logout();
        cy.visit('/register');
        
        const newUser = {
          firstName: 'Mobile',
          lastName: 'User',
          email: `mobile${Date.now()}@example.com`,
          password: 'Test1234!',
          phoneNumber: '9876543210',
        };
        
        cy.get('input[name="firstName"]').type(newUser.firstName);
        cy.get('input[name="lastName"]').type(newUser.lastName);
        cy.get('input[name="email"]').type(newUser.email);
        cy.get('input[name="password"]').type(newUser.password);
        cy.get('input[name="confirmPassword"]').type(newUser.password);
        cy.get('input[name="phoneNumber"]').type(newUser.phoneNumber);
        
        cy.scrollTo('bottom');
        cy.get('button[type="submit"]').click();
        
        cy.url().should('not.include', '/register');
      });
    });
  });

  describe('ProfilePage Responsive Design', () => {
    viewports.forEach((viewport) => {
      it(`should display tabs correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/profile');
        
        // Tabs should be visible
        cy.get('[role="tab"]').contains('Personal Info').should('be.visible');
        cy.get('[role="tab"]').contains('Addresses').should('be.visible');
        cy.get('[role="tab"]').contains('Order History').should('be.visible');
        cy.get('[role="tab"]').contains('My Reviews').should('be.visible');
      });

      it(`should allow switching tabs on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/profile');
        
        cy.get('[role="tab"]').contains('Addresses').click();
        cy.contains('Shipping Addresses').should('be.visible');
        
        cy.get('[role="tab"]').contains('Order History').click();
        cy.contains('Your Orders').should('be.visible');
      });

      it(`should allow editing profile on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/profile');
        
        cy.contains('button', 'Edit').click();
        cy.get('input[name="firstName"]').should('not.be.disabled');
        
        cy.scrollTo('bottom');
        cy.contains('button', 'Save').should('be.visible');
      });
    });
  });

  describe('Address Form Responsive Design', () => {
    viewports.forEach((viewport) => {
      it(`should display address form correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/profile');
        cy.get('[role="tab"]').contains('Addresses').click();
        cy.contains('button', 'Add New Address').click();
        
        // All form fields should be accessible
        cy.get('input[name="recipientName"]').should('be.visible');
        cy.get('input[name="addressLine1"]').should('be.visible');
        cy.scrollTo('bottom');
        cy.get('input[name="postalCode"]').should('be.visible');
        cy.get('input[name="phoneNumber"]').should('be.visible');
        cy.contains('button', 'Save Address').should('be.visible');
      });

      it(`should allow adding address on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/profile');
        cy.get('[role="tab"]').contains('Addresses').click();
        cy.contains('button', 'Add New Address').click();
        
        cy.get('input[name="recipientName"]').type('Mobile Address');
        cy.get('input[name="addressLine1"]').type('123 Mobile St');
        cy.get('input[name="city"]').type('Mumbai');
        cy.get('input[name="state"]').type('Maharashtra');
        cy.get('input[name="postalCode"]').type('400001');
        cy.get('input[name="phoneNumber"]').type('9876543210');
        
        cy.scrollTo('bottom');
        cy.contains('button', 'Save Address').click();
        
        cy.contains('Mobile Address').should('be.visible');
      });
    });
  });

  describe('ReviewForm Responsive Design', () => {
    viewports.forEach((viewport) => {
      it(`should display review form on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/products');
        cy.get('[data-testid="product-card"]').first().click();
        
        cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
          body: { canReview: true, hasPurchased: true },
        });
        
        cy.get('[role="tab"]').contains('Reviews').click();
        
        // Review form should be visible
        cy.scrollTo('bottom');
        cy.contains('Write a Review').should('be.visible');
        cy.get('[data-testid="star-rating-selector"]').should('be.visible');
        cy.get('textarea[name="reviewText"]').should('be.visible');
      });

      it(`should allow submitting review on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/products');
        cy.get('[data-testid="product-card"]').first().click();
        
        cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
          body: { canReview: true, hasPurchased: true },
        });
        
        cy.get('[role="tab"]').contains('Reviews').click();
        cy.scrollTo('bottom');
        
        cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').click();
        cy.get('textarea[name="reviewText"]').type('Great product! Works perfectly on mobile.');
        cy.contains('button', 'Submit Review').click();
        
        cy.contains('Review submitted successfully').should('be.visible');
      });
    });
  });

  describe('Touch Interaction on Mobile', () => {
    it('should support touch gestures for star rating', () => {
      cy.viewport('iphone-x');
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      });
      
      cy.get('[role="tab"]').contains('Reviews').click();
      cy.scrollTo('bottom');
      
      // Touch/tap on star rating
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="4"]').trigger('touchstart');
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="4"]').trigger('touchend');
      
      // Should select 4 stars
      cy.get('[data-testid="star-rating-selector"]').find('.filled-star').should('have.length', 4);
    });

    it('should support touch scrolling in forms', () => {
      cy.viewport('iphone-x');
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Addresses').click();
      cy.contains('button', 'Add New Address').click();
      
      // Should be able to scroll through form
      cy.get('input[name="recipientName"]').should('be.visible');
      cy.scrollTo('bottom');
      cy.get('input[name="phoneNumber"]').should('be.visible');
    });
  });

  describe('Password Reset Pages Responsive', () => {
    viewports.forEach((viewport) => {
      it(`should display forgot password form on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.logout();
        cy.visit('/forgot-password');
        
        cy.get('input[name="email"]').should('be.visible');
        cy.contains('button', 'Send Reset Link').should('be.visible');
      });

      it(`should display reset password form on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/reset-password?token=test-token');
        
        cy.get('input[name="password"]').should('be.visible');
        cy.get('input[name="confirmPassword"]').should('be.visible');
        cy.scrollTo('bottom');
        cy.contains('button', 'Reset Password').should('be.visible');
      });
    });
  });

  describe('Checkout Responsive Design', () => {
    viewports.forEach((viewport) => {
      it(`should display checkout steps on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        cy.createShippingAddress({});
        cy.visit('/products');
        cy.get('[data-testid="product-card"]').first().click();
        cy.contains('button', 'Add to Cart').click();
        cy.visit('/cart');
        cy.contains('button', 'Proceed to Checkout').click();
        
        // Stepper should be visible
        cy.contains('Shipping Address').should('be.visible');
        
        // Addresses should be displayable
        cy.scrollTo('bottom');
        cy.contains('button', 'Continue').should('be.visible');
      });
    });
  });

  describe('Navigation Menu on Mobile', () => {
    it('should display mobile menu for profile options', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      
      // User menu should be accessible
      cy.get('[data-testid="user-menu"]').should('be.visible');
      cy.get('[data-testid="user-menu"]').click();
      
      // Menu items should be visible
      cy.contains('My Profile').should('be.visible');
      cy.contains('Order History').should('be.visible');
      cy.contains('My Reviews').should('be.visible');
      cy.contains('Logout').should('be.visible');
    });
  });

  describe('Form Input Sizing', () => {
    it('should have properly sized inputs on mobile', () => {
      cy.viewport('iphone-x');
      cy.logout();
      cy.visit('/register');
      
      // Inputs should be large enough for touch
      cy.get('input[name="email"]').should('have.css', 'min-height').and('match', /\d+px/);
      cy.get('input[name="email"]').invoke('outerHeight').should('be.gte', 40); // Touch-friendly minimum
    });
  });

  describe('Overflow and Scroll Behavior', () => {
    it('should handle content overflow gracefully', () => {
      cy.viewport('iphone-x');
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Addresses').click();
      
      // Should be scrollable
      cy.scrollTo('top');
      cy.get('[role="tab"]').contains('Addresses').should('be.visible');
      cy.scrollTo('bottom');
      cy.contains('button', 'Add New Address').should('be.visible');
    });
  });
});
