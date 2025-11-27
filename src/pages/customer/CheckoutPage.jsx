import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import Spinner from '../../components/common/Spinner';
import {
  fetchCart,
  clearError as clearCartError,
} from '../../store/slices/cartSlice';
import {
  fetchShippingAddresses,
  addShippingAddress,
  createOrder,
  confirmPayment,
  clearError as clearOrderError,
} from '../../store/slices/orderSlice';
import { loadRazorpayScript, processRazorpayPayment } from '../../services/orderService';

/**
 * CheckoutPage Component
 * 
 * Multi-step checkout process with shipping address selection,
 * order review, and Razorpay payment integration.
 * 
 * @component
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, subtotal, loading: cartLoading, error: cartError } = useSelector((state) => state.cart);
  const { shippingAddresses, loading: orderLoading, error: orderError, paymentLoading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
  });

  const steps = ['Shipping Address', 'Review Order', 'Payment'];

  useEffect(() => {
    // Fetch cart and shipping addresses
    dispatch(fetchCart());
    dispatch(fetchShippingAddresses());

    return () => {
      dispatch(clearCartError());
      dispatch(clearOrderError());
    };
  }, [dispatch]);

  useEffect(() => {
    // Auto-select first address if available
    if (shippingAddresses.length > 0 && !selectedAddressId) {
      const defaultAddress = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [shippingAddresses, selectedAddressId]);

  const handleAddressChange = (event) => {
    setSelectedAddressId(parseInt(event.target.value));
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNewAddress = async () => {
    try {
      const result = await dispatch(addShippingAddress(newAddress)).unwrap();
      setSelectedAddressId(result.id);
      setShowAddressForm(false);
      setNewAddress({
        recipientName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        phoneNumber: '',
      });
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedAddressId) {
      alert('Please select a shipping address');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a shipping address');
      return;
    }

    try {
      // Step 1: Create order
      const order = await dispatch(createOrder({
        shippingAddressId: selectedAddressId,
      })).unwrap();

      // Step 2: Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay. Please try again.');
      }

      // Step 3: Process Razorpay payment
      await processRazorpayPayment(
        {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          razorpayOrderId: order.razorpayOrderId,
          customerName: `${user.firstName} ${user.lastName}`,
          customerEmail: user.email,
          customerPhone: user.phoneNumber || '',
        },
        // Success callback
        async (confirmedOrder) => {
          try {
            // Payment already confirmed in processRazorpayPayment
            // Redirect to confirmation page
            navigate(`/orders/confirmation/${order.orderNumber}`);
          } catch (error) {
            console.error('Navigation error:', error);
          }
        },
        // Failure callback
        (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
        }
      );
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  const calculateTotal = () => {
    const shipping = subtotal >= 500 ? 0 : 50;
    const tax = subtotal * 0.18;
    return subtotal + shipping + tax;
  };

  // Loading state
  if (cartLoading && !items.length) {
    return <Spinner fullPage />;
  }

  // Empty cart redirect
  if (!cartLoading && items.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedAddress = shippingAddresses.find(addr => addr.id === selectedAddressId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Checkout
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Display */}
      {(cartError || orderError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {cartError || orderError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Step 0: Shipping Address */}
          {activeStep === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Select Shipping Address
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {orderLoading ? (
                <Spinner />
              ) : (
                <>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup value={selectedAddressId} onChange={handleAddressChange}>
                      {shippingAddresses.map((address) => (
                        <Card
                          key={address.id}
                          variant="outlined"
                          sx={{
                            mb: 2,
                            border: selectedAddressId === address.id ? 2 : 1,
                            borderColor: selectedAddressId === address.id ? 'primary.main' : 'divider',
                          }}
                        >
                          <CardContent>
                            <FormControlLabel
                              value={address.id}
                              control={<Radio />}
                              label={
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {address.recipientName}
                                    {address.isDefault && (
                                      <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                                        (Default)
                                      </Typography>
                                    )}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {address.addressLine1}
                                  </Typography>
                                  {address.addressLine2 && (
                                    <Typography variant="body2" color="text.secondary">
                                      {address.addressLine2}
                                    </Typography>
                                  )}
                                  <Typography variant="body2" color="text.secondary">
                                    {address.city}, {address.state} {address.postalCode}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {address.phoneNumber}
                                  </Typography>
                                </Box>
                              }
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  {/* Add New Address */}
                  {!showAddressForm ? (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setShowAddressForm(true)}
                      sx={{ mt: 2 }}
                    >
                      Add New Address
                    </Button>
                  ) : (
                    <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Add New Address
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Recipient Name"
                            name="recipientName"
                            value={newAddress.recipientName}
                            onChange={handleNewAddressChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Address Line 1"
                            name="addressLine1"
                            value={newAddress.addressLine1}
                            onChange={handleNewAddressChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Address Line 2 (Optional)"
                            name="addressLine2"
                            value={newAddress.addressLine2}
                            onChange={handleNewAddressChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="City"
                            name="city"
                            value={newAddress.city}
                            onChange={handleNewAddressChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="State"
                            name="state"
                            value={newAddress.state}
                            onChange={handleNewAddressChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Postal Code"
                            name="postalCode"
                            value={newAddress.postalCode}
                            onChange={handleNewAddressChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone Number"
                            name="phoneNumber"
                            value={newAddress.phoneNumber}
                            onChange={handleNewAddressChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={handleAddNewAddress}>
                              Save Address
                            </Button>
                            <Button variant="outlined" onClick={() => setShowAddressForm(false)}>
                              Cancel
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}
                </>
              )}
            </Paper>
          )}

          {/* Step 1: Review Order */}
          {activeStep === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Review Your Order
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Shipping Address */}
              {selectedAddress && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Shipping Address
                    </Typography>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => setActiveStep(0)}>
                      Change
                    </Button>
                  </Box>
                  <Typography variant="body2">{selectedAddress.recipientName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAddress.addressLine1}, {selectedAddress.city}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAddress.state} {selectedAddress.postalCode}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Order Items */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Order Items ({items.length})
              </Typography>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <img
                    src={item.productImageUrl || '/placeholder-toy.jpg'}
                    alt={item.productName}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{item.productName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      ₹{item.productPrice} × {item.quantity} = ₹{item.subtotal}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          )}

          {/* Step 2: Payment */}
          {activeStep === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Payment
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Alert severity="info" sx={{ mb: 3 }}>
                You will be redirected to Razorpay for secure payment processing
              </Alert>

              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" gutterBottom>
                  Click below to proceed with payment
                </Typography>
                <img src="/razorpay-logo.png" alt="Razorpay" style={{ maxWidth: 200, margin: '20px 0' }} />
              </Box>
            </Paper>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handlePlaceOrder}
                disabled={paymentLoading || !selectedAddressId}
              >
                {paymentLoading ? 'Processing...' : 'Place Order & Pay'}
              </Button>
            )}
          </Box>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 16 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">₹{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Shipping:</Typography>
              <Typography variant="body2">{subtotal >= 500 ? 'FREE' : '₹50.00'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">Tax (18% GST):</Typography>
              <Typography variant="body2">₹{(subtotal * 0.18).toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ₹{calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
