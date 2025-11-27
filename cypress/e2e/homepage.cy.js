describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should load the homepage successfully', () => {
    cy.url().should('include', '/');
  });

  it('should display the header', () => {
    cy.get('header').should('be.visible');
  });

  it('should display featured products', () => {
    // Wait for API call to complete
    cy.intercept('GET', '**/api/products*').as('getProducts');
    cy.wait('@getProducts');
    
    // Check if products are displayed
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
  });

  it('should navigate to product detail page when clicking a product', () => {
    cy.intercept('GET', '**/api/products*').as('getProducts');
    cy.wait('@getProducts');
    
    // Click on the first product
    cy.get('[data-testid="product-card"]').first().click();
    
    // Should navigate to product detail page
    cy.url().should('include', '/product/');
  });

  it('should display categories in navigation', () => {
    cy.intercept('GET', '**/api/categories*').as('getCategories');
    cy.wait('@getCategories');
    
    // Check if categories are displayed
    cy.get('[data-testid="category-link"]').should('have.length.at.least', 1);
  });
});
