/**
 * User Story 3 - E2E Tests: Shipping Address Management (T172)
 * Tests address CRUD operations and default address logic
 */

describe('US3: Shipping Address Management E2E Tests (T172)', () => {
  let testUser;

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    // Register and login a test user
    const timestamp = Date.now();
    testUser = {
      firstName: 'AddressTest',
      lastName: 'User',
      email: `address${timestamp}@example.com`,
      password: 'Test1234!',
      phoneNumber: '9876543210',
    };
    
    cy.register(testUser);
    cy.visit('/profile');
    
    // Navigate to Addresses tab
    cy.get('[role="tab"]').contains('Addresses').click();
  });

  describe('Add New Address', () => {
    it('should display "Add New Address" button', () => {
      cy.contains('button', 'Add New Address').should('be.visible');
    });

    it('should open address form when clicking "Add New Address"', () => {
      cy.contains('button', 'Add New Address').click();
      
      // Form should be visible
      cy.get('input[name="recipientName"]').should('be.visible');
      cy.get('input[name="addressLine1"]').should('be.visible');
      cy.get('input[name="city"]').should('be.visible');
      cy.get('input[name="state"]').should('be.visible');
      cy.get('input[name="postalCode"]').should('be.visible');
      cy.get('input[name="phoneNumber"]').should('be.visible');
    });

    it('should create a new shipping address successfully', () => {
      cy.contains('button', 'Add New Address').click();
      
      const address = {
        recipientName: 'John Doe',
        addressLine1: '123 Main Street',
        addressLine2: 'Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        phoneNumber: '9876543210',
      };
      
      // Fill in address form
      cy.get('input[name="recipientName"]').type(address.recipientName);
      cy.get('input[name="addressLine1"]').type(address.addressLine1);
      cy.get('input[name="addressLine2"]').type(address.addressLine2);
      cy.get('input[name="city"]').type(address.city);
      cy.get('input[name="state"]').type(address.state);
      cy.get('input[name="postalCode"]').type(address.postalCode);
      cy.get('input[name="country"]').clear().type(address.country);
      cy.get('input[name="phoneNumber"]').type(address.phoneNumber);
      
      // Submit form
      cy.contains('button', 'Save Address').click();
      
      // Success message
      cy.contains('Address added successfully').should('be.visible');
      
      // Address should appear in the list
      cy.contains(address.recipientName).should('be.visible');
      cy.contains(address.addressLine1).should('be.visible');
      cy.contains(`${address.city}, ${address.state} ${address.postalCode}`).should('be.visible');
    });

    it('should mark first address as default automatically', () => {
      cy.contains('button', 'Add New Address').click();
      
      cy.get('input[name="recipientName"]').type('First Address');
      cy.get('input[name="addressLine1"]').type('123 First St');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="postalCode"]').type('400001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      
      cy.contains('button', 'Save Address').click();
      
      // Should show "Default" badge
      cy.contains('Default').should('be.visible');
    });
  });

  describe('Address Validation', () => {
    beforeEach(() => {
      cy.contains('button', 'Add New Address').click();
    });

    it('should validate required fields', () => {
      cy.contains('button', 'Save Address').click();
      
      cy.contains('Recipient name is required').should('be.visible');
      cy.contains('Address line 1 is required').should('be.visible');
      cy.contains('City is required').should('be.visible');
      cy.contains('State is required').should('be.visible');
      cy.contains('Postal code is required').should('be.visible');
      cy.contains('Phone number is required').should('be.visible');
    });

    it('should validate postal code format (5 or 9 digits)', () => {
      cy.get('input[name="postalCode"]').type('123');
      cy.get('input[name="postalCode"]').blur();
      
      cy.contains('Postal code must be 5 or 9 digits').should('be.visible');
    });

    it('should validate phone number (10 digits)', () => {
      cy.get('input[name="phoneNumber"]').type('123');
      cy.get('input[name="phoneNumber"]').blur();
      
      cy.contains('Phone number must be 10 digits').should('be.visible');
    });
  });

  describe('Edit Address', () => {
    beforeEach(() => {
      // Create an address first
      cy.contains('button', 'Add New Address').click();
      cy.get('input[name="recipientName"]').type('Edit Test');
      cy.get('input[name="addressLine1"]').type('456 Edit St');
      cy.get('input[name="city"]').type('Pune');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="postalCode"]').type('411001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      cy.contains('button', 'Save Address').click();
      cy.wait(1000);
    });

    it('should open edit dialog when clicking edit icon', () => {
      cy.get('[data-testid="edit-address-button"]').first().click();
      
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Edit Address').should('be.visible');
    });

    it('should update address successfully', () => {
      cy.get('[data-testid="edit-address-button"]').first().click();
      
      // Update recipient name
      cy.get('input[name="recipientName"]').clear().type('Updated Name');
      cy.get('input[name="city"]').clear().type('Delhi');
      
      cy.contains('button', 'Save').click();
      
      cy.contains('Address updated successfully').should('be.visible');
      cy.contains('Updated Name').should('be.visible');
      cy.contains('Delhi').should('be.visible');
    });
  });

  describe('Delete Address', () => {
    beforeEach(() => {
      // Create an address first
      cy.contains('button', 'Add New Address').click();
      cy.get('input[name="recipientName"]').type('Delete Test');
      cy.get('input[name="addressLine1"]').type('789 Delete St');
      cy.get('input[name="city"]').type('Bangalore');
      cy.get('input[name="state"]').type('Karnataka');
      cy.get('input[name="postalCode"]').type('560001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      cy.contains('button', 'Save Address').click();
      cy.wait(1000);
    });

    it('should show confirmation dialog before deleting', () => {
      cy.get('[data-testid="delete-address-button"]').first().click();
      
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Delete Address').should('be.visible');
      cy.contains('Are you sure').should('be.visible');
    });

    it('should delete address after confirmation', () => {
      cy.get('[data-testid="delete-address-button"]').first().click();
      cy.contains('button', 'Delete').click();
      
      cy.contains('Address deleted successfully').should('be.visible');
      cy.contains('Delete Test').should('not.exist');
    });

    it('should cancel delete operation', () => {
      cy.get('[data-testid="delete-address-button"]').first().click();
      cy.contains('button', 'Cancel').click();
      
      // Address should still exist
      cy.contains('Delete Test').should('be.visible');
    });
  });

  describe('Default Address Logic', () => {
    it('should set an address as default', () => {
      // Create two addresses
      cy.contains('button', 'Add New Address').click();
      cy.get('input[name="recipientName"]').type('First Address');
      cy.get('input[name="addressLine1"]').type('111 First St');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="postalCode"]').type('400001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      cy.contains('button', 'Save Address').click();
      cy.wait(1000);
      
      cy.contains('button', 'Add New Address').click();
      cy.get('input[name="recipientName"]').type('Second Address');
      cy.get('input[name="addressLine1"]').type('222 Second St');
      cy.get('input[name="city"]').type('Pune');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="postalCode"]').type('411001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      cy.contains('button', 'Save Address').click();
      cy.wait(1000);
      
      // Click "Set as Default" on second address
      cy.contains('Second Address')
        .parent()
        .parent()
        .find('[data-testid="set-default-button"]')
        .click();
      
      cy.contains('Default address updated').should('be.visible');
      
      // Second address should now have Default badge
      cy.contains('Second Address')
        .parent()
        .parent()
        .should('contain', 'Default');
    });

    it('should ensure only one default address exists', () => {
      // Create two addresses and set both as default
      cy.contains('button', 'Add New Address').click();
      cy.get('input[name="recipientName"]').type('Address One');
      cy.get('input[name="addressLine1"]').type('111 One St');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="postalCode"]').type('400001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      cy.contains('button', 'Save Address').click();
      cy.wait(1000);
      
      cy.contains('button', 'Add New Address').click();
      cy.get('input[name="recipientName"]').type('Address Two');
      cy.get('input[name="addressLine1"]').type('222 Two St');
      cy.get('input[name="city"]').type('Pune');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="postalCode"]').type('411001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      cy.contains('button', 'Save Address').click();
      cy.wait(1000);
      
      // Set second as default
      cy.contains('Address Two')
        .parent()
        .parent()
        .find('[data-testid="set-default-button"]')
        .click();
      cy.wait(1000);
      
      // Only one "Default" badge should exist
      cy.get('body').then(($body) => {
        const defaultBadges = $body.find(':contains("Default")').length;
        expect(defaultBadges).to.equal(1);
      });
    });
  });

  describe('Address List Display', () => {
    it('should display empty state when no addresses', () => {
      cy.contains('No addresses saved yet').should('be.visible');
      cy.contains('Add your first shipping address').should('be.visible');
    });

    it('should display all address fields correctly', () => {
      cy.contains('button', 'Add New Address').click();
      
      const address = {
        recipientName: 'Display Test',
        addressLine1: '123 Display Ave',
        addressLine2: 'Suite 100',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600001',
        phoneNumber: '9876543210',
      };
      
      cy.get('input[name="recipientName"]').type(address.recipientName);
      cy.get('input[name="addressLine1"]').type(address.addressLine1);
      cy.get('input[name="addressLine2"]').type(address.addressLine2);
      cy.get('input[name="city"]').type(address.city);
      cy.get('input[name="state"]').type(address.state);
      cy.get('input[name="postalCode"]').type(address.postalCode);
      cy.get('input[name="phoneNumber"]').type(address.phoneNumber);
      cy.contains('button', 'Save Address').click();
      cy.wait(1000);
      
      // All fields should be visible
      cy.contains(address.recipientName).should('be.visible');
      cy.contains(address.addressLine1).should('be.visible');
      cy.contains(address.addressLine2).should('be.visible');
      cy.contains(`${address.city}, ${address.state} ${address.postalCode}`).should('be.visible');
      cy.contains(`Phone: ${address.phoneNumber}`).should('be.visible');
    });
  });
});
