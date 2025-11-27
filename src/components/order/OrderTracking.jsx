import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  LocalShipping as LocalShippingIcon,
  Inventory as InventoryIcon,
  Done as DoneIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

/**
 * OrderTracking Component
 * 
 * Displays order status timeline with visual progress indicators.
 * Shows current order status and tracking information.
 * 
 * @component
 */
const OrderTracking = ({
  order,
  showHeader = true,
}) => {
  if (!order) {
    return null;
  }

  const {
    orderNumber,
    orderStatus,
    orderDate,
    trackingNumber,
    shippedDate,
    deliveredDate,
  } = order;

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Define order status steps
  const steps = [
    {
      label: 'Order Placed',
      status: 'PENDING',
      description: 'Your order has been received',
      icon: <CheckCircleIcon />,
      date: orderDate,
    },
    {
      label: 'Processing',
      status: 'PROCESSING',
      description: 'We are preparing your order',
      icon: <InventoryIcon />,
      date: null,
    },
    {
      label: 'Shipped',
      status: 'SHIPPED',
      description: 'Your order is on the way',
      icon: <LocalShippingIcon />,
      date: shippedDate,
    },
    {
      label: 'Delivered',
      status: 'DELIVERED',
      description: 'Order has been delivered',
      icon: <DoneIcon />,
      date: deliveredDate,
    },
  ];

  // Determine active step based on order status
  const getActiveStep = () => {
    const statusIndex = steps.findIndex(step => step.status === orderStatus);
    return statusIndex !== -1 ? statusIndex : 0;
  };

  const activeStep = getActiveStep();
  const isCancelled = orderStatus === 'CANCELLED';

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStepIcon = (index, stepStatus) => {
    if (isCancelled) {
      return <CancelIcon color="error" />;
    }
    if (index < activeStep) {
      return <CheckCircleIcon color="success" />;
    }
    if (index === activeStep) {
      return steps[index].icon;
    }
    return <RadioButtonUncheckedIcon color="disabled" />;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        {/* Header */}
        {showHeader && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Order Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order #{orderNumber}
                </Typography>
              </Box>
              <Chip
                label={orderStatus}
                color={getStatusColor(orderStatus)}
                icon={isCancelled ? <CancelIcon /> : undefined}
              />
            </Box>

            {/* Tracking Info */}
            {trackingNumber && orderStatus === 'SHIPPED' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Tracking Number:</strong> {trackingNumber}
                </Typography>
                {shippedDate && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Shipped on:</strong> {formatDate(shippedDate)}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Cancellation Notice */}
            {isCancelled && (
              <Alert severity="error" sx={{ mb: 2 }}>
                This order has been cancelled
              </Alert>
            )}
          </Box>
        )}

        {/* Status Timeline */}
        {!isCancelled ? (
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.status} completed={index < activeStep}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getStepIcon(index, step.status)}
                    </Box>
                  )}
                >
                  <Typography variant="body1" fontWeight={index === activeStep ? 'bold' : 'normal'}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {step.description}
                  </Typography>
                  {step.date && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(step.date)}
                    </Typography>
                  )}
                  {index === activeStep && orderStatus === 'SHIPPED' && trackingNumber && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Tracking Details
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tracking #: {trackingNumber}
                      </Typography>
                      {shippedDate && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Shipped: {formatDate(shippedDate)}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CancelIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Order Cancelled
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This order was cancelled on {formatDate(orderDate)}
            </Typography>
          </Box>
        )}

        {/* Delivery Confirmation */}
        {orderStatus === 'DELIVERED' && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              ✓ Order Delivered Successfully
            </Typography>
            {deliveredDate && (
              <Typography variant="body2" color="text.secondary">
                Delivered on {formatDate(deliveredDate)}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Thank you for shopping with Aadhav's ToyTown! We hope you enjoy your purchase.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

OrderTracking.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.number,
    orderNumber: PropTypes.string.isRequired,
    orderStatus: PropTypes.oneOf(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).isRequired,
    orderDate: PropTypes.string.isRequired,
    trackingNumber: PropTypes.string,
    shippedDate: PropTypes.string,
    deliveredDate: PropTypes.string,
  }),
  showHeader: PropTypes.bool,
};

export default OrderTracking;
