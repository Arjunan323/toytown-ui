/* eslint-disable */
// @ts-nocheck
/**
 * User Story 3 - E2E Tests: Product Review Submission (T174)
 * Tests review submission, validation, and moderation
 */

describe('US3: Product Review Submission E2E Tests (T174)', () => {
  let testUser;
  let testProduct;

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    // Register and login a test user
    const timestamp = Date.now();
    testUser = {
      firstName: 'ReviewTest',
      lastName: 'User',
      email: `review${timestamp}@example.com`,
      password: 'Test1234!',
      phoneNumber: '9876543210',
    };
    
    cy.register(testUser);
  });

  describe('Review Form Visibility', () => {
    it('should show ReviewForm only after product purchase', () => {
      // Visit a product page without purchasing
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      // Switch to Reviews tab
      cy.get('[role="tab"]').contains('Reviews').click();
      
      // Should NOT show review form (not purchased)
      cy.contains('Sign in to write a review').should('be.visible');
    });

    it('should display ReviewForm for purchased products', () => {
      // Purchase a product first
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      // Get product ID
      cy.url().then((url) => {
        const productId = url.split('/').pop();
        
        // Add to cart and complete purchase
        cy.contains('button', 'Add to Cart').click();
        cy.visit('/cart');
        cy.contains('button', 'Proceed to Checkout').click();
        
        // Create shipping address
        cy.createShippingAddress({
          recipientName: 'Test User',
          addressLine1: '123 Test St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          phoneNumber: '9876543210',
        }).then((address) => {
          // Complete checkout
          cy.mockRazorpayPayment();
          cy.completeCheckout(address.id, { razorpayPaymentId: 'pay_test_123' });
          
          // Now visit product page again
          cy.visit(`/products/${productId}`);
          cy.get('[role="tab"]').contains('Reviews').click();
          
          // Should show review form
          cy.contains('Write a Review').should('be.visible');
          cy.get('[data-testid="star-rating-selector"]').should('be.visible');
          cy.get('textarea[name="reviewText"]').should('be.visible');
        });
      });
    });
  });

  describe('Review Form Validation', () => {
    beforeEach(() => {
      // Setup: Purchase a product and navigate to review form
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      cy.createShippingAddress({}).then((address) => {
        cy.mockRazorpayPayment();
        cy.completeCheckout(address.id);
        cy.visit('/products');
        cy.get('[data-testid="product-card"]').first().click();
        cy.get('[role="tab"]').contains('Reviews').click();
      });
    });

    it('should require rating selection', () => {
      cy.get('textarea[name="reviewText"]').type('Great product!');
      cy.contains('button', 'Submit Review').click();
      
      cy.contains('Please select a rating').should('be.visible');
    });

    it('should require review text (minimum 10 characters)', () => {
      // Select rating
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').click();
      
      // Try to submit with short text
      cy.get('textarea[name="reviewText"]').type('Good');
      cy.contains('button', 'Submit Review').click();
      
      cy.contains('Review must be at least 10 characters').should('be.visible');
    });

    it('should enforce maximum review length (2000 characters)', () => {
      const longText = 'a'.repeat(2001);
      
      cy.get('textarea[name="reviewText"]').type(longText);
      
      // Should show character count warning
      cy.contains('2000/2000').should('be.visible');
      cy.contains('Maximum character limit reached').should('be.visible');
    });

    it('should display character counter', () => {
      cy.get('textarea[name="reviewText"]').type('This is a test review');
      
      cy.contains('21/2000').should('be.visible');
    });
  });

  describe('Star Rating Selector', () => {
    beforeEach(() => {
      // Navigate to a product review form
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.get('[role="tab"]').contains('Reviews').click();
    });

    it('should display star rating options (1-5)', () => {
      cy.get('[data-testid="star-rating-selector"]').should('be.visible');
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="1"]').should('exist');
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').should('exist');
    });

    it('should show hover labels (Poor, Fair, Good, Very Good, Excellent)', () => {
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="1"]').trigger('mouseover');
      cy.contains('Poor').should('be.visible');
      
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="3"]').trigger('mouseover');
      cy.contains('Good').should('be.visible');
      
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').trigger('mouseover');
      cy.contains('Excellent').should('be.visible');
    });

    it('should select rating on click', () => {
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="4"]').click();
      
      // 4 stars should be filled
      cy.get('[data-testid="star-rating-selector"]').find('.filled-star').should('have.length', 4);
    });
  });

  describe('Review Submission', () => {
    it('should submit review successfully', () => {
      // Purchase product first (simplified for test)
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().then(($card) => {
        const productName = $card.find('[data-testid="product-name"]').text();
        
        $card.click();
        
        // Mock purchase verification (in real test, complete full purchase flow)
        cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
          statusCode: 200,
          body: { canReview: true, hasPurchased: true },
        });
        
        cy.get('[role="tab"]').contains('Reviews').click();
        
        // Fill in review
        cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').click();
        cy.get('textarea[name="reviewText"]').type('Excellent product! My kids love it. Great quality and fast delivery.');
        
        // Submit
        cy.contains('button', 'Submit Review').click();
        
        // Success message
        cy.contains('Review submitted successfully').should('be.visible');
        cy.contains('Your review will be published after moderation').should('be.visible');
      });
    });

    it('should display submitted review in ReviewList', () => {
      // Submit a review
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      });
      
      cy.get('[role="tab"]').contains('Reviews').click();
      
      const reviewText = 'This is my test review for this amazing product!';
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="4"]').click();
      cy.get('textarea[name="reviewText"]').type(reviewText);
      cy.contains('button', 'Submit Review').click();
      
      cy.wait(1000);
      
      // Review should appear (if auto-approved or in testing mode)
      cy.contains(reviewText).should('be.visible');
    });
  });

  describe('Duplicate Review Prevention', () => {
    it('should prevent submitting multiple reviews for same product', () => {
      // Submit first review
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      }).as('canReview');
      
      cy.get('[role="tab"]').contains('Reviews').click();
      cy.wait('@canReview');
      
      cy.get('[data-testid="star-rating-selector"]').find('[data-value="5"]').click();
      cy.get('textarea[name="reviewText"]').type('First review for this product');
      cy.contains('button', 'Submit Review').click();
      
      cy.wait(2000);
      
      // Try to submit another review
      cy.reload();
      cy.get('[role="tab"]').contains('Reviews').click();
      
      // Should show message that review already exists
      cy.contains('You have already reviewed this product').should('be.visible');
      cy.get('textarea[name="reviewText"]').should('not.exist');
    });
  });

  describe('Review Display in ReviewList', () => {
    it('should display reviews with ratings and text', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.get('[role="tab"]').contains('Reviews').click();
      
      // Should show ReviewList component
      cy.get('[data-testid="review-list"]').should('be.visible');
    });

    it('should show empty state when no reviews', () => {
      // Visit a product with no reviews
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').last().click();
      cy.get('[role="tab"]').contains('Reviews').click();
      
      cy.contains('No reviews yet').should('be.visible');
      cy.contains('Be the first to review').should('be.visible');
    });

    it('should display customer name and date for each review', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.get('[role="tab"]').contains('Reviews').click();
      
      // Mock some reviews
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews*`, {
        body: {
          reviews: [
            {
              id: 1,
              rating: 5,
              reviewText: 'Great product!',
              customerName: 'John Doe',
              submissionDate: new Date().toISOString(),
              verifiedPurchase: true,
            },
          ],
          totalReviews: 1,
          averageRating: 5.0,
        },
      });
      
      cy.reload();
      cy.get('[role="tab"]').contains('Reviews').click();
      
      cy.contains('John Doe').should('be.visible');
      cy.contains('Great product!').should('be.visible');
    });

    it('should show verified purchase badge', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.get('[role="tab"]').contains('Reviews').click();
      
      cy.get('[data-testid="verified-purchase-badge"]').should('be.visible');
    });
  });

  describe('Review Moderation Notice', () => {
    it('should display moderation notice when submitting review', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*/reviews/can-review`, {
        body: { canReview: true, hasPurchased: true },
      });
      
      cy.get('[role="tab"]').contains('Reviews').click();
      
      cy.contains('Reviews are subject to automatic moderation').should('be.visible');
      cy.contains('may take some time to appear').should('be.visible');
    });
  });

  describe('My Reviews Page', () => {
    it('should navigate to My Reviews page from header', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.contains('My Reviews').click();
      
      cy.url().should('include', '/my-reviews');
    });

    it('should display all user reviews on My Reviews page', () => {
      cy.visit('/my-reviews');
      
      cy.contains('My Reviews').should('be.visible');
      cy.get('[data-testid="review-card"]').should('exist');
    });

    it('should show moderation status for each review', () => {
      cy.visit('/my-reviews');
      
      // Mock reviews with different statuses
      cy.intercept('GET', `${Cypress.env('apiUrl')}/reviews/my-reviews`, {
        body: [
          {
            id: 1,
            productName: 'Test Product',
            rating: 5,
            reviewText: 'Great!',
            moderationStatus: 'PUBLISHED',
            submissionDate: new Date().toISOString(),
          },
          {
            id: 2,
            productName: 'Another Product',
            rating: 3,
            reviewText: 'Average',
            moderationStatus: 'FLAGGED',
            moderationReason: 'Pending manual review',
            submissionDate: new Date().toISOString(),
          },
        ],
      });
      
      cy.reload();
      
      cy.contains('Published').should('be.visible');
      cy.contains('Flagged').should('be.visible');
    });

    it('should show link to product from review', () => {
      cy.visit('/my-reviews');
      
      cy.get('[data-testid="product-link"]').first().should('be.visible');
      cy.get('[data-testid="product-link"]').first().click();
      
      cy.url().should('include', '/products/');
    });
  });
});
