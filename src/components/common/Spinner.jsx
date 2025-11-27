import PropTypes from 'prop-types';

/**
 * Spinner Component
 * 
 * Loading spinner with optional full-page overlay.
 * Features:
 * - Customizable size
 * - Full-page option
 * - Optional message
 * - Accessible with ARIA labels
 */
const Spinner = ({ fullPage = false, message = '', size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4',
  };

  const spinnerElement = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`spinner ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-gray-600 font-medium text-lg">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

Spinner.propTypes = {
  fullPage: PropTypes.bool,
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default Spinner;
