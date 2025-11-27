/**
 * E2E Test: Customer Order Tracking
 */

describe('US5: Customer Order Tracking', () => {
  const customerUser = { email: 'uarjunan97@gmail.com', password: 'Test@1234' };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should view order history', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(customerUser.email);
    cy.get('input[name="password"]').type(customerUser.password);
    cy.get('button[type="submit"]').click();

    cy.visit('/orders');
    cy.contains('Order History').should('be.visible');
    cy.get('.order-card').should('have.length.at.least', 1);
  });

  it('should display order status updates', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(customerUser.email);
    cy.get('input[name="password"]').type(customerUser.password);
    cy.get('button[type="submit"]').click();

    cy.visit('/orders');
    
    cy.get('.order-card').first().within(() => {
      cy.get('[data-testid="order-status"]').should('be.visible');
      cy.get('[data-testid="order-status"]').invoke('text')
        .should('match', /PENDING|PROCESSING|SHIPPED|DELIVERED|CANCELLED/);
    });
  });

  it('should display tracking number for shipped orders', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(customerUser.email);
    cy.get('input[name="password"]').type(customerUser.password);
    cy.get('button[type="submit"]').click();

    cy.visit('/orders');

    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="order-status"]:contains("SHIPPED")').length > 0) {
        cy.get('[data-testid="order-status"]').contains('SHIPPED')
          .parents('.order-card')
          .find('[data-testid="tracking-number"]').should('be.visible');
      }
    });
  });

  it('should show visual order timeline', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(customerUser.email);
    cy.get('input[name="password"]').type(customerUser.password);
    cy.get('button[type="submit"]').click();

    cy.visit('/orders');
    
    cy.get('.order-card').first().click();
    
    // Verify timeline steps
    cy.contains('Order Placed').should('be.visible');
    cy.contains('Processing').should('be.visible');
    cy.contains('Shipped').should('be.visible');
    cy.contains('Delivered').should('be.visible');
  });

  it('should auto-refresh order status (30s polling)', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(customerUser.email);
    cy.get('input[name="password"]').type(customerUser.password);
    cy.get('button[type="submit"]').click();

    cy.intercept('GET', '/api/v1/orders?*').as('getOrders');

    cy.visit('/orders');
    cy.wait('@getOrders');

    // Wait for auto-refresh (30 seconds)
    cy.wait(31000);
    cy.wait('@getOrders');
  });
});
