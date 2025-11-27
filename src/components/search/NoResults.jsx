import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { SearchOff as SearchOffIcon, Category as CategoryIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * NoResults Component
 * 
 * Displays when search/filter returns no results.
 * Features:
 * - Friendly empty state message
 * - Search suggestions (popular categories)
 * - Clear filters button
 * - Browse all products button
 * - Helpful user guidance
 */
function NoResults({ query, hasFilters, onClearFilters, onBrowseAll }) {
  const popularSuggestions = [
    'Building Blocks',
    'Action Figures',
    'Educational Toys',
    'Board Games',
    'Outdoor Toys',
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        textAlign: 'center',
        py: 6,
        px: 2,
      }}
    >
      <SearchOffIcon
        sx={{
          fontSize: 80,
          color: 'text.secondary',
          mb: 2,
          opacity: 0.5,
        }}
      />

      <Typography variant="h5" gutterBottom>
        No results found
      </Typography>

      {query && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          We couldn&apos;t find any toys matching &quot;<strong>{query}</strong>&quot;
          {hasFilters && ' with the selected filters'}
        </Typography>
      )}

      {!query && hasFilters && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          No toys match the selected filters. Try adjusting your filter criteria.
        </Typography>
      )}

      {!query && !hasFilters && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          Try searching for toys or browse our categories below.
        </Typography>
      )}

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        {hasFilters && (
          <Button
            variant="contained"
            onClick={onClearFilters}
            sx={{ minWidth: 150 }}
          >
            Clear Filters
          </Button>
        )}
        <Button
          variant={hasFilters ? 'outlined' : 'contained'}
          onClick={onBrowseAll}
          sx={{ minWidth: 150 }}
        >
          Browse All Toys
        </Button>
      </Stack>

      {/* Search Suggestions */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'action.hover',
          maxWidth: 600,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CategoryIcon color="action" />
          <Typography variant="h6">Popular Categories</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Try browsing these popular toy categories:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {popularSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outlined"
              size="small"
              onClick={() => {
                // In a real implementation, this would navigate to the category
                // or trigger a new search
                if (onBrowseAll) {
                  onBrowseAll();
                }
              }}
              sx={{ mb: 1 }}
            >
              {suggestion}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Helpful Tips */}
      <Box sx={{ mt: 4, maxWidth: 500 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Search Tips:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul" sx={{ textAlign: 'left', mt: 1 }}>
          <li>Check your spelling</li>
          <li>Try more general keywords</li>
          <li>Use fewer filters to see more results</li>
          <li>Browse by category instead</li>
        </Typography>
      </Box>
    </Box>
  );
}

NoResults.propTypes = {
  query: PropTypes.string,
  hasFilters: PropTypes.bool,
  onClearFilters: PropTypes.func.isRequired,
  onBrowseAll: PropTypes.func.isRequired,
};

NoResults.defaultProps = {
  query: '',
  hasFilters: false,
};

export default NoResults;
