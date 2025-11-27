/**
 * T226: Admin Authentication E2E Tests
 * Tests admin login, logout, and authentication flow
 */

describe('Admin Authentication E2E Tests', () => {
  const ADMIN_LOGIN_URL = '/admin/login';
  const ADMIN_DASHBOARD_URL = '/admin/dashboard';
  
  const validAdmin = {
    username: 'admin',
    password: 'Admin@123'
  };

  beforeEach(() => {
    // Clear localStorage and cookies
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Admin Login Page', () => {
    beforeEach(() => {
      cy.visit(ADMIN_LOGIN_URL);
    });

    it('should display admin login form', () => {
      cy.get('h1, h2, h3, h4, h5, h6').should('contain', 'Admin Login');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should login with valid admin credentials', () => {
      // Fill in login form
      cy.get('input[name="username"]').type(validAdmin.username);
      cy.get('input[name="password"]').type(validAdmin.password);
      
      // Submit
      cy.get('button[type="submit"]').click();
      
      // Should redirect to admin dashboard
      cy.url().should('include', ADMIN_DASHBOARD_URL);
      
      // Should store admin token
      cy.window().then((win) => {
        expect(win.localStorage.getItem('adminAccessToken')).to.exist;
        expect(win.localStorage.getItem('adminUser')).to.exist;
      });
    });

    it('should show error with invalid username', () => {
      cy.get('input[name="username"]').type('invalidadmin');
      cy.get('input[name="password"]').type(validAdmin.password);
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains(/invalid|incorrect|unauthorized/i).should('be.visible');
      
      // Should remain on login page
      cy.url().should('include', ADMIN_LOGIN_URL);
    });

    it('should show error with invalid password', () => {
      cy.get('input[name="username"]').type(validAdmin.username);
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains(/invalid|incorrect|unauthorized/i).should('be.visible');
      
      // Should remain on login page
      cy.url().should('include', ADMIN_LOGIN_URL);
    });

    it('should require username', () => {
      cy.get('input[name="password"]').type(validAdmin.password);
      cy.get('button[type="submit"]').click();
      
      // Should show validation error or prevent submission
      cy.get('input[name="username"]').then(($input) => {
        expect($input[0].validationMessage).to.exist;
      });
    });

    it('should require password', () => {
      cy.get('input[name="username"]').type(validAdmin.username);
      cy.get('button[type="submit"]').click();
      
      // Should show validation error or prevent submission
      cy.get('input[name="password"]').then(($input) => {
        expect($input[0].validationMessage).to.exist;
      });
    });

    it('should toggle password visibility', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      
      // Find and click password visibility toggle
      cy.get('button[aria-label*="password"], button[title*="password"], svg[data-testid="VisibilityIcon"], svg[data-testid="VisibilityOffIcon"]')
        .first()
        .click();
      
      // Password should be visible
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    });
  });

  describe('Admin Logout', () => {
    beforeEach(() => {
      // Login first
      cy.visit(ADMIN_LOGIN_URL);
      cy.get('input[name="username"]').type(validAdmin.username);
      cy.get('input[name="password"]').type(validAdmin.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', ADMIN_DASHBOARD_URL);
    });

    it('should logout admin successfully', () => {
      // Click logout button (could be in header or sidebar)
      cy.contains('button, a', /logout/i).click();
      
      // Should redirect to admin login
      cy.url().should('include', ADMIN_LOGIN_URL);
      
      // Should clear admin tokens
      cy.window().then((win) => {
        expect(win.localStorage.getItem('adminAccessToken')).to.not.exist;
        expect(win.localStorage.getItem('adminUser')).to.not.exist;
      });
    });
  });

  describe('Protected Admin Routes', () => {
    it('should redirect to login when accessing admin dashboard without auth', () => {
      cy.visit(ADMIN_DASHBOARD_URL);
      
      // Should redirect to admin login
      cy.url().should('include', ADMIN_LOGIN_URL);
    });

    it('should redirect to login when accessing admin products without auth', () => {
      cy.visit('/admin/products');
      
      // Should redirect to admin login
      cy.url().should('include', ADMIN_LOGIN_URL);
    });

    it('should allow access to admin dashboard after login', () => {
      // Login
      cy.visit(ADMIN_LOGIN_URL);
      cy.get('input[name="username"]').type(validAdmin.username);
      cy.get('input[name="password"]').type(validAdmin.password);
      cy.get('button[type="submit"]').click();
      
      // Wait for redirect to dashboard
      cy.url().should('include', ADMIN_DASHBOARD_URL);
      
      // Dashboard should be accessible
      cy.contains(/dashboard|overview|statistics/i).should('be.visible');
    });

    it('should maintain authentication across page refreshes', () => {
      // Login
      cy.visit(ADMIN_LOGIN_URL);
      cy.get('input[name="username"]').type(validAdmin.username);
      cy.get('input[name="password"]').type(validAdmin.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', ADMIN_DASHBOARD_URL);
      
      // Refresh page
      cy.reload();
      
      // Should still be authenticated and on dashboard
      cy.url().should('include', ADMIN_DASHBOARD_URL);
      cy.window().then((win) => {
        expect(win.localStorage.getItem('adminAccessToken')).to.exist;
      });
    });
  });

  describe('Admin vs Customer Separation', () => {
    it('should not allow customer login on admin login page', () => {
      // Try logging in with customer credentials on admin page
      cy.visit(ADMIN_LOGIN_URL);
      cy.get('input[name="username"]').type('customer@test.com');
      cy.get('input[name="password"]').type('Customer123!');
      cy.get('button[type="submit"]').click();
      
      // Should fail (customers don't have username/password login in admin portal)
      cy.contains(/invalid|incorrect|unauthorized/i).should('be.visible');
      cy.url().should('include', ADMIN_LOGIN_URL);
    });

    it('should use separate token storage for admin', () => {
      // Login as admin
      cy.visit(ADMIN_LOGIN_URL);
      cy.get('input[name="username"]').type(validAdmin.username);
      cy.get('input[name="password"]').type(validAdmin.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', ADMIN_DASHBOARD_URL);
      
      // Check that admin tokens are separate from customer tokens
      cy.window().then((win) => {
        expect(win.localStorage.getItem('adminAccessToken')).to.exist;
        expect(win.localStorage.getItem('adminUser')).to.exist;
        
        // Customer tokens should not be set
        expect(win.localStorage.getItem('accessToken')).to.not.exist;
      });
    });
  });
});
