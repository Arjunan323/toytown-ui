import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import {
  Edit,
  Delete,
  Image,
  Public
} from '@mui/icons-material';

/**
 * ManufacturerTable component displays manufacturers in a table format.
 */
const ManufacturerTable = ({
  manufacturers,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onUploadLogo,
  onToggleStatus,
  loading
}) => {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && manufacturers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : manufacturers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No manufacturers found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              manufacturers.map((manufacturer) => (
                <TableRow key={manufacturer.id} hover>
                  <TableCell>
                    <Avatar
                      src={manufacturer.logoUrl}
                      alt={manufacturer.name}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    >
                      {!manufacturer.logoUrl && manufacturer.name.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={manufacturer.isActive ? 'text.primary' : 'text.disabled'}
                      >
                        {manufacturer.name}
                      </Typography>
                      {manufacturer.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {manufacturer.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{manufacturer.country || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    {manufacturer.websiteUrl ? (
                      <Tooltip title="Visit website">
                        <IconButton
                          size="small"
                          component="a"
                          href={manufacturer.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Public fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={manufacturer.isActive ? 'Active' : 'Inactive'}
                      color={manufacturer.isActive ? 'success' : 'default'}
                      size="small"
                      onClick={() => onToggleStatus(manufacturer.id)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title="Upload logo">
                        <IconButton
                          size="small"
                          onClick={() => onUploadLogo(manufacturer)}
                          color="primary"
                        >
                          <Image fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(manufacturer)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(manufacturer)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

ManufacturerTable.propTypes = {
  manufacturers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      logoUrl: PropTypes.string,
      country: PropTypes.string,
      websiteUrl: PropTypes.string,
      isActive: PropTypes.bool.isRequired
    })
  ).isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalElements: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUploadLogo: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ManufacturerTable;
