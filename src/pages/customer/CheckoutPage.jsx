import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  CheckCircle, 
  ChevronLeft,
  Plus,
  Edit,
  Check
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import OrderSummary from '../../components/order/OrderSummary';
import {
  fetchCart,
  clearError as clearCartError,
} from '../../store/slices/cartSlice';
import {
  fetchShippingAddresses,
  addShippingAddress,
  createOrder,
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

  const steps = [
    { label: 'Shipping Address', icon: MapPin },
    { label: 'Review Order', icon: ShoppingBag },
    { label: 'Payment', icon: CreditCard },
  ];

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

  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
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

  const calculateShipping = () => {
    return subtotal >= 500 ? 0 : 50;
  };

  const calculateTax = () => {
    return subtotal * 0.18;
  };

  const calculateTotal = () => {
    return subtotal + calculateShipping() + calculateTax();
  };

  // Loading state
  if (cartLoading && !items.length) {
    return <Spinner fullPage message="Loading checkout..." />;
  }

  // Empty cart redirect
  if (!cartLoading && items.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedAddress = shippingAddresses.find(addr => addr.id === selectedAddressId);

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="container-custom max-w-6xl">
        {/* Page Header */}
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-8">
          Checkout
        </h1>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;

              return (
                <div key={step.label} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        : isActive
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white ring-4 ring-primary-100 scale-110'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-semibold text-center ${
                      isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {(cartError || orderError) && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 font-semibold">{cartError || orderError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 0: Shipping Address */}
            {activeStep === 0 && (
              <div className="card p-6 space-y-6">
                <h2 className="text-2xl font-display font-bold text-gray-800">
                  Select Shipping Address
                </h2>

                {orderLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <div className="space-y-4">
                      {shippingAddresses.map((address) => (
                        <button
                          key={address.id}
                          onClick={() => handleAddressChange(address.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedAddressId === address.id
                              ? 'border-primary-500 bg-primary-50 shadow-toy'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                selectedAddressId === address.id
                                  ? 'border-primary-500 bg-primary-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedAddressId === address.id && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">
                                  {address.recipientName}
                                  {address.isDefault && (
                                    <span className="ml-2 text-xs badge badge-primary">Default</span>
                                  )}
                                </p>
                                <p className="text-gray-600">{address.addressLine1}</p>
                                {address.addressLine2 && (
                                  <p className="text-gray-600">{address.addressLine2}</p>
                                )}
                                <p className="text-gray-600">
                                  {address.city}, {address.state} {address.postalCode}
                                </p>
                                <p className="text-gray-600">Phone: {address.phoneNumber}</p>
                              </div>
                            </div>
                            <Edit className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Add New Address */}
                    {!showAddressForm ? (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="btn-outline w-full flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add New Address</span>
                      </button>
                    ) : (
                      <div className="card p-6 bg-gray-50 space-y-4">
                        <h3 className="font-display font-bold text-gray-800">Add New Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            name="recipientName"
                            value={newAddress.recipientName}
                            onChange={handleNewAddressChange}
                            placeholder="Recipient Name"
                            className="input-field"
                          />
                          <input
                            name="phoneNumber"
                            value={newAddress.phoneNumber}
                            onChange={handleNewAddressChange}
                            placeholder="Phone Number"
                            className="input-field"
                          />
                          <input
                            name="addressLine1"
                            value={newAddress.addressLine1}
                            onChange={handleNewAddressChange}
                            placeholder="Address Line 1"
                            className="input-field md:col-span-2"
                          />
                          <input
                            name="addressLine2"
                            value={newAddress.addressLine2}
                            onChange={handleNewAddressChange}
                            placeholder="Address Line 2 (Optional)"
                            className="input-field md:col-span-2"
                          />
                          <input
                            name="city"
                            value={newAddress.city}
                            onChange={handleNewAddressChange}
                            placeholder="City"
                            className="input-field"
                          />
                          <input
                            name="state"
                            value={newAddress.state}
                            onChange={handleNewAddressChange}
                            placeholder="State"
                            className="input-field"
                          />
                          <input
                            name="postalCode"
                            value={newAddress.postalCode}
                            onChange={handleNewAddressChange}
                            placeholder="Postal Code"
                            className="input-field"
                          />
                        </div>
                        <div className="flex space-x-4">
                          <button onClick={handleAddNewAddress} className="btn-primary flex-1">
                            Save Address
                          </button>
                          <button onClick={() => setShowAddressForm(false)} className="btn-outline flex-1">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 1: Review Order */}
            {activeStep === 1 && (
              <div className="card p-6 space-y-6">
                <h2 className="text-2xl font-display font-bold text-gray-800">
                  Review Your Order
                </h2>

                {/* Shipping Address */}
                {selectedAddress && (
                  <div className="p-4 bg-primary-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">Shipping Address</h3>
                      <button onClick={() => setActiveStep(0)} className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                        Change
                      </button>
                    </div>
                    <p className="text-gray-700">{selectedAddress.recipientName}</p>
                    <p className="text-gray-600">{selectedAddress.addressLine1}, {selectedAddress.city}</p>
                    <p className="text-gray-600">{selectedAddress.state} {selectedAddress.postalCode}</p>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Order Items ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <img
                          src={item.productImageUrl || '/placeholder-toy.jpg'}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.productName}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-primary-600">₹{item.subtotal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {activeStep === 2 && (
              <div className="card p-6 space-y-6">
                <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center space-x-2">
                  <CreditCard className="w-7 h-7 text-primary-600" />
                  <span>Payment</span>
                </h2>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Secure Payment Gateway</h3>
                  <p className="text-gray-600">
                    You will be redirected to Razorpay for secure payment processing
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span>🔒 SSL Encrypted</span>
                    <span>•</span>
                    <span>💳 Multiple Payment Options</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="btn-outline flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              {activeStep < steps.length - 1 ? (
                <button onClick={handleNext} className="btn-primary">
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={paymentLoading || !selectedAddressId}
                  className="btn-primary disabled:opacity-50"
                >
                  {paymentLoading ? 'Processing...' : 'Place Order & Pay'}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-xl font-display font-bold text-gray-800 mb-6">Order Summary</h3>
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={calculateShipping()}
                tax={calculateTax()}
                showItems={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
