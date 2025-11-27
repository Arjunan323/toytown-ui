import { useState } from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import PropTypes from 'prop-types';
import './BannerTable.css';

/**
 * Admin table component for managing promotional banners.
 * Displays all banners with actions for edit, delete, and toggle status.
 */
const BannerTable = ({ banners, onEdit, onDelete, onToggleStatus, loading }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'displayOrder', direction: 'asc' });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (banner) => {
    const now = new Date();
    const start = new Date(banner.startDate);
    const end = new Date(banner.endDate);

    if (!banner.isActive) {
      return <span className="status-badge inactive">Inactive</span>;
    }

    if (now < start) {
      return <span className="status-badge upcoming">Upcoming</span>;
    }

    if (now > end) {
      return <span className="status-badge expired">Expired</span>;
    }

    return <span className="status-badge active">Active</span>;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBanners = [...banners].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleDeleteClick = (banner) => {
    if (window.confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      onDelete(banner.id);
    }
  };

  if (loading) {
    return (
      <div className="banner-table-loading">
        <div className="spinner"></div>
        <p>Loading banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="banner-table-empty">
        <p>No banners found. Create your first promotional banner!</p>
      </div>
    );
  }

  return (
    <div className="banner-table-container">
      <table className="banner-table">
        <thead>
          <tr>
            <th>Image</th>
            <th 
              onClick={() => handleSort('title')}
              className="sortable"
            >
              Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Link</th>
            <th 
              onClick={() => handleSort('displayOrder')}
              className="sortable"
            >
              Order {sortConfig.key === 'displayOrder' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Date Range</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedBanners.map((banner) => (
            <tr key={banner.id}>
              <td>
                <div className="banner-thumbnail">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.png';
                    }}
                  />
                </div>
              </td>
              <td>
                <div className="banner-title">{banner.title}</div>
              </td>
              <td>
                <div className="banner-link">
                  {banner.linkUrl && (
                    <a 
                      href={banner.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-external"
                    >
                      External Link <ExternalLink size={14} />
                    </a>
                  )}
                  {banner.linkProductId && (
                    <span className="link-product">
                      Product: {banner.productName || `ID ${banner.linkProductId}`}
                    </span>
                  )}
                  {!banner.linkUrl && !banner.linkProductId && (
                    <span className="link-none">No link</span>
                  )}
                </div>
              </td>
              <td>
                <div className="banner-order">{banner.displayOrder}</div>
              </td>
              <td>
                <div className="banner-dates">
                  <div>{formatDate(banner.startDate)}</div>
                  <div className="date-separator">to</div>
                  <div>{formatDate(banner.endDate)}</div>
                </div>
              </td>
              <td>{getStatusBadge(banner)}</td>
              <td>
                <div className="banner-actions">
                  <button
                    className="action-btn toggle-btn"
                    onClick={() => onToggleStatus(banner.id)}
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? (
                      <ToggleRight size={20} />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEdit(banner)}
                    title="Edit Banner"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteClick(banner)}
                    title="Delete Banner"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

BannerTable.propTypes = {
  banners: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      linkUrl: PropTypes.string,
      linkProductId: PropTypes.number,
      productName: PropTypes.string,
      displayOrder: PropTypes.number.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

BannerTable.defaultProps = {
  loading: false,
};

export default BannerTable;
