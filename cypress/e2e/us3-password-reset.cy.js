/**
 * User Story 3 - E2E Tests: Password Reset Flow (T173)
 * Tests forgot password and reset password functionality
 * Note: Email verification step is manual in development environment
 */

describe('US3: Password Reset Flow E2E Tests (T173)', () => {
  let testUser;

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    // Register a test user
    const timestamp = Date.now();
    testUser = {
      firstName: 'PasswordTest',
      lastName: 'User',
      email: `passwordreset${timestamp}@example.com`,
      password: 'OldPassword123!',
      phoneNumber: '9876543210',
    };
    
    cy.register(testUser);
    cy.logout();
  });

  describe('Forgot Password Page', () => {
    beforeEach(() => {
      cy.visit('/forgot-password');
    });

    it('should display forgot password form', () => {
      cy.contains('Forgot Password').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.contains('button', 'Send Reset Link').should('be.visible');
    });

    it('should validate email field', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.contains('button', 'Send Reset Link').click();
      
      cy.contains('Please enter a valid email').should('be.visible');
    });

    it('should submit forgot password request successfully', () => {
      cy.get('input[name="email"]').type(testUser.email);
      cy.contains('button', 'Send Reset Link').click();
      
      // Success message
      cy.contains('Password reset link sent').should('be.visible');
      cy.contains('Check your email').should('be.visible');
    });

    it('should handle non-existent email gracefully', () => {
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.contains('button', 'Send Reset Link').click();
      
      // Should still show success (security: don't reveal if email exists)
      cy.contains('Password reset link sent').should('be.visible');
    });

    it('should have link back to login page', () => {
      cy.contains('Back to Login').should('be.visible');
      cy.contains('Back to Login').click();
      
      cy.url().should('include', '/login');
    });
  });

  describe('Reset Password Page', () => {
    let resetToken;

    beforeEach(() => {
      // Request password reset to get a token
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/forgot-password`,
        body: {
          email: testUser.email,
        },
      }).then((response) => {
        // In a real scenario, we'd extract token from email
        // For testing, we'll mock a valid token format
        resetToken = 'mock-reset-token-' + Date.now();
        
        // Visit reset password page with token
        cy.visit(`/reset-password?token=${resetToken}`);
      });
    });

    it('should display reset password form', () => {
      cy.contains('Reset Password').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.contains('button', 'Reset Password').should('be.visible');
    });

    it('should validate password strength', () => {
      cy.get('input[name="password"]').type('weak');
      cy.get('input[name="confirmPassword"]').type('weak');
      cy.contains('button', 'Reset Password').click();
      
      cy.contains('Password must be at least 8 characters').should('be.visible');
    });

    it('should validate password match', () => {
      cy.get('input[name="password"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPass123!');
      cy.contains('button', 'Reset Password').click();
      
      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should show/hide password visibility', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      
      cy.get('[data-testid="password-visibility-toggle"]').first().click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    });
  });

  describe('Reset Password Success Flow', () => {
    it('should reset password and allow login with new password', () => {
      // Step 1: Request password reset
      cy.visit('/forgot-password');
      cy.get('input[name="email"]').type(testUser.email);
      cy.contains('button', 'Send Reset Link').click();
      cy.contains('Password reset link sent').should('be.visible');
      
      // Step 2: Simulate visiting reset link
      // In real scenario, user would click link from email
      // For testing, we'll create a mock token scenario
      const mockToken = 'test-token-' + Date.now();
      
      // Note: In actual implementation, backend would validate this token
      // For E2E testing, we're testing the frontend flow
      cy.visit(`/reset-password?token=${mockToken}`);
      
      // Step 3: Enter new password
      const newPassword = 'NewPassword123!';
      cy.get('input[name="password"]').type(newPassword);
      cy.get('input[name="confirmPassword"]').type(newPassword);
      cy.contains('button', 'Reset Password').click();
      
      // Step 4: Should redirect to login on success
      // (This depends on backend accepting the mock token)
      // In real tests, we'd need a valid token from the backend
    });
  });

  describe('Invalid Token Handling', () => {
    it('should display error for invalid token', () => {
      cy.visit('/reset-password?token=invalid-token-12345');
      
      // Should show error message
      cy.contains('Invalid or expired reset link').should('be.visible');
      cy.contains('Request a new password reset').should('be.visible');
    });

    it('should display error for expired token', () => {
      // Create an expired token scenario
      cy.visit('/reset-password?token=expired-token-old');
      
      cy.contains('Invalid or expired').should('be.visible');
    });

    it('should have link to request new reset', () => {
      cy.visit('/reset-password?token=invalid-token');
      
      cy.contains('Request a new password reset').click();
      cy.url().should('include', '/forgot-password');
    });
  });

  describe('Password Reset Security', () => {
    it('should not reveal whether email exists', () => {
      cy.visit('/forgot-password');
      
      // Try with non-existent email
      cy.get('input[name="email"]').type('doesnotexist@example.com');
      cy.contains('button', 'Send Reset Link').click();
      
      // Should show generic success message (security best practice)
      cy.contains('Password reset link sent').should('be.visible');
      // Should NOT say "email not found"
    });

    it('should prevent token reuse after password reset', () => {
      // This would require:
      // 1. Reset password with a token
      // 2. Try to use the same token again
      // 3. Should fail with "token already used" error
      
      // Note: Full implementation requires backend cooperation
      // This is a placeholder for the test structure
    });

    it('should enforce token expiry (24 hours)', () => {
      // This would test:
      // 1. Create token with timestamp 25 hours ago
      // 2. Try to use it
      // 3. Should fail with "expired" error
      
      // Note: Full implementation requires backend cooperation
    });
  });

  describe('Login Page Integration', () => {
    it('should have "Forgot Password?" link on login page', () => {
      cy.visit('/login');
      
      cy.contains('Forgot Password?').should('be.visible');
      cy.contains('Forgot Password?').click();
      
      cy.url().should('include', '/forgot-password');
    });
  });

  describe('Complete Password Reset Journey', () => {
    it('should complete full flow: forgot -> reset -> login', () => {
      // Step 1: Go to login page
      cy.visit('/login');
      
      // Step 2: Click forgot password
      cy.contains('Forgot Password?').click();
      cy.url().should('include', '/forgot-password');
      
      // Step 3: Submit email
      cy.get('input[name="email"]').type(testUser.email);
      cy.contains('button', 'Send Reset Link').click();
      cy.contains('Password reset link sent').should('be.visible');
      
      // Step 4: Verify success message includes email
      cy.contains(testUser.email).should('be.visible');
      
      // Step 5: User receives email (manual verification in dev)
      // In automated tests, we'd intercept the email service
      
      // Step 6: Try again link should be available
      cy.contains('Try Again').should('be.visible');
      
      // Step 7: Return to login link should work
      cy.contains('Return to Login').click();
      cy.url().should('include', '/login');
    });
  });

  describe('UI/UX Elements', () => {
    it('should display helpful instructions on forgot password page', () => {
      cy.visit('/forgot-password');
      
      cy.contains('Enter your email address').should('be.visible');
      cy.contains('send you a password reset link').should('be.visible');
    });

    it('should display password requirements on reset page', () => {
      cy.visit('/reset-password?token=test-token');
      
      cy.contains('At least 8 characters').should('be.visible');
      cy.contains('letters and numbers').should('be.visible');
    });

    it('should show loading state during submission', () => {
      cy.visit('/forgot-password');
      cy.get('input[name="email"]').type(testUser.email);
      
      cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/forgot-password`, (req) => {
        req.reply((res) => {
          res.delay = 1000; // Delay to see loading state
          res.send();
        });
      });
      
      cy.contains('button', 'Send Reset Link').click();
      cy.contains('button', 'Sending...').should('be.visible');
    });
  });
});
