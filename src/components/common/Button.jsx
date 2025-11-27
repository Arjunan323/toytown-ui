import { Button as MuiButton } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Custom Button component wrapper around Material-UI Button
 * Provides consistent styling and behavior across the application
 */
function Button({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  sx = {},
  ...props
}) {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      type={type}
      sx={{
        ...sx,
        // Add loading state styling
        ...(loading && {
          opacity: 0.7,
          cursor: 'not-allowed',
        }),
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </MuiButton>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'info', 'warning']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  sx: PropTypes.object,
};

export default Button;
