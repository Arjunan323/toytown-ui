import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent
} from '@mui/material';
import { Add } from '@mui/icons-material';
import ManufacturerTable from '../../components/admin/ManufacturerTable';
import ManufacturerForm from '../../components/admin/ManufacturerForm';
import LogoUploadDialog from '../../components/admin/LogoUploadDialog';
import {
  fetchAdminManufacturers,
  createAdminManufacturer,
  updateAdminManufacturer,
  deleteAdminManufacturer,
  uploadManufacturerLogo,
  toggleManufacturerStatus,
  clearAdminManufacturerError,
  clearAdminManufacturerSuccess
} from '../../store/adminManufacturerSlice';

/**
 * AdminManufacturerManagementPage component for managing manufacturers.
 * Provides CRUD operations, soft delete, and logo upload.
 */
const AdminManufacturerManagementPage = () => {
  const dispatch = useDispatch();
  const {
    manufacturers,
    loading,
    uploadingLogo,
    error,
    success
  } = useSelector((state) => state.adminManufacturer);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminManufacturers({ page, size: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleCreateClick = () => {
    setEditingManufacturer(null);
    setFormOpen(true);
  };

  const handleEdit = (manufacturer) => {
    setEditingManufacturer(manufacturer);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingManufacturer(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingManufacturer) {
        await dispatch(updateAdminManufacturer({
          id: editingManufacturer.id,
          manufacturerData: formData
        })).unwrap();
      } else {
        await dispatch(createAdminManufacturer(formData)).unwrap();
      }
      handleFormClose();
      dispatch(fetchAdminManufacturers({ page, size: rowsPerPage }));
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to save manufacturer:', err);
    }
  };

  const handleUploadLogo = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setLogoUploadOpen(true);
  };

  const handleLogoUploadClose = () => {
    setLogoUploadOpen(false);
    setSelectedManufacturer(null);
  };

  const handleLogoUpload = async (manufacturerId, file) => {
    try {
      await dispatch(uploadManufacturerLogo({ id: manufacturerId, file })).unwrap();
      handleLogoUploadClose();
      dispatch(fetchAdminManufacturers({ page, size: rowsPerPage }));
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to upload logo:', err);
    }
  };

  const handleDelete = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedManufacturer) {
      try {
        await dispatch(deleteAdminManufacturer(selectedManufacturer.id)).unwrap();
        setDeleteDialogOpen(false);
        setSelectedManufacturer(null);
        dispatch(fetchAdminManufacturers({ page, size: rowsPerPage }));
      } catch (err) {
        // Error is handled by Redux state
        console.error('Failed to delete manufacturer:', err);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedManufacturer(null);
  };

  const handleToggleStatus = async (manufacturerId) => {
    try {
      await dispatch(toggleManufacturerStatus(manufacturerId)).unwrap();
      dispatch(fetchAdminManufacturers({ page, size: rowsPerPage }));
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to toggle manufacturer status:', err);
    }
  };

  const handleCloseSnackbar = () => {
    dispatch(clearAdminManufacturerError());
    dispatch(clearAdminManufacturerSuccess());
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manufacturer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateClick}
        >
          Create Manufacturer
        </Button>
      </Box>

      <Card>
        <CardContent>
          <ManufacturerTable
            manufacturers={manufacturers.content}
            page={page}
            rowsPerPage={rowsPerPage}
            totalElements={manufacturers.totalElements}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUploadLogo={handleUploadLogo}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
        </CardContent>
      </Card>

      <ManufacturerForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        manufacturer={editingManufacturer}
        isLoading={loading}
      />

      <LogoUploadDialog
        open={logoUploadOpen}
        onClose={handleLogoUploadClose}
        onUpload={handleLogoUpload}
        manufacturer={selectedManufacturer}
        uploading={uploadingLogo}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the manufacturer &quot;{selectedManufacturer?.name}&quot;?
            This action will soft delete the manufacturer (set as inactive).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          variant="filled"
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminManufacturerManagementPage;
