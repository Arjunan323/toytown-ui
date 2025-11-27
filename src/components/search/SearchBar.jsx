import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        aria-label="Search for toys"
        className="w-full pl-10 pr-10 py-2 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:border-white focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  initialValue: PropTypes.string,
  placeholder: PropTypes.string,
};

export default SearchBar;
