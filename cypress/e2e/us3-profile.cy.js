/**
 * User Story 3 - E2E Tests: Profile Management (T171)
 * Tests profile viewing, editing, and validation
 */

describe('US3: Profile Management E2E Tests (T171)', () => {
  let testUser;

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    // Register and login a test user
    const timestamp = Date.now();
    testUser = {
      firstName: 'ProfileTest',
      lastName: 'User',
      email: `profile${timestamp}@example.com`,
      password: 'Test1234!',
      phoneNumber: '9876543210',
    };
    
    cy.register(testUser);
    cy.visit('/profile');
  });

  describe('Profile Page Access', () => {
    it('should navigate to profile page when logged in', () => {
      cy.url().should('include', '/profile');
      cy.contains('My Profile').should('be.visible');
    });

    it('should display user profile information', () => {
      // Check Personal Info tab is active by default
      cy.get('[role="tab"]').contains('Personal Info').should('have.attr', 'aria-selected', 'true');
      
      // Verify profile data is displayed
      cy.get('input[name="firstName"]').should('have.value', testUser.firstName);
      cy.get('input[name="lastName"]').should('have.value', testUser.lastName);
      cy.get('input[name="email"]').should('have.value', testUser.email);
      cy.get('input[name="email"]').should('be.disabled'); // Email is read-only
      cy.get('input[name="phoneNumber"]').should('have.value', testUser.phoneNumber);
    });

    it('should display registration date', () => {
      cy.contains('Member since').should('be.visible');
    });
  });

  describe('Profile Editing', () => {
    it('should enable edit mode for profile fields', () => {
      // Initially, fields should be in read-only mode
      cy.get('input[name="firstName"]').should('be.disabled');
      cy.get('input[name="lastName"]').should('be.disabled');
      cy.get('input[name="phoneNumber"]').should('be.disabled');
      
      // Click Edit button
      cy.contains('button', 'Edit').click();
      
      // Fields should now be editable
      cy.get('input[name="firstName"]').should('not.be.disabled');
      cy.get('input[name="lastName"]').should('not.be.disabled');
      cy.get('input[name="phoneNumber"]').should('not.be.disabled');
      
      // Save and Cancel buttons should be visible
      cy.contains('button', 'Save').should('be.visible');
      cy.contains('button', 'Cancel').should('be.visible');
    });

    it('should update firstName successfully', () => {
      cy.contains('button', 'Edit').click();
      
      const newFirstName = 'UpdatedFirst';
      cy.get('input[name="firstName"]').clear().type(newFirstName);
      cy.contains('button', 'Save').click();
      
      // Should show success message
      cy.contains('Profile updated successfully').should('be.visible');
      
      // Field should show new value
      cy.get('input[name="firstName"]').should('have.value', newFirstName);
      
      // Should be back in read-only mode
      cy.get('input[name="firstName"]').should('be.disabled');
    });

    it('should update lastName successfully', () => {
      cy.contains('button', 'Edit').click();
      
      const newLastName = 'UpdatedLast';
      cy.get('input[name="lastName"]').clear().type(newLastName);
      cy.contains('button', 'Save').click();
      
      cy.contains('Profile updated successfully').should('be.visible');
      cy.get('input[name="lastName"]').should('have.value', newLastName);
    });

    it('should update phoneNumber successfully', () => {
      cy.contains('button', 'Edit').click();
      
      const newPhone = '9999888877';
      cy.get('input[name="phoneNumber"]').clear().type(newPhone);
      cy.contains('button', 'Save').click();
      
      cy.contains('Profile updated successfully').should('be.visible');
      cy.get('input[name="phoneNumber"]').should('have.value', newPhone);
    });

    it('should cancel edit and revert changes', () => {
      const originalFirstName = testUser.firstName;
      
      cy.contains('button', 'Edit').click();
      cy.get('input[name="firstName"]').clear().type('ShouldNotSave');
      cy.contains('button', 'Cancel').click();
      
      // Should revert to original value
      cy.get('input[name="firstName"]').should('have.value', originalFirstName);
      cy.get('input[name="firstName"]').should('be.disabled');
    });
  });

  describe('Profile Validation', () => {
    beforeEach(() => {
      cy.contains('button', 'Edit').click();
    });

    it('should validate required firstName', () => {
      cy.get('input[name="firstName"]').clear();
      cy.contains('button', 'Save').click();
      
      cy.contains('First name is required').should('be.visible');
    });

    it('should validate required lastName', () => {
      cy.get('input[name="lastName"]').clear();
      cy.contains('button', 'Save').click();
      
      cy.contains('Last name is required').should('be.visible');
    });

    it('should validate phone number format', () => {
      cy.get('input[name="phoneNumber"]').clear().type('123');
      cy.contains('button', 'Save').click();
      
      cy.contains('Phone number must be 10 digits').should('be.visible');
    });
  });

  describe('Profile Tabs Navigation', () => {
    it('should switch to Addresses tab', () => {
      cy.get('[role="tab"]').contains('Addresses').click();
      cy.get('[role="tabpanel"]').should('contain', 'Shipping Addresses');
    });

    it('should switch to Order History tab', () => {
      cy.get('[role="tab"]').contains('Order History').click();
      cy.get('[role="tabpanel"]').should('contain', 'Your Orders');
    });

    it('should switch to My Reviews tab', () => {
      cy.get('[role="tab"]').contains('My Reviews').click();
      cy.get('[role="tabpanel"]').should('contain', 'Your Reviews');
    });
  });

  describe('Profile Persistence', () => {
    it('should persist changes across page reloads', () => {
      // Update profile
      cy.contains('button', 'Edit').click();
      const newFirstName = 'PersistTest';
      cy.get('input[name="firstName"]').clear().type(newFirstName);
      cy.contains('button', 'Save').click();
      cy.contains('Profile updated successfully').should('be.visible');
      
      // Reload page
      cy.reload();
      
      // Changes should still be visible
      cy.get('input[name="firstName"]').should('have.value', newFirstName);
    });

    it('should persist changes across logout/login', () => {
      // Update profile
      cy.contains('button', 'Edit').click();
      const newLastName = 'PersistLogout';
      cy.get('input[name="lastName"]').clear().type(newLastName);
      cy.contains('button', 'Save').click();
      cy.wait(1000);
      
      // Logout
      cy.get('[data-testid="user-menu"]').click();
      cy.contains('Logout').click();
      
      // Login again
      cy.visit('/login');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      // Navigate to profile
      cy.visit('/profile');
      
      // Changes should still be visible
      cy.get('input[name="lastName"]').should('have.value', newLastName);
    });
  });

  describe('Unauthorized Access Prevention', () => {
    it('should redirect to login if not authenticated', () => {
      // Logout
      cy.logout();
      
      // Try to access profile page
      cy.visit('/profile');
      
      // Should redirect to login page
      cy.url().should('include', '/login');
    });
  });
});
