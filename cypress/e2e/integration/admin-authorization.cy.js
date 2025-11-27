/**
 * Integration Test: Admin Authorization
 * 
 * Verifies that:
 * - Customer JWT tokens cannot access admin endpoints
 * - Admin JWT tokens can access admin endpoints
 * - Invalid/expired tokens are rejected
 * - Admin endpoints return appropriate error codes (401, 403)
 */

describe('T234: Admin Authorization Integration', () => {
  const adminCredentials = {
    username: 'admin',
    password: 'Admin@123'
  };

  const customerCredentials = {
    email: 'john.doe@example.com',
    password: 'Password@123'
  };

  let adminToken = null;
  let customerToken = null;

  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Token Acquisition', () => {
    it('should obtain valid admin JWT token', () => {
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');

      // Capture admin token
      cy.window().then((win) => {
        adminToken = win.localStorage.getItem('adminAccessToken');
        expect(adminToken).to.exist;
        expect(adminToken).to.be.a('string');
        expect(adminToken.length).to.be.greaterThan(50);
      });
    });

    it('should obtain valid customer JWT token', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      cy.url({ timeout: 10000 }).should('match', /\/$|\/home/);

      // Capture customer token
      cy.window().then((win) => {
        customerToken = win.localStorage.getItem('accessToken');
        expect(customerToken).to.exist;
        expect(customerToken).to.be.a('string');
        expect(customerToken.length).to.be.greaterThan(50);
      });
    });
  });

  describe('Admin Endpoint Authorization', () => {
    it('should allow admin token to access GET /api/v1/admin/products', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('content');
        expect(response.body.content).to.be.an('array');
      });
    });

    it('should reject customer token from GET /api/v1/admin/products', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: `Bearer ${customerToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.match(/unauthorized|forbidden|access denied|admin/i);
      });
    });

    it('should reject request without token from GET /api/v1/admin/products', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/admin/products',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.match(/unauthorized|token required|missing token/i);
      });
    });

    it('should reject invalid token from GET /api/v1/admin/products', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: 'Bearer invalid.token.here'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.match(/invalid token|unauthorized/i);
      });
    });

    it('should allow admin token to POST /api/v1/admin/products', () => {
      const productData = {
        name: `Auth Test Product ${Date.now()}`,
        description: 'Product for testing authorization',
        price: 29.99,
        stockQuantity: 10,
        minAge: 5,
        maxAge: 10,
        sku: `AUTH-TEST-${Date.now()}`,
        categoryId: 1,
        manufacturerId: 1,
        isFeatured: false
      };

      cy.request({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        body: productData
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq(productData.name);
      });
    });

    it('should reject customer token from POST /api/v1/admin/products', () => {
      const productData = {
        name: `Unauthorized Product ${Date.now()}`,
        description: 'This should be rejected',
        price: 19.99,
        stockQuantity: 5,
        minAge: 3,
        maxAge: 8,
        sku: `UNAUTH-${Date.now()}`,
        categoryId: 1,
        manufacturerId: 1,
        isFeatured: false
      };

      cy.request({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: `Bearer ${customerToken}`
        },
        body: productData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('message');
      });
    });

    it('should allow admin token to PUT /api/v1/admin/products/:id', () => {
      // First create a product
      const productData = {
        name: `Update Test ${Date.now()}`,
        description: 'Product for update test',
        price: 39.99,
        stockQuantity: 15,
        minAge: 6,
        maxAge: 12,
        sku: `UPDATE-TEST-${Date.now()}`,
        categoryId: 1,
        manufacturerId: 1,
        isFeatured: false
      };

      cy.request({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        body: productData
      }).then((createResponse) => {
        const productId = createResponse.body.id;

        // Update the product
        const updateData = {
          ...productData,
          price: 49.99,
          description: 'Updated description'
        };

        cy.request({
          method: 'PUT',
          url: `/api/v1/admin/products/${productId}`,
          headers: {
            Authorization: `Bearer ${adminToken}`
          },
          body: updateData
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          expect(updateResponse.body.price).to.eq(49.99);
          expect(updateResponse.body.description).to.eq('Updated description');
        });
      });
    });

    it('should reject customer token from PUT /api/v1/admin/products/:id', () => {
      const updateData = {
        price: 99.99,
        description: 'Unauthorized update'
      };

      cy.request({
        method: 'PUT',
        url: '/api/v1/admin/products/1',
        headers: {
          Authorization: `Bearer ${customerToken}`
        },
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should allow admin token to PATCH /api/v1/admin/products/:id/stock', () => {
      // Create product first
      const productData = {
        name: `Stock Update Test ${Date.now()}`,
        description: 'Product for stock update test',
        price: 24.99,
        stockQuantity: 20,
        minAge: 4,
        maxAge: 9,
        sku: `STOCK-UPDATE-${Date.now()}`,
        categoryId: 1,
        manufacturerId: 1,
        isFeatured: false
      };

      cy.request({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        body: productData
      }).then((createResponse) => {
        const productId = createResponse.body.id;

        // Update stock
        cy.request({
          method: 'PATCH',
          url: `/api/v1/admin/products/${productId}/stock`,
          headers: {
            Authorization: `Bearer ${adminToken}`
          },
          body: {
            stockQuantity: 50
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.stockQuantity).to.eq(50);
        });
      });
    });

    it('should reject customer token from PATCH /api/v1/admin/products/:id/stock', () => {
      cy.request({
        method: 'PATCH',
        url: '/api/v1/admin/products/1/stock',
        headers: {
          Authorization: `Bearer ${customerToken}`
        },
        body: {
          stockQuantity: 100
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should allow admin token to PUT /api/v1/admin/products/:id/discontinue', () => {
      // Create product first
      const productData = {
        name: `Discontinue Test ${Date.now()}`,
        description: 'Product for discontinue test',
        price: 34.99,
        stockQuantity: 12,
        minAge: 7,
        maxAge: 14,
        sku: `DISC-AUTH-${Date.now()}`,
        categoryId: 1,
        manufacturerId: 1,
        isFeatured: false
      };

      cy.request({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        body: productData
      }).then((createResponse) => {
        const productId = createResponse.body.id;

        // Discontinue product
        cy.request({
          method: 'PUT',
          url: `/api/v1/admin/products/${productId}/discontinue`,
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.discontinued).to.be.true;
        });
      });
    });

    it('should reject customer token from PUT /api/v1/admin/products/:id/discontinue', () => {
      cy.request({
        method: 'PUT',
        url: '/api/v1/admin/products/1/discontinue',
        headers: {
          Authorization: `Bearer ${customerToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should allow admin token to GET /api/v1/admin/products/low-stock', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/admin/products/low-stock',
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        // Verify all products have low stock
        response.body.forEach((product) => {
          expect(product.stockQuantity).to.be.lessThan(10);
        });
      });
    });

    it('should reject customer token from GET /api/v1/admin/products/low-stock', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/admin/products/low-stock',
        headers: {
          Authorization: `Bearer ${customerToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });
  });

  describe('UI Authorization Guards', () => {
    it('should redirect to login when accessing /admin/dashboard without auth', () => {
      cy.clearLocalStorage();
      cy.visit('/admin/dashboard');
      cy.url({ timeout: 5000 }).should('include', '/admin/login');
    });

    it('should redirect to login when accessing /admin/products without auth', () => {
      cy.clearLocalStorage();
      cy.visit('/admin/products');
      cy.url({ timeout: 5000 }).should('include', '/admin/login');
    });

    it('should redirect to login when accessing /admin/products/new without auth', () => {
      cy.clearLocalStorage();
      cy.visit('/admin/products/new');
      cy.url({ timeout: 5000 }).should('include', '/admin/login');
    });

    it('should prevent customer from accessing admin routes', () => {
      // Customer login
      cy.visit('/login');
      cy.get('input[name="email"]').type(customerCredentials.email);
      cy.get('input[name="password"]').type(customerCredentials.password);
      cy.get('button[type="submit"]').click();

      // Try to access admin dashboard
      cy.visit('/admin/dashboard', { failOnStatusCode: false });

      // Should redirect or show error
      cy.url().should('not.include', '/admin/dashboard');
      cy.url().should('match', /\/admin\/login|\/403|\/$/);
    });

    it('should allow admin to access admin routes after login', () => {
      // Admin login
      cy.clearLocalStorage();
      cy.visit('/admin/login');
      cy.get('input[name="username"]').type(adminCredentials.username);
      cy.get('input[name="password"]').type(adminCredentials.password);
      cy.get('button[type="submit"]').click();

      // Should access admin dashboard
      cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');

      // Should access admin products
      cy.visit('/admin/products');
      cy.url().should('include', '/admin/products');

      // Should access create product
      cy.visit('/admin/products/new');
      cy.url().should('include', '/admin/products/new');
    });
  });

  describe('Token Expiration & Refresh', () => {
    it('should handle expired admin token gracefully', () => {
      // Set an expired token (this is a mock - in reality tokens expire after time)
      cy.window().then((win) => {
        win.localStorage.setItem('adminAccessToken', 'expired.token.value');
      });

      // Try to access admin endpoint
      cy.request({
        method: 'GET',
        url: '/api/v1/admin/products',
        headers: {
          Authorization: 'Bearer expired.token.value'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });

      // UI should redirect to login
      cy.visit('/admin/products');
      cy.url({ timeout: 5000 }).should('include', '/admin/login');
    });
  });

  describe('Cross-Origin Request Security', () => {
    it('should include appropriate CORS headers for admin endpoints', () => {
      cy.request({
        method: 'OPTIONS',
        url: '/api/v1/admin/products',
        headers: {
          Origin: 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET'
        }
      }).then((response) => {
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers).to.have.property('access-control-allow-methods');
      });
    });
  });
});
