import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

/**
 * LogoUploadDialog component for uploading manufacturer logos.
 */
const LogoUploadDialog = ({ open, onClose, onUpload, manufacturer, uploading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must not exceed 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (selectedFile && manufacturer) {
      onUpload(manufacturer.id, selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Upload Logo for {manufacturer?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {preview ? (
            <Avatar
              src={preview}
              alt="Logo preview"
              variant="rounded"
              sx={{ width: 200, height: 200 }}
            />
          ) : manufacturer?.logoUrl ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Current Logo
              </Typography>
              <Avatar
                src={manufacturer.logoUrl}
                alt={manufacturer.name}
                variant="rounded"
                sx={{ width: 200, height: 200, mx: 'auto' }}
              />
            </Box>
          ) : (
            <Avatar
              variant="rounded"
              sx={{ width: 200, height: 200, bgcolor: 'grey.200' }}
            >
              <CloudUpload sx={{ fontSize: 64, color: 'grey.400' }} />
            </Avatar>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={handleButtonClick}
            disabled={uploading}
          >
            {selectedFile ? 'Change File' : 'Select File'}
          </Button>

          {selectedFile && (
            <Typography variant="caption" color="text.secondary">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary" textAlign="center">
            Supported formats: JPG, PNG, GIF. Max file size: 5MB
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          startIcon={uploading && <CircularProgress size={20} />}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

LogoUploadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  manufacturer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    logoUrl: PropTypes.string
  }),
  uploading: PropTypes.bool
};

export default LogoUploadDialog;
