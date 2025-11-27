import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Filter } from 'lucide-react';
import BannerTable from '../../components/admin/BannerTable';
import BannerForm from '../../components/admin/BannerForm';
import {
  fetchAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  clearAdminBannerError,
  clearAdminBannerSuccess,
} from '../../store/slices/adminBannerSlice';
import './AdminBannerManagementPage.css';

/**
 * Admin page for managing promotional banners.
 * Provides CRUD operations for banners with filtering and status management.
 */
const AdminBannerManagementPage = () => {
  const dispatch = useDispatch();
  const { banners, loading, error, success } = useSelector((state) => state.adminBanner);

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, inactive, expired

  useEffect(() => {
    dispatch(fetchAllBanners());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearAdminBannerSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearAdminBannerError());
      }, 5000);
    }
  }, [error, dispatch]);

  const handleCreate = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleDelete = (bannerId) => {
    dispatch(deleteBanner(bannerId));
  };

  const handleToggleStatus = (bannerId) => {
    dispatch(toggleBannerStatus(bannerId));
  };

  const handleSubmit = async (bannerData) => {
    if (editingBanner) {
      await dispatch(updateBanner({ bannerId: editingBanner.id, bannerData }));
    } else {
      await dispatch(createBanner(bannerData));
    }
    setShowForm(false);
    setEditingBanner(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  const getFilteredBanners = () => {
    const now = new Date();

    switch (filter) {
      case 'active':
        return banners.filter((banner) => {
          const start = new Date(banner.startDate);
          const end = new Date(banner.endDate);
          return banner.isActive && now >= start && now <= end;
        });
      case 'inactive':
        return banners.filter((banner) => !banner.isActive);
      case 'expired':
        return banners.filter((banner) => {
          const end = new Date(banner.endDate);
          return now > end;
        });
      case 'upcoming':
        return banners.filter((banner) => {
          const start = new Date(banner.startDate);
          return now < start;
        });
      default:
        return banners;
    }
  };

  const filteredBanners = getFilteredBanners();

  return (
    <div className="admin-banner-management">
      <div className="page-header">
        <div>
          <h1>Banner Management</h1>
          <p className="page-description">
            Manage promotional banners for the homepage carousel
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Add Banner
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Success:</strong> {success}
        </div>
      )}

      {showForm && (
        <div className="form-modal-overlay" onClick={handleCancel}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h2>
              <button className="close-btn" onClick={handleCancel}>
                ×
              </button>
            </div>
            <div className="form-modal-body">
              <BannerForm
                banner={editingBanner}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      <div className="filters-section">
        <div className="filters-header">
          <Filter size={20} />
          <span>Filter Banners:</span>
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({banners.length})
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Now
          </button>
          <button
            className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Expired
          </button>
        </div>
      </div>

      <div className="table-section">
        <BannerTable
          banners={filteredBanners}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminBannerManagementPage;
