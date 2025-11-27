describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    // Setup API intercepts
    cy.setupApiIntercepts();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit('/register');
      
      const timestamp = Date.now();
      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `testuser${timestamp}@example.com`,
        password: 'Test123!',
        phoneNumber: '+919876543210'
      };
      
      // Fill in registration form
      cy.get('[name="firstName"]').type(testUser.firstName);
      cy.get('[name="lastName"]').type(testUser.lastName);
      cy.get('[name="email"]').type(testUser.email);
      cy.get('[name="password"]').type(testUser.password);
      cy.get('[name="phoneNumber"]').type(testUser.phoneNumber);
      
      // Submit form
      cy.get('[type="submit"]').click();
      
      // Should redirect to homepage after successful registration
      cy.url().should('include', '/');
      
      // Should be logged in
      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.exist;
      });
    });
  });

  describe('User Login', () => {
    it('should login after registration', () => {
      // First register a new user
      const timestamp = Date.now();
      const testUser = {
        firstName: 'Login',
        lastName: 'Test',
        email: `logintest${timestamp}@example.com`,
        password: 'Test123!',
        phoneNumber: '+919876543211'
      };
      
      cy.register(testUser);
      
      // Logout
      cy.logout();
      
      // Now login with the same credentials
      cy.visit('/login');
      cy.login(testUser.email, testUser.password);
      
      // Should redirect to homepage
      cy.url().should('include', '/');
      
      // Should display user name in header
      cy.get('[data-testid="user-name"]').should('contain', testUser.firstName);
    });

    it('should show error with invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('[name="email"]').type('invalid@example.com');
      cy.get('[name="password"]').type('wrongpassword');
      cy.get('[type="submit"]').click();
      
      // Should display error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid');
    });

    it('should logout successfully', () => {
      // Register and login first
      const timestamp = Date.now();
      const testUser = {
        email: `logouttest${timestamp}@example.com`,
        password: 'Test123!',
        firstName: 'Logout',
        lastName: 'Test'
      };
      
      cy.register(testUser);
      
      // Click logout
      cy.get('[data-testid="logout-button"]').click();
      
      // Should redirect to login page
      cy.url().should('include', '/login');
      
      // Token should be removed
      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.not.exist;
      });
    });
  });
});
