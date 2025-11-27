import { CircularProgress, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Spinner component for loading states
 * Can be used as a full-page overlay or inline element
 */
function Spinner({
  size = 40,
  thickness = 4,
  color = 'primary',
  fullPage = false,
  message = '',
}) {
  const spinnerElement = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullPage && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }),
      }}
    >
      <CircularProgress size={size} thickness={thickness} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  return spinnerElement;
}

Spinner.propTypes = {
  size: PropTypes.number,
  thickness: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'info', 'warning', 'inherit']),
  fullPage: PropTypes.bool,
  message: PropTypes.string,
};

export default Spinner;
