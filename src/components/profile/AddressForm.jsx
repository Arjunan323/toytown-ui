import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { addAddress, updateAddress } from '../../store/slices/profileSlice';

const AddressForm = ({ address, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    phoneNumber: '',
    streetAddress: '',
    apartmentNumber: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    addressLabel: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (address) {
      setFormData({
        recipientName: address.recipientName || '',
        phoneNumber: address.phoneNumber || '',
        streetAddress: address.streetAddress || '',
        apartmentNumber: address.apartmentNumber || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'USA',
        addressLabel: address.addressLabel || '',
        isDefault: address.isDefault || false,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Invalid postal code (use format: 12345 or 12345-6789)';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (address) {
        await dispatch(
          updateAddress({
            addressId: address.addressId,
            addressData: formData,
          })
        ).unwrap();
      } else {
        await dispatch(addAddress(formData)).unwrap();
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save address:', err);
      setErrors({ submit: err.message || 'Failed to save address' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Label (Optional)"
            name="addressLabel"
            value={formData.addressLabel}
            onChange={handleChange}
            placeholder="e.g., Home, Office"
            helperText="Give this address a name for easy identification"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Recipient Name"
            name="recipientName"
            value={formData.recipientName}
            onChange={handleChange}
            error={Boolean(errors.recipientName)}
            helperText={errors.recipientName}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={Boolean(errors.phoneNumber)}
            helperText={errors.phoneNumber}
            placeholder="1234567890"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Street Address"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleChange}
            error={Boolean(errors.streetAddress)}
            helperText={errors.streetAddress}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Apartment, Suite, etc. (Optional)"
            name="apartmentNumber"
            value={formData.apartmentNumber}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={Boolean(errors.city)}
            helperText={errors.city}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            required
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            error={Boolean(errors.state)}
            helperText={errors.state}
            placeholder="CA"
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            required
            label="ZIP Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            error={Boolean(errors.postalCode)}
            helperText={errors.postalCode}
            placeholder="12345"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            error={Boolean(errors.country)}
            helperText={errors.country}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isDefault}
                onChange={handleChange}
                name="isDefault"
              />
            }
            label="Set as default address"
          />
        </Grid>
      </Grid>

      {errors.submit && (
        <Box sx={{ mt: 2, color: 'error.main' }}>
          {errors.submit}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddressForm;
