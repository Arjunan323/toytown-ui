/* eslint-disable */
// @ts-nocheck
/**
 * User Story 3 - E2E Tests: Security and Validation (T179)
 * Tests authorization, data isolation, token expiry, and business rule enforcement
 */

describe('US3: Security and Validation E2E Tests (T179)', () => {
  let testUser1;
  let testUser2;

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    const timestamp = Date.now();
    testUser1 = {
      email: `security${timestamp}@example.com`,
      password: 'Test1234!',
      firstName: 'Security',
      lastName: 'Test1',
      phoneNumber: '9876543210',
    };
    
    testUser2 = {
      email: `security${timestamp + 1}@example.com`,
      password: 'Test1234!',
      firstName: 'Security',
      lastName: 'Test2',
      phoneNumber: '9876543211',
    };
    
    cy.register(testUser1);
  });

  describe('Protected Route Authorization', () => {
    it('should redirect to login when accessing /profile without authentication', () => {
      cy.logout();
      cy.visit('/profile');
      cy.url().should('include', '/login');
    });

    it('should redirect to login when accessing /checkout without authentication', () => {
      cy.logout();
      cy.visit('/checkout');
      cy.url().should('include', '/login');
    });

    it('should redirect to login when accessing /orders without authentication', () => {
      cy.logout();
      cy.visit('/orders');
      cy.url().should('include', '/login');
    });

    it('should allow access to protected routes after login', () => {
      cy.logout();
      cy.login(testUser1);
      cy.visit('/profile');
      cy.url().should('include', '/profile');
      cy.contains(testUser1.firstName).should('be.visible');
    });

    it('should preserve redirect URL after login', () => {
      cy.logout();
      cy.visit('/profile');
      cy.url().should('include', '/login');
      
      cy.get('input[name="email"]').type(testUser1.email);
      cy.get('input[name="password"]').type(testUser1.password);
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/profile');
    });
  });

  describe('Data Isolation Between Users', () => {
    it('should not allow user A to see user B addresses', () => {
      // User 1 creates an address
      cy.createShippingAddress({
        recipientName: 'User1 Address',
        addressLine1: '123 User1 St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        phoneNumber: '9876543210',
      });
      
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Addresses').click();
      cy.contains('User1 Address').should('be.visible');
      
      // User 2 registers and checks addresses
      cy.logout();
      cy.register(testUser2);
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Addresses').click();
      
      // Should not see User1's address
      cy.contains('User1 Address').should('not.exist');
    });

    it('should not allow user A to modify user B addresses via API', () => {
      // User 1 creates an address
      cy.createShippingAddress({
        recipientName: 'User1 Address',
      }).then((address1) => {
        const address1Id = address1.shippingAddressId;
        
        // User 2 tries to update User1's address
        cy.logout();
        cy.register(testUser2);
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl')}/shipping-addresses/${address1Id}`,
          failOnStatusCode: false,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('token')}`,
          },
          body: {
            recipientName: 'Hacked Address',
            addressLine1: '123 Hacker St',
            city: 'Hack City',
            state: 'Hack State',
            postalCode: '00000',
            phoneNumber: '0000000000',
          },
        }).then((response) => {
          expect(response.status).to.be.oneOf([403, 404]); // Forbidden or Not Found
        });
      });
    });

    it('should not allow user A to delete user B addresses', () => {
      cy.createShippingAddress({
        recipientName: 'User1 Address',
      }).then((address1) => {
        const address1Id = address1.shippingAddressId;
        
        cy.logout();
        cy.register(testUser2);
        
        cy.request({
          method: 'DELETE',
          url: `${Cypress.env('apiUrl')}/shipping-addresses/${address1Id}`,
          failOnStatusCode: false,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('token')}`,
          },
        }).then((response) => {
          expect(response.status).to.be.oneOf([403, 404]);
        });
      });
    });

    it('should isolate order history between users', () => {
      // User 1 places an order
      cy.createShippingAddress({});
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      cy.get('[data-testid="address-selector"]').first().click();
      cy.contains('button', 'Continue').click();
      cy.mockRazorpayPayment();
      cy.contains('button', 'Place Order').click();
      cy.url().should('include', '/order-confirmation');
      
      // User 2 should not see User 1's order
      cy.logout();
      cy.register(testUser2);
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Order History').click();
      
      cy.contains('No orders yet').should('be.visible');
    });

    it('should isolate reviews between users', () => {
      // User 1 submits a review
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      });
      
      cy.get('[role="tab"]').contains('Reviews').click();
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').click();
      cy.get('textarea[name="reviewText"]').type('User1 review content here');
      cy.contains('button', 'Submit Review').click();
      
      // User 2 goes to My Reviews
      cy.logout();
      cy.register(testUser2);
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('My Reviews').click();
      
      // Should not see User1's review
      cy.contains('User1 review content here').should('not.exist');
    });
  });

  describe('Review Submission Business Rules', () => {
    it('should prevent review submission without purchase', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: false, hasPurchased: false },
      });
      
      cy.get('[role="tab"]').contains('Reviews').click();
      
      // Review form should not be visible
      cy.contains('Write a Review').should('not.exist');
      cy.contains('You must purchase this product to leave a review').should('be.visible');
    });

    it('should prevent duplicate reviews for same product', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      }).as('canReview');
      
      cy.get('[role="tab"]').contains('Reviews').click();
      cy.wait('@canReview');
      
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').click();
      cy.get('textarea[name="reviewText"]').type('First review for this product');
      
      cy.intercept('POST', `${Cypress.env('apiUrl')}/products/*/reviews`, {
        statusCode: 201,
        body: { message: 'Review submitted successfully' },
      });
      
      cy.contains('button', 'Submit Review').click();
      cy.contains('Review submitted successfully').should('be.visible');
      
      // Try to submit another review
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: false, hasPurchased: true, alreadyReviewed: true },
      });
      
      cy.reload();
      cy.get('[role="tab"]').contains('Reviews').click();
      
      cy.contains('You have already reviewed this product').should('be.visible');
      cy.contains('Write a Review').should('not.exist');
    });
  });

  describe('Password Reset Token Expiry', () => {
    it('should reject expired password reset token', () => {
      cy.logout();
      cy.visit('/reset-password?token=expired-token');
      
      cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/reset-password`, {
        statusCode: 400,
        body: { message: 'Reset token has expired or is invalid' },
      });
      
      cy.get('input[name="password"]').type('NewPassword1234!');
      cy.get('input[name="confirmPassword"]').type('NewPassword1234!');
      cy.contains('button', 'Reset Password').click();
      
      cy.contains('Reset token has expired or is invalid').should('be.visible');
    });

    it('should reject invalid password reset token', () => {
      cy.logout();
      cy.visit('/reset-password?token=invalid-token');
      
      cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/reset-password`, {
        statusCode: 400,
        body: { message: 'Invalid reset token' },
      });
      
      cy.get('input[name="password"]').type('NewPassword1234!');
      cy.get('input[name="confirmPassword"]').type('NewPassword1234!');
      cy.contains('button', 'Reset Password').click();
      
      cy.contains('Invalid reset token').should('be.visible');
    });

    it('should accept valid password reset token', () => {
      cy.logout();
      cy.visit('/reset-password?token=valid-token');
      
      cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/reset-password`, {
        statusCode: 200,
        body: { message: 'Password reset successfully' },
      });
      
      cy.get('input[name="password"]').type('NewPassword1234!');
      cy.get('input[name="confirmPassword"]').type('NewPassword1234!');
      cy.contains('button', 'Reset Password').click();
      
      cy.contains('Password reset successfully').should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  describe('JWT Token Expiry', () => {
    it('should redirect to login when JWT token expires', () => {
      cy.visit('/profile');
      cy.contains(testUser1.firstName).should('be.visible');
      
      // Simulate expired token by clearing it
      cy.window().then((win) => {
        win.localStorage.removeItem('token');
      });
      
      cy.reload();
      cy.url().should('include', '/login');
    });

    it('should handle API 401 responses gracefully', () => {
      cy.visit('/profile');
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/customers/profile`, {
        statusCode: 401,
        body: { message: 'Unauthorized' },
      });
      
      cy.reload();
      cy.url().should('include', '/login');
    });
  });

  describe('Form Validation Security', () => {
    it('should sanitize XSS in profile fields', () => {
      cy.visit('/profile');
      cy.contains('button', 'Edit').click();
      
      cy.get('input[name="firstName"]').clear().type('<script>alert("xss")</script>');
      cy.contains('button', 'Save').click();
      
      // Should display sanitized text, not execute script
      cy.reload();
      cy.get('input[name="firstName"]').should('have.value', '<script>alert("xss")</script>');
      cy.on('window:alert', () => {
        throw new Error('XSS vulnerability detected!');
      });
    });

    it('should enforce email format validation', () => {
      cy.logout();
      cy.visit('/register');
      
      cy.get('input[name="email"]').type('not-an-email');
      cy.get('input[name="password"]').type('Test1234!');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Invalid email format').should('be.visible');
    });

    it('should enforce password strength validation', () => {
      cy.logout();
      cy.visit('/register');
      
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('weak');
      cy.get('input[name="confirmPassword"]').type('weak');
      cy.get('button[type="submit"]').click();
      
      cy.contains(/password must be/i).should('be.visible');
    });
  });

  describe('Address Validation Security', () => {
    it('should enforce postal code format (5 or 9 digits)', () => {
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Addresses').click();
      cy.contains('button', 'Add New Address').click();
      
      cy.get('input[name="postalCode"]').type('123'); // Too short
      cy.get('input[name="recipientName"]').type('Test');
      cy.get('input[name="addressLine1"]').type('123 St');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      
      cy.contains('button', 'Save Address').click();
      cy.contains(/postal code must be/i).should('be.visible');
    });

    it('should enforce phone number format (10 digits)', () => {
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Addresses').click();
      cy.contains('button', 'Add New Address').click();
      
      cy.get('input[name="phoneNumber"]').type('123'); // Too short
      cy.get('input[name="recipientName"]').type('Test');
      cy.get('input[name="addressLine1"]').type('123 St');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="postalCode"]').type('400001');
      
      cy.contains('button', 'Save Address').click();
      cy.contains(/phone number must be/i).should('be.visible');
    });

    it('should require all mandatory address fields', () => {
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Addresses').click();
      cy.contains('button', 'Add New Address').click();
      
      cy.get('input[name="recipientName"]').type('Test');
      // Skip other fields
      
      cy.contains('button', 'Save Address').click();
      cy.contains(/required/i).should('be.visible');
    });
  });

  describe('Review Validation Security', () => {
    it('should enforce minimum review length (10 characters)', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      });
      
      cy.get('[role="tab"]').contains('Reviews').click();
      
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').click();
      cy.get('textarea[name="reviewText"]').type('Short'); // Only 5 chars
      cy.contains('button', 'Submit Review').click();
      
      cy.contains(/at least 10 characters/i).should('be.visible');
    });

    it('should enforce maximum review length (2000 characters)', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      });
      
      cy.get('[role="tab"]').contains('Reviews').click();
      
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').click();
      const longText = 'a'.repeat(2100); // Exceed limit
      cy.get('textarea[name="reviewText"]').invoke('val', longText).trigger('input');
      cy.contains('button', 'Submit Review').click();
      
      cy.contains(/cannot exceed 2000 characters/i).should('be.visible');
    });

    it('should require star rating for review submission', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      });
      
      cy.get('[role="tab"]').contains('Reviews').click();
      
      // Skip star rating
      cy.get('textarea[name="reviewText"]').type('Review without rating');
      cy.contains('button', 'Submit Review').click();
      
      cy.contains(/rating is required/i).should('be.visible');
    });
  });

  describe('Cart Security', () => {
    it('should not allow adding items with negative quantity', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('POST', `${Cypress.env('apiUrl')}/cart/items`, (req) => {
        if (req.body.quantity < 1) {
          req.reply({
            statusCode: 400,
            body: { message: 'Quantity must be at least 1' },
          });
        }
      });
      
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      
      // Verify quantity cannot go below 1
      cy.get('[data-testid="quantity-input"]').should('have.attr', 'min', '1');
    });
  });

  describe('Session Security', () => {
    it('should clear sensitive data on logout', () => {
      cy.visit('/profile');
      cy.contains(testUser1.firstName).should('be.visible');
      
      cy.logout();
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('userId')).to.be.null;
      });
      
      cy.visit('/profile');
      cy.url().should('include', '/login');
    });

    it('should not persist password in browser', () => {
      cy.logout();
      cy.visit('/login');
      
      cy.get('input[name="password"]').type('Test1234!');
      
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      cy.get('input[name="password"]').should('have.attr', 'autocomplete', 'current-password');
    });
  });
});
