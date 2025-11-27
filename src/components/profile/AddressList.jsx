import PropTypes from 'prop-types';
import { MapPin, Edit, Trash2, Plus, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteShippingAddress, setDefaultAddress } from '../../store/slices/orderSlice';
import AddressForm from './AddressForm';

/**
 * AddressList Component
 * 
 * Displays list of user shipping addresses with edit/delete options.
 */
const AddressList = ({ addresses = [] }) => {
  const dispatch = useDispatch();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await dispatch(deleteShippingAddress(addressId)).unwrap();
      } catch (err) {
        console.error('Failed to delete address:', err);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await dispatch(setDefaultAddress(addressId)).unwrap();
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
  };

  const handleEditSuccess = () => {
    setEditingAddress(null);
  };

  if (showAddForm || editingAddress) {
    return (
      <div>
        <AddressForm
          address={editingAddress}
          onSuccess={editingAddress ? handleEditSuccess : handleAddSuccess}
          onCancel={() => {
            setShowAddForm(false);
            setEditingAddress(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">No shipping addresses added yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Address</span>
          </button>
        </div>
      ) : (
        <>
          {addresses.map((address) => (
            <div
              key={address.id}
              className="card p-6 hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-bold text-gray-800">{address.recipientName}</h3>
                    {address.isDefault && (
                      <span className="badge badge-primary text-xs flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="text-gray-700">{address.addressLine2}</p>
                  )}
                  <p className="text-gray-700">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-gray-600">Phone: {address.phoneNumber}</p>
                  
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-semibold mt-2"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingAddress(address)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    aria-label="Edit address"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    aria-label="Delete address"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowAddForm(true)}
            className="btn-outline w-full flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Address</span>
          </button>
        </>
      )}
    </div>
  );
};

AddressList.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      recipientName: PropTypes.string.isRequired,
      addressLine1: PropTypes.string.isRequired,
      addressLine2: PropTypes.string,
      city: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      postalCode: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string.isRequired,
      isDefault: PropTypes.bool,
    })
  ),
};

export default AddressList;
