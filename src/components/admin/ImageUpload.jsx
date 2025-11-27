import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardActions,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarOutline as StarOutlineIcon,
} from '@mui/icons-material';

/**
 * Image upload component for product images.
 * Supports multiple image upload with primary image selection.
 */
const ImageUpload = ({ productId, images = [], onUpload, onDelete, onSetPrimary, uploading = false, uploadProgress = 0 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    // Validate files
    const validFiles = [];
    const newPreviewUrls = [];

    for (const file of files) {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`File ${file.name} is not a valid image type. Only JPEG and PNG are allowed.`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds 5MB size limit.`);
        continue;
      }

      validFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles]);
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const handleRemoveSelected = (index) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newUrls[index]);

    newFiles.splice(index, 1);
    newUrls.splice(index, 1);

    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    const isPrimaryFirst = images.length === 0; // Set first image as primary if no images exist
    await onUpload(selectedFiles, isPrimaryFirst);

    // Clear selections after successful upload
    setSelectedFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setError('');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Product Images
      </Typography>

      {/* Existing Images */}
      {images.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Images
          </Typography>
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={12} sm={6} md={4} key={image.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.imageUrl}
                    alt={image.altText}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Box>
                      {image.isPrimary && (
                        <Chip
                          label="Primary"
                          size="small"
                          color="primary"
                          icon={<StarIcon />}
                        />
                      )}
                    </Box>
                    <Box>
                      {!image.isPrimary && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onSetPrimary(image.id)}
                          title="Set as primary"
                        >
                          <StarOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(image.id)}
                        title="Delete image"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upload New Images */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Upload New Images
        </Typography>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          Select Images
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Image Previews */}
        {previewUrls.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {previewUrls.map((url, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={url}
                      alt={`Preview ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardActions>
                      <Typography variant="caption" sx={{ flexGrow: 1 }}>
                        {selectedFiles[index]?.name}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveSelected(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="text.secondary" align="center" display="block" mt={1}>
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={uploading}
              sx={{ mt: 2 }}
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
            </Button>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          Maximum file size: 5MB. Allowed formats: JPEG, PNG.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ImageUpload;
