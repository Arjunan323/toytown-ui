/**
 * E2E Test: Admin Order Management
 * 
 * Tests the complete admin order management workflow:
 * - Admin login
 * - View orders dashboard
 * - Filter orders by status
 * - View order details
 * - Update order status
 * - Verify customer sees update
 */

describe('US5: Admin Order Management', () => {
  const adminUser = {
    email: 'admin@toytown.com',
    password: 'Admin@123'
  };

  const customerUser = {
    email: 'uarjunan97@gmail.com',
    password: 'Test@1234'
  };

  let testOrderId;
  let testOrderNumber;

  before(() => {
    // Ensure test data exists
    cy.request('GET', '/api/v1/admin/orders?page=0&size=1&sort=orderDate,desc', {
      headers: {
        'Authorization': `Bearer ${Cypress.env('adminToken')}`
      }
    }).then((response) => {
      if (response.body.content && response.body.content.length > 0) {
        testOrderId = response.body.content[0].id;
        testOrderNumber = response.body.content[0].orderNumber;
      }
    });
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Admin Order Dashboard', () => {
    it('should login as admin and access orders dashboard', () => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[name="email"]').type(adminUser.email);
      cy.get('input[name="password"]').type(adminUser.password);
      cy.get('button[type="submit"]').click();

      // Wait for redirect to admin dashboard
      cy.url().should('include', '/admin');

      // Navigate to orders page
      cy.contains('Orders').click();
      cy.url().should('include', '/admin/orders');

      // Verify orders table is displayed
      cy.get('table').should('be.visible');
      cy.contains('Order Number').should('be.visible');
      cy.contains('Customer').should('be.visible');
      cy.contains('Status').should('be.visible');
      cy.contains('Payment').should('be.visible');
    });

    it('should display order statistics', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Verify stats cards are displayed
      cy.contains('Total Orders').should('be.visible');
      cy.contains('Pending').should('be.visible');
      cy.contains('Processing').should('be.visible');
      cy.contains('Shipped').should('be.visible');
    });

    it('should filter orders by status', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Select PENDING filter
      cy.get('[data-testid="status-filter"]').click();
      cy.contains('PENDING').click();

      // Verify URL contains filter parameter
      cy.url().should('include', 'status=PENDING');

      // Verify filtered results show only PENDING orders
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).contains('PENDING').should('be.visible');
      });
    });

    it('should filter orders by payment status', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Select CONFIRMED payment filter
      cy.get('[data-testid="payment-status-filter"]').click();
      cy.contains('CONFIRMED').click();

      // Verify URL contains filter parameter
      cy.url().should('include', 'paymentStatus=CONFIRMED');

      // Verify filtered results show only CONFIRMED payments
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('[data-testid="payment-chip"]').should('contain', 'CONFIRMED');
      });
    });

    it('should paginate through orders', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Check if pagination exists (only if there are multiple pages)
      cy.get('body').then(($body) => {
        if ($body.find('.MuiPagination-root').length > 0) {
          // Click next page
          cy.get('[aria-label="Go to next page"]').click();
          
          // Verify URL changed
          cy.url().should('include', 'page=1');
          
          // Verify different orders are displayed
          cy.get('table tbody tr').should('be.visible');
        }
      });
    });
  });

  describe('Order Details', () => {
    it('should view order details', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Click on first order's view button
      cy.get('[data-testid="view-order-btn"]').first().click();

      // Verify order details modal is displayed
      cy.contains('Order Details').should('be.visible');
      cy.contains('Order Number').should('be.visible');
      cy.contains('Customer').should('be.visible');
      cy.contains('Total Amount').should('be.visible');
      cy.contains('Order Items').should('be.visible');
      cy.contains('Shipping Address').should('be.visible');
    });

    it('should display customer information in order details', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Click view on first order
      cy.get('[data-testid="view-order-btn"]').first().click();

      // Verify customer details
      cy.get('[data-testid="customer-name"]').should('be.visible');
      cy.get('[data-testid="customer-email"]').should('be.visible');
      
      // Verify order items are listed
      cy.contains('Order Items').parent().find('table').should('be.visible');
    });

    it('should close order details modal', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Open modal
      cy.get('[data-testid="view-order-btn"]').first().click();
      cy.contains('Order Details').should('be.visible');

      // Close modal
      cy.contains('button', 'Close').click();
      cy.contains('Order Details').should('not.exist');
    });
  });

  describe('Update Order Status', () => {
    it('should open status update dialog', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Click update status button on first PENDING order
      cy.get('table tbody tr').contains('PENDING').parents('tr')
        .find('[data-testid="update-status-btn"]').click();

      // Verify dialog is open
      cy.contains('Update Order Status').should('be.visible');
      cy.get('[data-testid="status-select"]').should('be.visible');
    });

    it('should update order status to PROCESSING', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Find a PENDING order and update to PROCESSING
      cy.get('table tbody tr').contains('PENDING').parents('tr').within(() => {
        cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
          testOrderNumber = orderNum.trim();
        });
        cy.get('[data-testid="update-status-btn"]').click();
      });

      // Select PROCESSING status
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'PROCESSING').click();

      // Submit
      cy.contains('button', 'Update').click();

      // Verify success message
      cy.contains('Order status updated successfully').should('be.visible');

      // Verify order status changed in table
      cy.reload();
      cy.contains(testOrderNumber).parents('tr')
        .find('[data-testid="status-chip"]').should('contain', 'PROCESSING');
    });

    it('should require tracking number when updating to SHIPPED', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Find a PROCESSING order
      cy.get('table tbody tr').contains('PROCESSING').parents('tr')
        .find('[data-testid="update-status-btn"]').click();

      // Select SHIPPED status
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'SHIPPED').click();

      // Verify tracking number field appears
      cy.get('[data-testid="tracking-number"]').should('be.visible');

      // Try to submit without tracking number
      cy.contains('button', 'Update').click();

      // Verify error message
      cy.contains('Tracking number is required').should('be.visible');
    });

    it('should update order to SHIPPED with tracking number', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      const trackingNumber = 'TRACK' + Date.now();

      // Find a PROCESSING order
      cy.get('table tbody tr').contains('PROCESSING').parents('tr').within(() => {
        cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
          testOrderNumber = orderNum.trim();
        });
        cy.get('[data-testid="update-status-btn"]').click();
      });

      // Select SHIPPED and enter tracking number
      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'SHIPPED').click();
      cy.get('[data-testid="tracking-number"]').type(trackingNumber);

      // Submit
      cy.contains('button', 'Update').click();

      // Verify success
      cy.contains('Order status updated successfully').should('be.visible');

      // Verify status changed
      cy.reload();
      cy.contains(testOrderNumber).parents('tr')
        .find('[data-testid="status-chip"]').should('contain', 'SHIPPED');
    });

    it('should not allow invalid status transitions', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Try to update a DELIVERED order (should be disabled)
      cy.get('table tbody tr').contains('DELIVERED').parents('tr')
        .find('[data-testid="update-status-btn"]').should('be.disabled');

      // Try to update a CANCELLED order (should be disabled)
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr:contains("CANCELLED")').length > 0) {
          cy.get('table tbody tr').contains('CANCELLED').parents('tr')
            .find('[data-testid="update-status-btn"]').should('be.disabled');
        }
      });
    });
  });

  describe('Customer Order Tracking Integration', () => {
    it('should verify customer sees updated order status', () => {
      // First update order as admin
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      cy.visit('/admin/orders');

      // Update a PENDING order to PROCESSING
      cy.get('table tbody tr').contains('PENDING').parents('tr').within(() => {
        cy.get('[data-testid="order-number"]').invoke('text').then((orderNum) => {
          testOrderNumber = orderNum.trim();
        });
        cy.get('[data-testid="update-status-btn"]').click();
      });

      cy.get('[data-testid="status-select"]').click();
      cy.contains('li', 'PROCESSING').click();
      cy.contains('button', 'Update').click();
      cy.contains('successfully').should('be.visible');

      // Logout admin
      cy.get('[data-testid="admin-menu"]').click();
      cy.contains('Logout').click();

      // Login as customer
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerUser.email);
      cy.get('input[name="password"]').type(customerUser.password);
      cy.get('button[type="submit"]').click();

      // Go to order history
      cy.visit('/orders');

      // Verify updated status is displayed
      cy.contains(testOrderNumber).parents('.order-card')
        .find('[data-testid="order-status"]').should('contain', 'PROCESSING');
    });

    it('should display tracking number for shipped orders', () => {
      // Login as customer
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerUser.email);
      cy.get('input[name="password"]').type(customerUser.password);
      cy.get('button[type="submit"]').click();

      // Go to order history
      cy.visit('/orders');

      // Find a SHIPPED order
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="order-status"]:contains("SHIPPED")').length > 0) {
          cy.get('[data-testid="order-status"]').contains('SHIPPED').parents('.order-card')
            .find('[data-testid="tracking-number"]').should('be.visible');
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.loginAsAdmin(adminUser.email, adminUser.password);
      
      // Intercept API call and force error
      cy.intercept('GET', '/api/v1/admin/orders*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getOrdersError');

      cy.visit('/admin/orders');
      cy.wait('@getOrdersError');

      // Verify error message is displayed
      cy.contains('error', { matchCase: false }).should('be.visible');
    });

    it('should handle unauthorized access', () => {
      // Try to access admin orders without login
      cy.visit('/admin/orders');

      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });
});
