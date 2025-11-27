import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  fetchAddresses,
  deleteAddress,
  setDefaultAddress,
  selectAddresses,
  selectAddressesLoading,
  selectAddressesError,
} from '../../store/slices/profileSlice';
import AddressForm from './AddressForm';

const AddressList = () => {
  const dispatch = useDispatch();
  const addresses = useSelector(selectAddresses);
  const loading = useSelector(selectAddressesLoading);
  const error = useSelector(selectAddressesError);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setOpenDialog(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAddress(null);
  };

  const handleDeleteClick = (address) => {
    setAddressToDelete(address);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (addressToDelete) {
      try {
        await dispatch(deleteAddress(addressToDelete.addressId)).unwrap();
        setDeleteConfirmOpen(false);
        setAddressToDelete(null);
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

  if (loading && !addresses) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Shipping Addresses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add New Address
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {addresses && addresses.length > 0 ? (
        <Grid container spacing={2}>
          {addresses.map((address) => (
            <Grid item xs={12} md={6} key={address.addressId}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  position: 'relative',
                  border: address.isDefault ? 2 : 1,
                  borderColor: address.isDefault ? 'primary.main' : 'divider',
                }}
              >
                {address.isDefault && (
                  <Chip
                    label="Default"
                    color="primary"
                    size="small"
                    icon={<CheckCircleIcon />}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  />
                )}

                <Typography variant="subtitle1" fontWeight="bold">
                  {address.addressLabel || 'Address'}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  {address.recipientName}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {address.streetAddress}
                </Typography>

                {address.apartmentNumber && (
                  <Typography variant="body2" color="text.secondary">
                    {address.apartmentNumber}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary">
                  {address.city}, {address.state} {address.postalCode}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {address.country}
                </Typography>

                {address.phoneNumber && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Phone: {address.phoneNumber}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(address)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(address)}
                    disabled={addresses.length === 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  {!address.isDefault && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSetDefault(address.addressId)}
                      sx={{ ml: 'auto' }}
                    >
                      Set as Default
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No addresses saved yet
          </Typography>
          <Button variant="outlined" onClick={handleAddNew} sx={{ mt: 2 }}>
            Add Your First Address
          </Button>
        </Box>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <AddressForm
            address={editingAddress}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Address?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this address? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddressList;
