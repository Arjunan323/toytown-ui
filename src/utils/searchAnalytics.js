/**
 * Search Analytics Utility
 * 
 * Tracks anonymous search analytics for business insights:
 * - Search queries (what users search for)
 * - Filter usage (which filters are most popular)
 * - No-results searches (identify catalog gaps)
 * - Click-through rate from search results
 * 
 * Data is stored locally and can be sent to analytics service.
 * All tracking is anonymous - no PII collected.
 */

const ANALYTICS_KEY = 'toytown_search_analytics';
const MAX_ANALYTICS_RECORDS = 1000; // Limit storage

/**
 * Get current analytics data from localStorage
 */
const getAnalytics = () => {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : {
      searches: [],
      filters: [],
      noResults: [],
      clicks: [],
    };
  } catch (error) {
    console.warn('Failed to read analytics:', error);
    return {
      searches: [],
      filters: [],
      noResults: [],
      clicks: [],
    };
  }
};

/**
 * Save analytics data to localStorage
 */
const saveAnalytics = (data) => {
  try {
    // Trim each array to max records
    const trimmed = {
      searches: data.searches.slice(-MAX_ANALYTICS_RECORDS),
      filters: data.filters.slice(-MAX_ANALYTICS_RECORDS),
      noResults: data.noResults.slice(-MAX_ANALYTICS_RECORDS),
      clicks: data.clicks.slice(-MAX_ANALYTICS_RECORDS),
    };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to save analytics:', error);
  }
};

/**
 * Track a search query
 * @param {string} query - Search query text
 * @param {number} resultCount - Number of results returned
 */
export const trackSearch = (query, resultCount) => {
  if (!query || query.trim().length === 0) return;
  
  const analytics = getAnalytics();
  analytics.searches.push({
    query: query.trim().toLowerCase(),
    resultCount,
    timestamp: new Date().toISOString(),
  });
  saveAnalytics(analytics);
};

/**
 * Track filter usage
 * @param {Object} filters - Active filters
 */
export const trackFilterUsage = (filters) => {
  const analytics = getAnalytics();
  
  // Track which filters are being used
  const activeFilters = [];
  if (filters.ageRange) activeFilters.push('ageRange');
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) activeFilters.push('priceRange');
  if (filters.manufacturer) activeFilters.push('manufacturer');
  if (filters.sort && filters.sort !== 'relevance') activeFilters.push(`sort:${filters.sort}`);
  
  if (activeFilters.length > 0) {
    analytics.filters.push({
      filters: activeFilters,
      timestamp: new Date().toISOString(),
    });
    saveAnalytics(analytics);
  }
};

/**
 * Track no-results searches (catalog gaps)
 * @param {string} query - Search query that returned no results
 * @param {Object} filters - Active filters when no results found
 */
export const trackNoResults = (query, filters) => {
  if (!query || query.trim().length === 0) return;
  
  const analytics = getAnalytics();
  analytics.noResults.push({
    query: query.trim().toLowerCase(),
    filters: { ...filters },
    timestamp: new Date().toISOString(),
  });
  saveAnalytics(analytics);
};

/**
 * Track click-through from search results
 * @param {string} query - Search query that was active
 * @param {number} productId - Product that was clicked
 * @param {number} position - Position in search results (0-based)
 */
export const trackSearchClick = (query, productId, position) => {
  const analytics = getAnalytics();
  analytics.clicks.push({
    query: query ? query.trim().toLowerCase() : '',
    productId,
    position,
    timestamp: new Date().toISOString(),
  });
  saveAnalytics(analytics);
};

/**
 * Get analytics summary for reporting
 * @returns {Object} Analytics summary with insights
 */
export const getAnalyticsSummary = () => {
  const analytics = getAnalytics();
  
  // Top searches
  const searchCounts = {};
  analytics.searches.forEach(({ query }) => {
    searchCounts[query] = (searchCounts[query] || 0) + 1;
  });
  const topSearches = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));
  
  // Most used filters
  const filterCounts = {};
  analytics.filters.forEach(({ filters }) => {
    filters.forEach((filter) => {
      filterCounts[filter] = (filterCounts[filter] || 0) + 1;
    });
  });
  const topFilters = Object.entries(filterCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([filter, count]) => ({ filter, count }));
  
  // Top no-results queries
  const noResultsCounts = {};
  analytics.noResults.forEach(({ query }) => {
    noResultsCounts[query] = (noResultsCounts[query] || 0) + 1;
  });
  const topNoResults = Object.entries(noResultsCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));
  
  // Click-through rate
  const totalSearches = analytics.searches.length;
  const totalClicks = analytics.clicks.length;
  const clickThroughRate = totalSearches > 0 ? (totalClicks / totalSearches) * 100 : 0;
  
  return {
    totalSearches,
    totalClicks,
    clickThroughRate: clickThroughRate.toFixed(2),
    topSearches,
    topFilters,
    topNoResults,
  };
};

/**
 * Clear all analytics data
 */
export const clearAnalytics = () => {
  try {
    localStorage.removeItem(ANALYTICS_KEY);
  } catch (error) {
    console.warn('Failed to clear analytics:', error);
  }
};

export default {
  trackSearch,
  trackFilterUsage,
  trackNoResults,
  trackSearchClick,
  getAnalyticsSummary,
  clearAnalytics,
};
