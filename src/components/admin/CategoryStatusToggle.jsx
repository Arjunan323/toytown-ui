import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';
import { ToggleOn, ToggleOff } from '@mui/icons-material';

/**
 * CategoryStatusToggle component for toggling category active/inactive status.
 */
const CategoryStatusToggle = ({ category, onToggle, disabled }) => {
  const handleClick = () => {
    onToggle(category.id);
  };

  return (
    <Tooltip title={category.isActive ? 'Deactivate category' : 'Activate category'}>
      <IconButton
        onClick={handleClick}
        disabled={disabled}
        color={category.isActive ? 'success' : 'default'}
        size="small"
      >
        {category.isActive ? <ToggleOn /> : <ToggleOff />}
      </IconButton>
    </Tooltip>
  );
};

CategoryStatusToggle.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    isActive: PropTypes.bool.isRequired
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default CategoryStatusToggle;
