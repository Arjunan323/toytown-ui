import { useState, useEffect } from 'react';
import { TextField, IconButton, InputAdornment, Box } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * SearchBar Component
 * 
 * Provides a search input with debouncing, clear functionality, and keyboard support.
 * Features:
 * - Real-time search with 300ms debounce
 * - Enter key to trigger search
 * - Clear button to reset search
 * - Accessible with ARIA labels
 * - Responsive design
 */
function SearchBar({ onSearch, initialValue = '', placeholder = 'Search for toys...' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  // Debounce search term changes (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Trigger search callback when debounced term changes
  useEffect(() => {
    if (onSearch && debouncedTerm !== initialValue) {
      onSearch(debouncedTerm);
    }
  }, [debouncedTerm]); // Intentionally omitting onSearch and initialValue from deps to avoid loops

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (onSearch) {
        onSearch(searchTerm);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 400, md: 500 } }}>
      <TextField
        fullWidth
        size="small"
        value={searchTerm}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        aria-label="Search for toys"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                aria-label="Clear search"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 1,
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
    </Box>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  initialValue: PropTypes.string,
  placeholder: PropTypes.string,
};

export default SearchBar;
