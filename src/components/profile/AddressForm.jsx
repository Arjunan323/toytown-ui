import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Save, X } from 'lucide-react';
import { addShippingAddress, updateShippingAddress } from '../../store/slices/orderSlice';

/**
 * AddressForm Component
 * 
 * Form for adding or editing shipping addresses.
 */
const AddressForm = ({ address = null, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    recipientName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        recipientName: address.recipientName || '',
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        phoneNumber: address.phoneNumber || '',
      });
    }
  }, [address]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (address) {
        await dispatch(updateShippingAddress({ id: address.id, ...formData })).unwrap();
      } else {
        await dispatch(addShippingAddress(formData)).unwrap();
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 bg-gray-50">
      <h3 className="text-xl font-display font-bold text-gray-800 mb-6">
        {address ? 'Edit Address' : 'Add New Address'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="recipientName"
            value={formData.recipientName}
            onChange={handleChange}
            placeholder="Recipient Name"
            required
            className="input-field"
          />
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="input-field"
          />
        </div>

        <input
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          placeholder="Address Line 1"
          required
          className="input-field"
        />

        <input
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          placeholder="Address Line 2 (Optional)"
          className="input-field"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required
            className="input-field"
          />
          <input
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            required
            className="input-field"
          />
          <input
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            required
            className="input-field"
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Address'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline flex-1 flex items-center justify-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );
};

AddressForm.propTypes = {
  address: PropTypes.shape({
    id: PropTypes.number,
    recipientName: PropTypes.string,
    addressLine1: PropTypes.string,
    addressLine2: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    postalCode: PropTypes.string,
    phoneNumber: PropTypes.string,
  }),
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default AddressForm;
