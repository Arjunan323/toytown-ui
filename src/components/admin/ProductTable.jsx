import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Inventory as StockIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

/**
 * Admin product table component.
 * Displays products in a table with actions for edit, stock update, and discontinue/reactivate.
 */
const ProductTable = ({
  products,
  onEdit,
  onDiscontinue,
  onReactivate,
  onUpdateStock,
  onToggleFeatured,
}) => {
  const getStockStatusColor = (quantity, threshold = 10) => {
    if (quantity === 0) return 'error';
    if (quantity <= threshold) return 'warning';
    return 'success';
  };

  const getStockStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.100' }}>
            <TableCell width={80}>Image</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="center">Stock</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="center">Featured</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!Array.isArray(products) || products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <Typography variant="body2" color="text.secondary" py={4}>
                  No products found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow
                key={product.id}
                hover
                sx={{
                  opacity: product.isDiscontinued ? 0.6 : 1,
                  backgroundColor: product.isDiscontinued
                    ? 'grey.50'
                    : 'inherit',
                }}
              >
                <TableCell>
                  <Avatar
                    src={product.images?.[0]?.imageUrl}
                    alt={product.name}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  >
                    {product.name.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {product.name}
                  </Typography>
                  {product.isFeatured && (
                    <Chip label="Featured" size="small" color="secondary" />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {product.sku}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(product.price)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${product.stockQuantity} units`}
                    size="small"
                    color={getStockStatusColor(product.stockQuantity)}
                    variant="outlined"
                  />
                  <Typography variant="caption" display="block" mt={0.5}>
                    {getStockStatusText(product.stockQuantity)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {product.isDiscontinued ? (
                    <Chip
                      label="Discontinued"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label="Active"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {product.category?.name || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={product.isFeatured ? 'Remove from Featured' : 'Add to Featured'}>
                    <IconButton
                      size="small"
                      color={product.isFeatured ? 'warning' : 'default'}
                      onClick={() => onToggleFeatured?.(product.id)}
                      disabled={product.isDiscontinued}
                    >
                      {product.isFeatured ? (
                        <StarIcon fontSize="small" />
                      ) : (
                        <StarBorderIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Edit Product">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(product.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Update Stock">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onUpdateStock(product)}
                        disabled={product.isDiscontinued}
                      >
                        <StockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {product.isDiscontinued ? (
                      <Tooltip title="Reactivate Product">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onReactivate(product.id)}
                        >
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Discontinue Product">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDiscontinue(product.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductTable;
