import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

/**
 * Table component for displaying admin orders.
 */
const OrderTable = ({ orders, onView, onUpdateStatus, onUpdatePayment, loading }) => {
  /**
   * Get color for order status chip.
   */
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  /**
   * Get color for payment status chip.
   */
  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      PENDING: 'warning',
      CONFIRMED: 'success',
      FAILED: 'error',
    };
    return colors[paymentStatus] || 'default';
  };

  /**
   * Format date for display.
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  /**
   * Format currency.
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary">
          No orders found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Order Number</strong></TableCell>
            <TableCell><strong>Customer</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Payment</strong></TableCell>
            <TableCell align="right"><strong>Total Amount</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {order.orderNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{order.customerName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.customerEmail}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(order.createdAt || order.orderDate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={order.orderStatus}
                  color={getStatusColor(order.orderStatus)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={order.paymentStatus}
                  color={getPaymentStatusColor(order.paymentStatus)}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(order.totalAmount)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onView(order.id)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Update Order Status">
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => onUpdateStatus(order)}
                    disabled={order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED'}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Update Payment Status">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => onUpdatePayment(order)}
                    disabled={order.paymentStatus === 'CONFIRMED'}
                  >
                    <PaymentIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      orderNumber: PropTypes.string.isRequired,
      customerName: PropTypes.string.isRequired,
      customerEmail: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
      orderDate: PropTypes.string,
      orderStatus: PropTypes.string.isRequired,
      paymentStatus: PropTypes.string.isRequired,
      totalAmount: PropTypes.number.isRequired,
    })
  ).isRequired,
  onView: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onUpdatePayment: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

OrderTable.defaultProps = {
  loading: false,
};

export default OrderTable;
