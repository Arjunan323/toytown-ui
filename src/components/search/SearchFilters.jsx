import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * SearchFilters Component
 * 
 * Provides filtering options for search results:
 * - Age range filter (0-18+ years)
 * - Price range filter (dual slider with manual inputs)
 * - Manufacturer filter (dropdown)
 * - Sort options (Relevance, Price, Name, Newest)
 * - Clear all filters functionality
 * - Filter count badge
 * - Collapsible sections for mobile
 */
function SearchFilters({ filters, onFilterChange, manufacturers = [] }) {
  const [localFilters, setLocalFilters] = useState({
    minAge: filters?.minAge || '',
    maxAge: filters?.maxAge || '',
    minPrice: filters?.minPrice || '',
    maxPrice: filters?.maxPrice || '',
    manufacturerId: filters?.manufacturerId || '',
    sortBy: filters?.sortBy || 'relevance',
    sortDirection: filters?.sortDirection || 'desc',
  });

  const [priceRange, setPriceRange] = useState([
    filters?.minPrice || 0,
    filters?.maxPrice || 10000,
  ]);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', field: 'name', direction: 'asc' },
    { value: 'price_asc', label: 'Price: Low to High', field: 'price', direction: 'asc' },
    { value: 'price_desc', label: 'Price: High to Low', field: 'price', direction: 'desc' },
    { value: 'name_asc', label: 'Name: A-Z', field: 'name', direction: 'asc' },
    { value: 'newest', label: 'Newest First', field: 'createdDate', direction: 'desc' },
  ];

  const ageOptions = [
    { value: '', label: 'Any Age' },
    { value: '0-2', label: '0-2 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '6-8', label: '6-8 years' },
    { value: '9-12', label: '9-12 years' },
    { value: '13+', label: '13+ years' },
  ];

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.minAge || localFilters.maxAge) count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.manufacturerId) count++;
    return count;
  };

  const handleAgeChange = (event) => {
    const value = event.target.value;
    let minAge = '';
    let maxAge = '';

    if (value) {
      const [min, max] = value.split('-');
      minAge = min;
      maxAge = max === '+' ? '99' : max;
    }

    const updated = { ...localFilters, minAge, maxAge };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handlePriceSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceSliderCommit = (event, newValue) => {
    const updated = {
      ...localFilters,
      minPrice: newValue[0],
      maxPrice: newValue[1],
    };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handlePriceInputChange = (field, value) => {
    const numValue = value === '' ? '' : Number(value);
    const updated = { ...localFilters, [field]: numValue };
    setLocalFilters(updated);
    
    if (field === 'minPrice') {
      setPriceRange([numValue || 0, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], numValue || 10000]);
    }
  };

  const handlePriceInputBlur = () => {
    onFilterChange(localFilters);
  };

  const handleManufacturerChange = (event) => {
    const updated = { ...localFilters, manufacturerId: event.target.value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleSortChange = (event) => {
    const selectedOption = sortOptions.find(opt => opt.value === event.target.value);
    const updated = {
      ...localFilters,
      sortBy: selectedOption.field,
      sortDirection: selectedOption.direction,
    };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleClearFilters = () => {
    const cleared = {
      minAge: '',
      maxAge: '',
      minPrice: '',
      maxPrice: '',
      manufacturerId: '',
      sortBy: 'relevance',
      sortDirection: 'desc',
    };
    setLocalFilters(cleared);
    setPriceRange([0, 10000]);
    onFilterChange(cleared);
  };

  const getCurrentSortValue = () => {
    const option = sortOptions.find(
      opt => opt.field === localFilters.sortBy && opt.direction === localFilters.sortDirection
    );
    return option ? option.value : 'relevance';
  };

  const getCurrentAgeValue = () => {
    if (!localFilters.minAge && !localFilters.maxAge) return '';
    if (localFilters.maxAge === '99') return `${localFilters.minAge}+`;
    return `${localFilters.minAge}-${localFilters.maxAge}`;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Filter Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="action" />
          <Typography variant="h6">Filters</Typography>
          {activeFilterCount > 0 && (
            <Chip label={activeFilterCount} size="small" color="primary" />
          )}
        </Box>
        {activeFilterCount > 0 && (
          <Button size="small" onClick={handleClearFilters}>
            Clear All
          </Button>
        )}
      </Box>

      {/* Sort Options */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="sort-label">Sort By</InputLabel>
        <Select
          labelId="sort-label"
          id="sort-select"
          value={getCurrentSortValue()}
          label="Sort By"
          onChange={handleSortChange}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Age Range Filter */}
      <Accordion defaultExpanded sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Age Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel id="age-label">Age</InputLabel>
            <Select
              labelId="age-label"
              id="age-select"
              value={getCurrentAgeValue()}
              label="Age"
              onChange={handleAgeChange}
            >
              {ageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Price Range Filter */}
      <Accordion defaultExpanded sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Slider
              value={priceRange}
              onChange={handlePriceSliderChange}
              onChangeCommitted={handlePriceSliderCommit}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={100}
              valueLabelFormat={(value) => `₹${value}`}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min Price"
                type="number"
                size="small"
                value={localFilters.minPrice}
                onChange={(e) => handlePriceInputChange('minPrice', e.target.value)}
                onBlur={handlePriceInputBlur}
                InputProps={{ startAdornment: '₹' }}
                fullWidth
              />
              <TextField
                label="Max Price"
                type="number"
                size="small"
                value={localFilters.maxPrice}
                onChange={(e) => handlePriceInputChange('maxPrice', e.target.value)}
                onBlur={handlePriceInputBlur}
                InputProps={{ startAdornment: '₹' }}
                fullWidth
              />
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Manufacturer Filter */}
      {manufacturers.length > 0 && (
        <Accordion defaultExpanded sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Manufacturer</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth>
              <InputLabel id="manufacturer-label">Manufacturer</InputLabel>
              <Select
                labelId="manufacturer-label"
                id="manufacturer-select"
                value={localFilters.manufacturerId}
                label="Manufacturer"
                onChange={handleManufacturerChange}
              >
                <MenuItem value="">
                  <em>All Manufacturers</em>
                </MenuItem>
                {manufacturers.map((manufacturer) => (
                  <MenuItem key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}

SearchFilters.propTypes = {
  filters: PropTypes.shape({
    minAge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxAge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    manufacturerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sortBy: PropTypes.string,
    sortDirection: PropTypes.string,
  }),
  onFilterChange: PropTypes.func.isRequired,
  manufacturers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default SearchFilters;
