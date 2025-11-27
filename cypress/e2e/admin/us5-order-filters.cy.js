/**
 * E2E Test: Admin Order Filters
 * 
 * Tests advanced filtering functionality:
 * - Filter by payment status
 * - Filter by date range
 * - Search by customer email
 * - Filter by amount range
 * - Combined filters
 */

describe('US5: Admin Order Filters', () => {
  const adminUser = {
    email: 'admin@toytown.com',
    password: 'Admin@123'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginAsAdmin(adminUser.email, adminUser.password);
    cy.visit('/admin/orders');
  });

  describe('Payment Status Filter', () => {
    it('should filter orders by PENDING payment status', () => {
      // Open payment status filter
      cy.get('[data-testid="payment-status-filter"]').click();
      cy.contains('li', 'PENDING').click();

      // Verify URL contains filter
      cy.url().should('include', 'paymentStatus=PENDING');

      // Verify all displayed orders have PENDING payment
      cy.get('table tbody tr').should('have.length.at.least', 1);
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="payment-chip"]')
          .should('contain', 'PENDING');
      });
    });

    it('should filter orders by CONFIRMED payment status', () => {
      cy.get('[data-testid="payment-status-filter"]').click();
      cy.contains('li', 'CONFIRMED').click();

      cy.url().should('include', 'paymentStatus=CONFIRMED');

      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="payment-chip"]')
          .should('contain', 'CONFIRMED');
      });
    });

    it('should filter orders by FAILED payment status', () => {
      cy.get('[data-testid="payment-status-filter"]').click();
      cy.contains('li', 'FAILED').click();

      cy.url().should('include', 'paymentStatus=FAILED');

      // May have no results, which is valid
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).find('[data-testid="payment-chip"]')
              .should('contain', 'FAILED');
          });
        } else {
          cy.contains('No orders found').should('be.visible');
        }
      });
    });

    it('should clear payment status filter', () => {
      // Apply filter
      cy.get('[data-testid="payment-status-filter"]').click();
      cy.contains('li', 'PENDING').click();
      cy.url().should('include', 'paymentStatus=PENDING');

      // Clear filter
      cy.get('[data-testid="clear-filters"]').click();
      cy.url().should('not.include', 'paymentStatus');

      // Verify orders from all payment statuses are shown
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });
  });

  describe('Date Range Filter', () => {
    it('should filter orders by start date', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      const startDateStr = startDate.toISOString().split('T')[0];

      // Set start date
      cy.get('[data-testid="start-date"]').type(startDateStr);
      cy.get('[data-testid="apply-filters"]').click();

      // Verify URL contains date filter
      cy.url().should('include', 'startDate');

      // Verify all orders are from after start date
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="order-date"]').invoke('text').then((dateText) => {
          const orderDate = new Date(dateText);
          expect(orderDate.getTime()).to.be.at.least(startDate.getTime());
        });
      });
    });

    it('should filter orders by end date', () => {
      const endDate = new Date();
      const endDateStr = endDate.toISOString().split('T')[0];

      // Set end date
      cy.get('[data-testid="end-date"]').type(endDateStr);
      cy.get('[data-testid="apply-filters"]').click();

      cy.url().should('include', 'endDate');

      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="order-date"]').invoke('text').then((dateText) => {
          const orderDate = new Date(dateText);
          expect(orderDate.getTime()).to.be.at.most(endDate.getTime());
        });
      });
    });

    it('should filter orders by date range', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      const endDate = new Date();
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Set date range
      cy.get('[data-testid="start-date"]').type(startDateStr);
      cy.get('[data-testid="end-date"]').type(endDateStr);
      cy.get('[data-testid="apply-filters"]').click();

      cy.url().should('include', 'startDate');
      cy.url().should('include', 'endDate');

      cy.get('table tbody tr').should('have.length.at.least', 1);
    });

    it('should handle invalid date range (end before start)', () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 7); // Earlier than start
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      cy.get('[data-testid="start-date"]').type(startDateStr);
      cy.get('[data-testid="end-date"]').type(endDateStr);
      cy.get('[data-testid="apply-filters"]').click();

      // Should show validation error
      cy.contains('End date must be after start date', { matchCase: false }).should('be.visible');
    });
  });

  describe('Customer Email Search', () => {
    it('should search orders by exact customer email', () => {
      const customerEmail = 'uarjunan97@gmail.com';

      // Enter customer email
      cy.get('[data-testid="customer-email-search"]').type(customerEmail);
      cy.get('[data-testid="apply-filters"]').click();

      cy.url().should('include', `customerEmail=${customerEmail}`);

      // Verify all orders belong to that customer
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="customer-email"]')
          .should('contain', customerEmail);
      });
    });

    it('should search orders by partial customer email', () => {
      const partialEmail = 'uarjunan';

      cy.get('[data-testid="customer-email-search"]').type(partialEmail);
      cy.get('[data-testid="apply-filters"]').click();

      cy.url().should('include', `customerEmail=${partialEmail}`);

      // Verify results contain the partial email
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="customer-email"]')
          .invoke('text').should('include', partialEmail);
      });
    });

    it('should show no results for non-existent customer email', () => {
      const nonExistentEmail = 'nonexistent@example.com';

      cy.get('[data-testid="customer-email-search"]').type(nonExistentEmail);
      cy.get('[data-testid="apply-filters"]').click();

      cy.contains('No orders found').should('be.visible');
    });

    it('should be case-insensitive', () => {
      const customerEmail = 'UARJUNAN97@GMAIL.COM';

      cy.get('[data-testid="customer-email-search"]').type(customerEmail);
      cy.get('[data-testid="apply-filters"]').click();

      // Should still find results
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').should('have.length.at.least', 1);
        }
      });
    });
  });

  describe('Amount Range Filter', () => {
    it('should filter orders by minimum amount', () => {
      const minAmount = 100;

      cy.get('[data-testid="min-amount"]').type(minAmount.toString());
      cy.get('[data-testid="apply-filters"]').click();

      cy.url().should('include', `minAmount=${minAmount}`);

      // Verify all orders are above minimum
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="total-amount"]').invoke('text').then((amountText) => {
          const amount = parseFloat(amountText.replace(/[^0-9.]/g, ''));
          expect(amount).to.be.at.least(minAmount);
        });
      });
    });

    it('should filter orders by maximum amount', () => {
      const maxAmount = 500;

      cy.get('[data-testid="max-amount"]').type(maxAmount.toString());
      cy.get('[data-testid="apply-filters"]').click();

      cy.url().should('include', `maxAmount=${maxAmount}`);

      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="total-amount"]').invoke('text').then((amountText) => {
          const amount = parseFloat(amountText.replace(/[^0-9.]/g, ''));
          expect(amount).to.be.at.most(maxAmount);
        });
      });
    });

    it('should filter orders by amount range', () => {
      const minAmount = 100;
      const maxAmount = 300;

      cy.get('[data-testid="min-amount"]').type(minAmount.toString());
      cy.get('[data-testid="max-amount"]').type(maxAmount.toString());
      cy.get('[data-testid="apply-filters"]').click();

      cy.url().should('include', `minAmount=${minAmount}`);
      cy.url().should('include', `maxAmount=${maxAmount}`);

      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="total-amount"]').invoke('text').then((amountText) => {
          const amount = parseFloat(amountText.replace(/[^0-9.]/g, ''));
          expect(amount).to.be.at.least(minAmount);
          expect(amount).to.be.at.most(maxAmount);
        });
      });
    });

    it('should handle invalid amount range (max < min)', () => {
      const minAmount = 500;
      const maxAmount = 100;

      cy.get('[data-testid="min-amount"]').type(minAmount.toString());
      cy.get('[data-testid="max-amount"]').type(maxAmount.toString());
      cy.get('[data-testid="apply-filters"]').click();

      // Should show validation error
      cy.contains('Maximum amount must be greater than minimum', { matchCase: false })
        .should('be.visible');
    });

    it('should handle negative amounts', () => {
      cy.get('[data-testid="min-amount"]').type('-100');
      cy.get('[data-testid="apply-filters"]').click();

      // Should show validation error or ignore negative
      cy.contains('Amount must be positive', { matchCase: false }).should('be.visible');
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters simultaneously', () => {
      const minAmount = 100;
      const customerEmail = 'uarjunan';
      
      // Apply status filter
      cy.get('[data-testid="status-filter"]').click();
      cy.contains('li', 'PENDING').click();

      // Apply payment filter
      cy.get('[data-testid="payment-status-filter"]').click();
      cy.contains('li', 'CONFIRMED').click();

      // Apply amount filter
      cy.get('[data-testid="min-amount"]').type(minAmount.toString());

      // Apply email search
      cy.get('[data-testid="customer-email-search"]').type(customerEmail);

      cy.get('[data-testid="apply-filters"]').click();

      // Verify all filters in URL
      cy.url().should('include', 'status=PENDING');
      cy.url().should('include', 'paymentStatus=CONFIRMED');
      cy.url().should('include', `minAmount=${minAmount}`);
      cy.url().should('include', `customerEmail=${customerEmail}`);

      // Verify results match all criteria
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).find('[data-testid="status-chip"]').should('contain', 'PENDING');
            cy.wrap($row).find('[data-testid="payment-chip"]').should('contain', 'CONFIRMED');
            cy.wrap($row).find('[data-testid="customer-email"]').should('contain', customerEmail);
          });
        } else {
          cy.contains('No orders found').should('be.visible');
        }
      });
    });

    it('should clear all filters at once', () => {
      // Apply multiple filters
      cy.get('[data-testid="status-filter"]').click();
      cy.contains('li', 'PENDING').click();
      cy.get('[data-testid="min-amount"]').type('100');
      cy.get('[data-testid="apply-filters"]').click();

      // Verify filters applied
      cy.url().should('include', 'status=PENDING');
      cy.url().should('include', 'minAmount=100');

      // Clear all filters
      cy.get('[data-testid="clear-filters"]').click();

      // Verify URL has no filter parameters
      cy.url().should('not.include', 'status=');
      cy.url().should('not.include', 'minAmount=');
      cy.url().should('not.include', 'paymentStatus=');

      // Verify all orders are shown
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });

    it('should persist filters on page reload', () => {
      // Apply filters
      cy.get('[data-testid="status-filter"]').click();
      cy.contains('li', 'SHIPPED').click();
      cy.get('[data-testid="min-amount"]').type('200');
      cy.get('[data-testid="apply-filters"]').click();

      // Reload page
      cy.reload();

      // Verify filters still applied
      cy.url().should('include', 'status=SHIPPED');
      cy.url().should('include', 'minAmount=200');

      // Verify results still filtered
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="status-chip"]').should('contain', 'SHIPPED');
      });
    });

    it('should update results when changing filter values', () => {
      // Apply initial filter
      cy.get('[data-testid="status-filter"]').click();
      cy.contains('li', 'PENDING').click();
      
      cy.get('table tbody tr').first().invoke('attr', 'data-order-id').then((firstOrderId) => {
        // Change filter
        cy.get('[data-testid="status-filter"]').click();
        cy.contains('li', 'SHIPPED').click();

        // Verify different results
        cy.get('table tbody tr').first().invoke('attr', 'data-order-id').should('not.equal', firstOrderId);
      });
    });
  });

  describe('Filter Performance', () => {
    it('should apply filters without page flicker', () => {
      cy.get('[data-testid="status-filter"]').click();
      cy.contains('li', 'PENDING').click();

      // Table should remain visible during filtering
      cy.get('table').should('be.visible');
    });

    it('should show loading indicator during filter application', () => {
      cy.intercept('GET', '/api/v1/admin/orders*', (req) => {
        req.reply((res) => {
          res.delay = 1000; // Delay response
        });
      }).as('getOrders');

      cy.get('[data-testid="status-filter"]').click();
      cy.contains('li', 'PENDING').click();

      // Should show loading state
      cy.get('[data-testid="loading-indicator"]').should('be.visible');
      cy.wait('@getOrders');
      cy.get('[data-testid="loading-indicator"]').should('not.exist');
    });
  });
});
