import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  ShoppingBag as ShoppingBagIcon,
  RateReview as ReviewIcon,
} from '@mui/icons-material';
import {
  fetchProfile,
  updateProfile,
  selectProfile,
  selectProfileLoading,
  selectProfileError,
} from '../../store/slices/profileSlice';
import AddressList from '../../components/profile/AddressList';
import { useNavigate } from 'react-router-dom';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);

  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setUpdateSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length > 100) {
      errors.firstName = 'First name must be less than 100 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 100) {
      errors.lastName = 'Last name must be less than 100 characters';
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setEditMode(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || '',
    });
    setFormErrors({});
    setEditMode(false);
  };

  if (loading && !profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        My Account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<PersonIcon />} label="Personal Info" iconPosition="start" />
          <Tab icon={<LocationIcon />} label="Addresses" iconPosition="start" />
          <Tab icon={<ShoppingBagIcon />} label="Order History" iconPosition="start" />
          <Tab icon={<ReviewIcon />} label="My Reviews" iconPosition="start" />
        </Tabs>

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Personal Information</Typography>
              {!editMode && (
                <Button variant="outlined" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={Boolean(formErrors.firstName)}
                  helperText={formErrors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={Boolean(formErrors.lastName)}
                  helperText={formErrors.lastName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profile?.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={Boolean(formErrors.phoneNumber)}
                  helperText={formErrors.phoneNumber || '10-digit mobile number'}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
            </Grid>

            {editMode && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button variant="contained" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              Account Summary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="h6">{profile?.totalOrders || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="h6">
                  {profile?.createdDate
                    ? new Date(profile.createdDate).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Addresses Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <AddressList />
          </Box>
        </TabPanel>

        {/* Order History Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            {profile?.recentOrders && profile.recentOrders.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {profile.recentOrders.map((order) => (
                  <Paper
                    key={order.orderNumber}
                    variant="outlined"
                    sx={{ p: 2, mb: 2, cursor: 'pointer' }}
                    onClick={() => navigate(`/orders/${order.orderNumber}`)}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Order #{order.orderNumber}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ₹{order.totalAmount || '0.00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              order.orderStatus === 'DELIVERED'
                                ? 'success.main'
                                : 'primary.main',
                          }}
                        >
                          {order.orderStatus}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/orders')}
                  sx={{ mt: 2 }}
                >
                  View All Orders
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No orders yet
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                  Start Shopping
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* My Reviews Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Reviews
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-reviews')}
              sx={{ mt: 2 }}
            >
              View All My Reviews
            </Button>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
