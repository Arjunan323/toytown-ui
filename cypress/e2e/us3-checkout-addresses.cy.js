/**
 * User Story 3 - E2E Tests: Checkout with Saved Addresses (T177)
 * Tests checkout flow using saved shipping addresses
 */

describe('US3: Checkout with Saved Addresses E2E Tests (T177)', () => {
  let testUser;

  beforeEach(() => {
    cy.setupApiIntercepts();
    
    // Register and login
    const timestamp = Date.now();
    testUser = {
      email: `checkoutaddr${timestamp}@example.com`,
      password: 'Test1234!',
      firstName: 'Checkout',
      lastName: 'Address',
      phoneNumber: '9876543210',
    };
    
    cy.register(testUser);
  });

  describe('Saved Address Selection', () => {
    it('should display saved addresses in checkout', () => {
      // Create a shipping address
      cy.visit('/profile');
      cy.get('[role="tab"]').contains('Addresses').click();
      cy.contains('button', 'Add New Address').click();
      
      cy.get('input[name="recipientName"]').type('John Doe');
      cy.get('input[name="addressLine1"]').type('123 Main St');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="postalCode"]').type('400001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      cy.contains('button', 'Save Address').click();
      cy.wait(1000);
      
      // Add item to cart and go to checkout
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      // Should display saved address
      cy.contains('John Doe').should('be.visible');
      cy.contains('123 Main St').should('be.visible');
    });

    it('should auto-select default address', () => {
      // Create default address
      cy.createShippingAddress({
        recipientName: 'Default Address',
        addressLine1: '456 Default Ave',
        isDefault: true,
      });
      
      // Go to checkout
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      // Default address should be selected
      cy.get('input[type="radio"]:checked').should('exist');
      cy.contains('Default Address').parent().find('input[type="radio"]').should('be.checked');
    });

    it('should allow selecting different saved address', () => {
      // Create multiple addresses
      cy.createShippingAddress({
        recipientName: 'Address One',
        addressLine1: '111 First St',
        isDefault: true,
      });
      
      cy.createShippingAddress({
        recipientName: 'Address Two',
        addressLine1: '222 Second St',
        isDefault: false,
      });
      
      // Go to checkout
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      // Select second address
      cy.contains('Address Two').parent().find('input[type="radio"]').click();
      
      // Should be selected
      cy.contains('Address Two').parent().find('input[type="radio"]').should('be.checked');
    });
  });

  describe('Add New Address During Checkout', () => {
    it('should allow adding new address during checkout', () => {
      // Go to checkout
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      // Click "Add New Address"
      cy.contains('button', 'Add New Address').click();
      
      // Form should appear
      cy.get('input[name="recipientName"]').should('be.visible');
      cy.get('input[name="recipientName"]').type('New Checkout Address');
      cy.get('input[name="addressLine1"]').type('789 Checkout St');
      cy.get('input[name="city"]').type('Delhi');
      cy.get('input[name="state"]').type('Delhi');
      cy.get('input[name="postalCode"]').type('110001');
      cy.get('input[name="phoneNumber"]').type('9876543210');
      
      cy.contains('button', 'Save Address').click();
      
      // New address should be added and auto-selected
      cy.contains('New Checkout Address').should('be.visible');
      cy.contains('New Checkout Address').parent().find('input[type="radio"]').should('be.checked');
    });

    it('should cancel adding new address', () => {
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      cy.contains('button', 'Add New Address').click();
      cy.get('input[name="recipientName"]').type('Should Not Save');
      
      cy.contains('button', 'Cancel').click();
      
      // Form should be hidden
      cy.get('input[name="recipientName"]').should('not.exist');
      cy.contains('Should Not Save').should('not.exist');
    });
  });

  describe('Order Creation with Selected Address', () => {
    it('should create order with selected shipping address', () => {
      // Create address
      cy.createShippingAddress({
        recipientName: 'Order Address Test',
        addressLine1: '999 Order St',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        phoneNumber: '9876543210',
      }).then((address) => {
        // Add to cart and checkout
        cy.visit('/products');
        cy.get('[data-testid="product-card"]').first().click();
        cy.contains('button', 'Add to Cart').click();
        cy.visit('/cart');
        cy.contains('button', 'Proceed to Checkout').click();
        
        // Address should be selected
        cy.contains('Order Address Test').should('be.visible');
        
        // Continue to review
        cy.contains('button', 'Continue').click();
        
        // Review page should show selected address
        cy.contains('Shipping Address').should('be.visible');
        cy.contains('Order Address Test').should('be.visible');
        cy.contains('999 Order St').should('be.visible');
        
        // Continue to payment
        cy.contains('button', 'Continue').click();
        
        // Mock payment and place order
        cy.mockRazorpayPayment();
        cy.contains('button', 'Place Order').click();
        
        // Should redirect to confirmation
        cy.url().should('include', '/orders/confirmation');
        
        // Confirmation should show shipping address
        cy.contains('Order Address Test').should('be.visible');
      });
    });

    it('should validate address selection before proceeding', () => {
      // Go to checkout without any addresses
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      // Try to continue without selecting address
      cy.contains('button', 'Continue').click();
      
      // Should show validation message
      cy.contains('Please select a shipping address').should('be.visible');
    });
  });

  describe('Address Display on Review Step', () => {
    it('should display selected address on order review', () => {
      cy.createShippingAddress({
        recipientName: 'Review Test',
        addressLine1: '555 Review Ave',
        addressLine2: 'Apt 10',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
        phoneNumber: '9876543210',
      });
      
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      // Select address and continue
      cy.contains('Review Test').parent().find('input[type="radio"]').click();
      cy.contains('button', 'Continue').click();
      
      // Should show all address details
      cy.contains('Review Test').should('be.visible');
      cy.contains('555 Review Ave').should('be.visible');
      cy.contains('Apt 10').should('be.visible');
      cy.contains('Pune, Maharashtra 411001').should('be.visible');
    });

    it('should allow changing address from review step', () => {
      cy.createShippingAddress({
        recipientName: 'Address Change',
        addressLine1: '111 Change St',
      });
      
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      cy.contains('button', 'Continue').click();
      
      // Click "Change" button on review page
      cy.contains('button', 'Change').click();
      
      // Should go back to address selection
      cy.contains('Select Shipping Address').should('be.visible');
    });
  });

  describe('Multiple Addresses Management in Checkout', () => {
    it('should display all saved addresses as options', () => {
      // Create 3 addresses
      const addresses = [
        { recipientName: 'Home Address', addressLine1: '111 Home St' },
        { recipientName: 'Work Address', addressLine1: '222 Work St' },
        { recipientName: 'Gift Address', addressLine1: '333 Gift St' },
      ];
      
      addresses.forEach((addr) => {
        cy.createShippingAddress(addr);
      });
      
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      // All addresses should be visible
      cy.contains('Home Address').should('be.visible');
      cy.contains('Work Address').should('be.visible');
      cy.contains('Gift Address').should('be.visible');
    });

    it('should highlight default address', () => {
      cy.createShippingAddress({
        recipientName: 'Default Highlighted',
        addressLine1: '777 Default Rd',
        isDefault: true,
      });
      
      cy.createShippingAddress({
        recipientName: 'Not Default',
        addressLine1: '888 Regular Rd',
        isDefault: false,
      });
      
      cy.visit('/products');
      cy.get('[data-testid="product-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.visit('/cart');
      cy.contains('button', 'Proceed to Checkout').click();
      
      // Default address should have badge
      cy.contains('Default Highlighted').parent().parent().should('contain', 'Default');
    });
  });

  describe('Order Confirmation Address Display', () => {
    it('should show shipping address on confirmation page', () => {
      cy.createShippingAddress({
        recipientName: 'Confirmation Test',
        addressLine1: '123 Confirm St',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500001',
      }).then((address) => {
        cy.visit('/products');
        cy.get('[data-testid="product-card"]').first().click();
        cy.contains('button', 'Add to Cart').click();
        cy.visit('/cart');
        cy.contains('button', 'Proceed to Checkout').click();
        
        cy.contains('button', 'Continue').click();
        cy.contains('button', 'Continue').click();
        
        cy.mockRazorpayPayment();
        cy.contains('button', 'Place Order').click();
        
        // Confirmation page should show address
        cy.contains('Confirmation Test').should('be.visible');
        cy.contains('123 Confirm St').should('be.visible');
        cy.contains('Hyderabad, Telangana 500001').should('be.visible');
      });
    });
  });
});
