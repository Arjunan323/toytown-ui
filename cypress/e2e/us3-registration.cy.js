/**
 * User Story 3 - E2E Tests: Registration Flow (T170)
 * Tests registration form validation, account creation, and auto-login
 */

describe('US3: Registration Flow E2E Tests (T170)', () => {
  beforeEach(() => {
    cy.setupApiIntercepts();
    cy.visit('/register');
  });

  describe('Registration Form Validation', () => {
    it('should display validation errors for empty fields', () => {
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.contains('First name is required').should('be.visible');
      cy.contains('Last name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="email"]').blur();
      
      // Should show email format error
      cy.contains('Please enter a valid email').should('be.visible');
    });

    it('should validate password strength (min 8 chars, letters + numbers)', () => {
      // Test weak password (too short)
      cy.get('input[name="password"]').type('Test1');
      cy.get('input[name="password"]').blur();
      cy.contains('Password must be at least 8 characters').should('be.visible');
      
      // Clear and test password without numbers
      cy.get('input[name="password"]').clear().type('TestTest');
      cy.get('input[name="password"]').blur();
      cy.contains('Password must contain at least one number').should('be.visible');
      
      // Clear and test password without letters
      cy.get('input[name="password"]').clear().type('12345678');
      cy.get('input[name="password"]').blur();
      cy.contains('Password must contain at least one letter').should('be.visible');
    });

    it('should validate password match', () => {
      cy.get('input[name="password"]').type('Test1234');
      cy.get('input[name="confirmPassword"]').type('Test5678');
      cy.get('input[name="confirmPassword"]').blur();
      
      // Should show password mismatch error
      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should validate phone number format', () => {
      cy.get('input[name="phoneNumber"]').type('123');
      cy.get('input[name="phoneNumber"]').blur();
      
      // Should show phone format error
      cy.contains('Phone number must be 10 digits').should('be.visible');
    });
  });

  describe('Successful Registration', () => {
    it('should register a new user and auto-login', () => {
      const timestamp = Date.now();
      const testUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe${timestamp}@example.com`,
        password: 'Test1234!',
        phoneNumber: '9876543210',
      };
      
      // Fill in valid registration data
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="confirmPassword"]').type(testUser.password);
      cy.get('input[name="phoneNumber"]').type(testUser.phoneNumber);
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to home page
      cy.url().should('not.include', '/register');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // JWT token should be stored in localStorage
      cy.window().then((win) => {
        const accessToken = win.localStorage.getItem('accessToken');
        const customer = JSON.parse(win.localStorage.getItem('customer') || '{}');
        
        expect(accessToken).to.exist;
        expect(accessToken).to.not.be.empty;
        expect(customer.email).to.equal(testUser.email);
        expect(customer.firstName).to.equal(testUser.firstName);
        expect(customer.lastName).to.equal(testUser.lastName);
      });
      
      // User should be logged in (check header)
      cy.get('[data-testid="user-menu"]').should('exist');
      cy.get('[data-testid="user-menu"]').should('contain', testUser.email);
    });

    it('should prevent duplicate email registration', () => {
      const timestamp = Date.now();
      const testUser = {
        firstName: 'Duplicate',
        lastName: 'User',
        email: `duplicate${timestamp}@example.com`,
        password: 'Test1234!',
        phoneNumber: '9876543210',
      };
      
      // Register first time
      cy.register(testUser);
      
      // Try to register again with same email
      cy.visit('/register');
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="confirmPassword"]').type(testUser.password);
      cy.get('input[name="phoneNumber"]').type(testUser.phoneNumber);
      cy.get('button[type="submit"]').click();
      
      // Should show error message about duplicate email
      cy.contains('Email already exists').should('be.visible');
    });
  });

  describe('Navigation and Links', () => {
    it('should have link to login page for existing users', () => {
      cy.contains('Already have an account?').should('be.visible');
      cy.contains('Sign in').click();
      
      // Should navigate to login page
      cy.url().should('include', '/login');
    });

    it('should display OAuth options (Google, Facebook)', () => {
      // Check for OAuth buttons (placeholders in current implementation)
      cy.contains('Sign up with Google').should('be.visible');
      cy.contains('Sign up with Facebook').should('be.visible');
    });
  });

  describe('Registration Form UX', () => {
    it('should show/hide password visibility toggle', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      
      // Click visibility toggle
      cy.get('[data-testid="password-visibility-toggle"]').first().click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
      
      // Click again to hide
      cy.get('[data-testid="password-visibility-toggle"]').first().click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });

    it('should have Terms of Service and Privacy Policy links', () => {
      cy.contains('Terms of Service').should('be.visible');
      cy.contains('Privacy Policy').should('be.visible');
    });
  });
});
