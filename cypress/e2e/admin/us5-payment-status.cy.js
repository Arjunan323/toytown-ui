/**
 * E2E Test: Payment Status Updates
 */

describe('US5: Payment Status Updates', () => {
  const adminUser = { email: 'admin@toytown.com', password: 'Admin@123' };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginAsAdmin(adminUser.email, adminUser.password);
    cy.visit('/admin/orders');
  });

  it('should update payment status to CONFIRMED', () => {
    cy.get('table tbody tr').contains('[data-testid="payment-chip"]', 'PENDING')
      .parents('tr').find('[data-testid="update-payment-btn"]').click();

    cy.get('[data-testid="payment-status-select"]').click();
    cy.contains('li', 'CONFIRMED').click();
    cy.contains('button', 'Update').click();

    cy.contains('successfully').should('be.visible');
  });

  it('should prevent shipping before payment confirmation', () => {
    cy.get('table tbody tr').contains('[data-testid="payment-chip"]', 'PENDING')
      .parents('tr').find('[data-testid="update-status-btn"]').click();

    cy.get('[data-testid="status-select"]').click();
    cy.contains('li', 'SHIPPED').click();
    cy.get('[data-testid="tracking-number"]').type('TRACK123');
    cy.contains('button', 'Update').click();

    cy.contains('payment must be confirmed', { matchCase: false }).should('be.visible');
  });

  it('should process refund', () => {
    cy.get('table tbody tr').contains('[data-testid="payment-chip"]', 'CONFIRMED')
      .parents('tr').find('[data-testid="update-payment-btn"]').click();

    cy.get('[data-testid="payment-status-select"]').click();
    cy.contains('li', 'REFUNDED').click();
    cy.contains('button', 'Update').click();

    cy.contains('successfully').should('be.visible');
  });

  it('should disable payment update for CONFIRMED status', () => {
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr:contains("CONFIRMED")').length > 0) {
        cy.get('table tbody tr').contains('[data-testid="payment-chip"]', 'CONFIRMED')
          .parents('tr').find('[data-testid="update-payment-btn"]')
          .should('be.disabled');
      }
    });
  });
});
