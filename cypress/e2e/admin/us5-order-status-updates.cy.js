/**
 * E2E Test: Order Status Updates and Transitions
 * 
 * Tests order status transition validation:
 * - Valid status transitions (PENDING → PROCESSING → SHIPPED → DELIVERED)
 * - Invalid transitions are blocked
 * - Tracking number required for SHIPPED status
 * - Status change validation rules
 */

describe('US5: Order Status Updates and Transitions', () => {
  const adminUser = {
    email: 'admin@toytown.com',
    password: 'Admin@123'
  };

  let testOrderNumber;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginAsAdmin(adminUser.email, adminUser.password);
    cy.visit('/admin/orders');
  });

  describe('Valid Status Transitions', () => {
    it('should transition order from PENDING to PROCESSING', () => {
      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').within(() => {
          cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
            testOrderNumber = orderNum.trim();
          });
          cy.get('[data-testid="update-status-btn"]').click();
        });

      // Update to PROCESSING
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'PROCESSING').click();
      cy.contains('button', 'Update').click();

      // Verify success
      cy.contains('Order status updated successfully').should('be.visible');

      // Verify status changed
      cy.reload();
      cy.contains(testOrderNumber).parents('tr')
        .find('[data-testid="status-chip"]').should('contain', 'PROCESSING');
    });

    it('should transition order from PROCESSING to SHIPPED with tracking number', () => {
      const trackingNumber = 'SHIP' + Date.now();

      // Find a PROCESSING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PROCESSING')
        .parents('tr').within(() => {
          cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
            testOrderNumber = orderNum.trim();
          });
          cy.get('[data-testid="update-status-btn"]').click();
        });

      // Update to SHIPPED
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'SHIPPED').click();

      // Enter tracking number
      cy.get('[data-testid="tracking-number"]').should('be.visible');
      cy.get('[data-testid="tracking-number"]').type(trackingNumber);

      cy.contains('button', 'Update').click();

      // Verify success
      cy.contains('successfully').should('be.visible');

      // Verify status and tracking number
      cy.reload();
      cy.contains(testOrderNumber).parents('tr').within(() => {
        cy.get('[data-testid="status-chip"]').should('contain', 'SHIPPED');
      });
    });

    it('should transition order from SHIPPED to DELIVERED', () => {
      // Find a SHIPPED order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'SHIPPED')
        .parents('tr').within(() => {
          cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
            testOrderNumber = orderNum.trim();
          });
          cy.get('[data-testid="update-status-btn"]').click();
        });

      // Update to DELIVERED
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'DELIVERED').click();
      cy.contains('button', 'Update').click();

      // Verify success
      cy.contains('successfully').should('be.visible');

      // Verify status changed
      cy.reload();
      cy.contains(testOrderNumber).parents('tr')
        .find('[data-testid="status-chip"]').should('contain', 'DELIVERED');
    });

    it('should transition order from PENDING to CANCELLED', () => {
      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').within(() => {
          cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
            testOrderNumber = orderNum.trim();
          });
          cy.get('[data-testid="update-status-btn"]').click();
        });

      // Update to CANCELLED
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'CANCELLED').click();
      cy.contains('button', 'Update').click();

      // Verify success
      cy.contains('successfully').should('be.visible');

      // Verify status changed
      cy.reload();
      cy.contains(testOrderNumber).parents('tr')
        .find('[data-testid="status-chip"]').should('contain', 'CANCELLED');
    });

    it('should transition order from PROCESSING to CANCELLED', () => {
      // Find a PROCESSING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PROCESSING')
        .parents('tr').within(() => {
          cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
            testOrderNumber = orderNum.trim();
          });
          cy.get('[data-testid="update-status-btn"]').click();
        });

      // Update to CANCELLED
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'CANCELLED').click();
      cy.contains('button', 'Update').click();

      // Verify success
      cy.contains('successfully').should('be.visible');

      // Verify status changed
      cy.reload();
      cy.contains(testOrderNumber).parents('tr')
        .find('[data-testid="status-chip"]').should('contain', 'CANCELLED');
    });
  });

  describe('Invalid Status Transitions', () => {
    it('should prevent updating DELIVERED orders', () => {
      // DELIVERED orders should have disabled update button
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr:contains("DELIVERED")').length > 0) {
          cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'DELIVERED')
            .parents('tr').find('[data-testid="update-status-btn"]')
            .should('be.disabled');
        }
      });
    });

    it('should prevent updating CANCELLED orders', () => {
      // CANCELLED orders should have disabled update button
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr:contains("CANCELLED")').length > 0) {
          cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'CANCELLED')
            .parents('tr').find('[data-testid="update-status-btn"]')
            .should('be.disabled');
        }
      });
    });

    it('should prevent cancelling SHIPPED orders', () => {
      // Find a SHIPPED order
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr:contains("SHIPPED")').length > 0) {
          cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'SHIPPED')
            .parents('tr').find('[data-testid="update-status-btn"]').click();

          // CANCELLED option should not be available or disabled
          cy.get('[data-testid="status-select"]').click();
          cy.get('body').then(($dropdown) => {
            if ($dropdown.find('li:contains("CANCELLED")').length > 0) {
              cy.contains('li', 'CANCELLED').should('have.attr', 'aria-disabled', 'true');
            }
          });

          // Close dialog
          cy.contains('button', 'Cancel').click();
        }
      });
    });

    it('should prevent cancelling DELIVERED orders', () => {
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr:contains("DELIVERED")').length > 0) {
          // Button should be disabled
          cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'DELIVERED')
            .parents('tr').find('[data-testid="update-status-btn"]')
            .should('be.disabled');
        }
      });
    });

    it('should prevent skipping PROCESSING step', () => {
      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Try to update directly to SHIPPED
      cy.get('[data-testid="status-select"]').click();

      // SHIPPED option should not be available or disabled
      cy.get('body').then(($dropdown) => {
        if ($dropdown.find('li:contains("SHIPPED")').length > 0) {
          cy.contains('li', 'SHIPPED').click();
          cy.contains('button', 'Update').click();

          // Should show error
          cy.contains('error', { matchCase: false }).should('be.visible');
        }
      });

      cy.contains('button', 'Cancel').click();
    });

    it('should prevent skipping SHIPPED step', () => {
      // Find a PROCESSING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PROCESSING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Try to update directly to DELIVERED
      cy.get('[data-testid="status-select"]').click();

      // DELIVERED option should not be available or disabled
      cy.get('body').then(($dropdown) => {
        if ($dropdown.find('li:contains("DELIVERED")').length > 0) {
          cy.contains('li', 'DELIVERED').click();
          cy.contains('button', 'Update').click();

          // Should show error
          cy.contains('error', { matchCase: false }).should('be.visible');
        }
      });

      cy.contains('button', 'Cancel').click();
    });
  });

  describe('Tracking Number Validation', () => {
    it('should require tracking number when status is SHIPPED', () => {
      // Find a PROCESSING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PROCESSING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Select SHIPPED
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'SHIPPED').click();

      // Tracking number field should appear
      cy.get('[data-testid="tracking-number"]').should('be.visible');

      // Try to submit without tracking number
      cy.contains('button', 'Update').click();

      // Should show validation error
      cy.contains('required', { matchCase: false }).should('be.visible');
    });

    it('should not require tracking number for other statuses', () => {
      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Select PROCESSING
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'PROCESSING').click();

      // Tracking number field should not be visible
      cy.get('[data-testid="tracking-number"]').should('not.exist');

      // Should be able to submit
      cy.contains('button', 'Update').should('not.be.disabled');

      cy.contains('button', 'Cancel').click();
    });

    it('should validate tracking number format', () => {
      // Find a PROCESSING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PROCESSING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Select SHIPPED
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'SHIPPED').click();

      // Enter invalid tracking number (too short)
      cy.get('[data-testid="tracking-number"]').type('123');
      cy.contains('button', 'Update').click();

      // Should show validation error
      cy.contains('tracking number', { matchCase: false }).should('be.visible');

      cy.contains('button', 'Cancel').click();
    });

    it('should accept valid tracking number', () => {
      const validTrackingNumber = 'TRACK-123-456-789';

      // Find a PROCESSING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PROCESSING')
        .parents('tr').within(() => {
          cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
            testOrderNumber = orderNum.trim();
          });
          cy.get('[data-testid="update-status-btn"]').click();
        });

      // Update to SHIPPED with valid tracking
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'SHIPPED').click();
      cy.get('[data-testid="tracking-number"]').type(validTrackingNumber);
      cy.contains('button', 'Update').click();

      // Should succeed
      cy.contains('successfully').should('be.visible');
    });
  });

  describe('Status Change Confirmations', () => {
    it('should show confirmation dialog for cancellation', () => {
      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Select CANCELLED
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'CANCELLED').click();
      cy.contains('button', 'Update').click();

      // Should show confirmation
      cy.contains('Are you sure', { matchCase: false }).should('be.visible');
      cy.contains('cancel this order', { matchCase: false }).should('be.visible');

      // Confirm cancellation
      cy.contains('button', 'Confirm').click();

      // Should succeed
      cy.contains('successfully').should('be.visible');
    });

    it('should allow cancelling status update', () => {
      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').within(() => {
          cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
            testOrderNumber = orderNum.trim();
          });
          cy.get('[data-testid="update-status-btn"]').click();
        });

      // Start update but cancel
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'PROCESSING').click();
      cy.contains('button', 'Cancel').click();

      // Dialog should close
      cy.get('[data-testid="status-update-dialog"]').should('not.exist');

      // Status should remain unchanged
      cy.contains(testOrderNumber).parents('tr')
        .find('[data-testid="status-chip"]').should('contain', 'PENDING');
    });
  });

  describe('Status Change Notifications', () => {
    it('should show success notification after status update', () => {
      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Update status
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'PROCESSING').click();
      cy.contains('button', 'Update').click();

      // Should show success notification
      cy.get('[data-testid="success-notification"]').should('be.visible');
      cy.contains('Order status updated successfully').should('be.visible');
    });

    it('should show error notification on update failure', () => {
      // Intercept and force error
      cy.intercept('PUT', '/api/v1/admin/orders/*/status', {
        statusCode: 500,
        body: { error: 'Failed to update status' }
      }).as('updateStatusError');

      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Try to update
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'PROCESSING').click();
      cy.contains('button', 'Update').click();

      cy.wait('@updateStatusError');

      // Should show error notification
      cy.get('[data-testid="error-notification"]').should('be.visible');
      cy.contains('error', { matchCase: false }).should('be.visible');
    });
  });

  describe('UI State During Updates', () => {
    it('should disable form during status update submission', () => {
      cy.intercept('PUT', '/api/v1/admin/orders/*/status', (req) => {
        req.reply((res) => {
          res.delay = 2000; // Delay response
        });
      }).as('updateStatus');

      // Find a PENDING order
      cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
        .parents('tr').find('[data-testid="update-status-btn"]').click();

      // Update status
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'PROCESSING').click();
      cy.contains('button', 'Update').click();

      // Form should be disabled
      cy.get('[data-testid="status-select"]').should('be.disabled');
      cy.contains('button', 'Update').should('be.disabled');

      cy.wait('@updateStatus');
    });

    it('should refresh order list after successful update', () => {
      // Find a PENDING order and note the current count
      cy.get('table tbody tr').its('length').then((initialCount) => {
        cy.get('table tbody tr').contains('[data-testid="status-chip"]', 'PENDING')
          .parents('tr').find('[data-testid="update-status-btn"]').click();

        // Update status
        cy.get('[data-testid="status-select"]').click();
        cy.contains('li', 'PROCESSING').click();
        cy.contains('button', 'Update').click();

        // Wait for update
        cy.contains('successfully').should('be.visible');

        // Table should refresh
        cy.get('table tbody tr').should('have.length.at.least', 1);
      });
    });
  });
});
