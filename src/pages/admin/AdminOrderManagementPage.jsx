import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Chip,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { format } from 'date-fns';
import OrderTable from '../../components/admin/OrderTable';
import {
  fetchAdminOrders,
  fetchOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
  fetchOrderStats,
  setOrderFilters,
  clearAdminOrderError,
} from '../../store/slices';

/**
 * Admin Order Management Page.
 * Displays order list, statistics, and management dialogs.
 */
const AdminOrderManagementPage = () => {
  const dispatch = useDispatch();
  const { orders, currentOrder, stats, pagination, filters, loading, error } = useSelector(
    (state) => state.adminOrder
  );

  // Local state for dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusData, setStatusData] = useState({ orderStatus: '', trackingNumber: '' });
  const [paymentData, setPaymentData] = useState({ paymentStatus: '' });
  const [successMessage, setSuccessMessage] = useState('');

  // Filter state
  const [filterState, setFilterState] = useState({
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    dispatch(fetchAdminOrders({ ...filters, ...pagination }));
    dispatch(fetchOrderStats());
  }, [dispatch]);

  /**
   * Handle page change.
   */
  const handlePageChange = (event, value) => {
    dispatch(fetchAdminOrders({ ...filters, page: value - 1, size: pagination.size }));
  };

  /**
   * Handle view order.
   */
  const handleViewOrder = (orderId) => {
    dispatch(fetchOrderDetails(orderId));
    setViewDialogOpen(true);
  };

  /**
   * Handle update status dialog open.
   */
  const handleUpdateStatusOpen = (order) => {
    setSelectedOrder(order);
    setStatusData({ orderStatus: order.status, trackingNumber: order.trackingNumber || '' });
    setStatusDialogOpen(true);
  };

  /**
   * Handle update payment dialog open.
   */
  const handleUpdatePaymentOpen = (order) => {
    setSelectedOrder(order);
    setPaymentData({ paymentStatus: order.paymentStatus });
    setPaymentDialogOpen(true);
  };

  /**
   * Handle order status update submission.
   */
  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await dispatch(
        updateOrderStatus({
          orderId: selectedOrder.id,
          statusData,
        })
      ).unwrap();

      setSuccessMessage('Order status updated successfully');
      setStatusDialogOpen(false);
      dispatch(fetchAdminOrders({ ...filters, ...pagination }));
      dispatch(fetchOrderStats());
    } catch (err) {
      // Error handled by Redux
    }
  };

  /**
   * Handle payment status update submission.
   */
  const handlePaymentUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await dispatch(
        updatePaymentStatus({
          orderId: selectedOrder.id,
          paymentData,
        })
      ).unwrap();

      setSuccessMessage('Payment status updated successfully');
      setPaymentDialogOpen(false);
      dispatch(fetchAdminOrders({ ...filters, ...pagination }));
      dispatch(fetchOrderStats());
    } catch (err) {
      // Error handled by Redux
    }
  };

  /**
   * Handle filter application.
   */
  const handleApplyFilters = () => {
    const appliedFilters = {};
    if (filterState.status) appliedFilters.status = filterState.status;
    if (filterState.paymentStatus) appliedFilters.paymentStatus = filterState.paymentStatus;
    if (filterState.startDate) appliedFilters.startDate = filterState.startDate;
    if (filterState.endDate) appliedFilters.endDate = filterState.endDate;

    dispatch(setOrderFilters(appliedFilters));
    dispatch(fetchAdminOrders({ ...appliedFilters, page: 0, size: pagination.size }));
  };

  /**
   * Handle filter clear.
   */
  const handleClearFilters = () => {
    setFilterState({
      status: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
    });
    dispatch(setOrderFilters({}));
    dispatch(fetchAdminOrders({ page: 0, size: pagination.size }));
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order Management
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h5">{stats.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h5" color="warning.main">
                {stats.pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Processing
              </Typography>
              <Typography variant="h5" color="info.main">
                {stats.processingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5" color="success.main">
                {formatCurrency(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Order Status</InputLabel>
              <Select
                value={filterState.status}
                label="Order Status"
                onChange={(e) => setFilterState({ ...filterState, status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={filterState.paymentStatus}
                label="Payment Status"
                onChange={(e) =>
                  setFilterState({ ...filterState, paymentStatus: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={filterState.startDate}
              onChange={(e) => setFilterState({ ...filterState, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={filterState.endDate}
              onChange={(e) => setFilterState({ ...filterState, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button variant="contained" onClick={handleApplyFilters} fullWidth>
              Apply
            </Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 1 }}>
          <Button size="small" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Order Table */}
      <OrderTable
        orders={orders}
        onView={handleViewOrder}
        onUpdateStatus={handleUpdateStatusOpen}
        onUpdatePayment={handleUpdatePaymentOpen}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page + 1}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {currentOrder && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Order Number
                  </Typography>
                  <Typography variant="body1">{currentOrder.orderNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label={currentOrder.orderStatus} color="primary" size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">{currentOrder.customerName}</Typography>
                  <Typography variant="caption">{currentOrder.customerEmail}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6">{formatCurrency(currentOrder.totalAmount)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <Table size="small">
                <TableBody>
                  {currentOrder.lineItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">Qty: {item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.priceAtPurchase)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {currentOrder.shippingAddress && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2">
                    {currentOrder.shippingAddress.addressLine1}
                    {currentOrder.shippingAddress.addressLine2 &&
                      `, ${currentOrder.shippingAddress.addressLine2}`}
                    <br />
                    {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}{' '}
                    {currentOrder.shippingAddress.postalCode}
                    <br />
                    {currentOrder.shippingAddress.country}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Order Status</InputLabel>
              <Select
                value={statusData.orderStatus}
                label="Order Status"
                onChange={(e) => setStatusData({ ...statusData, orderStatus: e.target.value })}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
            {statusData.orderStatus === 'SHIPPED' && (
              <TextField
                fullWidth
                label="Tracking Number"
                value={statusData.trackingNumber}
                onChange={(e) => setStatusData({ ...statusData, trackingNumber: e.target.value })}
                required
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={paymentData.paymentStatus}
                label="Payment Status"
                onChange={(e) => setPaymentData({ paymentStatus: e.target.value })}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePaymentUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => dispatch(clearAdminOrderError())}
      >
        <Alert onClose={() => dispatch(clearAdminOrderError())} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminOrderManagementPage;
