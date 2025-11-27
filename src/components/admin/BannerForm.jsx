import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import PropTypes from 'prop-types';
import productService from '../../services/productService';
import './BannerForm.css';

/**
 * Form component for creating or editing promotional banners.
 * Handles validation, product search, and link type selection.
 */
const BannerForm = ({ banner, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkType: 'none', // 'none', 'url', 'product'
    linkUrl: '',
    linkProductId: null,
    displayOrder: 0,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (banner) {
      // Edit mode: populate form with banner data
      setFormData({
        title: banner.title || '',
        imageUrl: banner.imageUrl || '',
        linkType: banner.linkUrl ? 'url' : banner.linkProductId ? 'product' : 'none',
        linkUrl: banner.linkUrl || '',
        linkProductId: banner.linkProductId || null,
        displayOrder: banner.displayOrder || 0,
        startDate: banner.startDate ? banner.startDate.substring(0, 16) : '',
        endDate: banner.endDate ? banner.endDate.substring(0, 16) : '',
        isActive: banner.isActive !== undefined ? banner.isActive : true,
      });

      if (banner.linkProductId && banner.productName) {
        setSelectedProduct({
          id: banner.linkProductId,
          name: banner.productName,
        });
        setProductSearch(banner.productName);
      }
    }
  }, [banner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleLinkTypeChange = (e) => {
    const linkType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      linkType,
      linkUrl: linkType === 'url' ? prev.linkUrl : '',
      linkProductId: linkType === 'product' ? prev.linkProductId : null,
    }));
  };

  const handleProductSearch = async (e) => {
    const value = e.target.value;
    setProductSearch(value);
    
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    setShowResults(true);
    
    try {
      const response = await productService.searchProducts(value, { size: 10 });
      // Response structure: { content: [...], totalElements, totalPages, etc. }
      const products = response.content || response.data || response || [];
      setSearchResults(products);
    } catch (error) {
      console.error('Product search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setShowResults(false);
    setFormData((prev) => ({
      ...prev,
      linkProductId: product.id,
    }));
  };

  const clearProductSelection = () => {
    setSelectedProduct(null);
    setProductSearch('');
    setSearchResults([]);
    setShowResults(false);
    setFormData((prev) => ({
      ...prev,
      linkProductId: null,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'Must be a valid URL';
      }
    }

    if (formData.linkType === 'url' && !formData.linkUrl.trim()) {
      newErrors.linkUrl = 'URL is required when link type is URL';
    }

    if (formData.linkType === 'url' && formData.linkUrl.trim()) {
      try {
        new URL(formData.linkUrl);
      } catch {
        newErrors.linkUrl = 'Must be a valid URL';
      }
    }

    if (formData.linkType === 'product' && !formData.linkProductId) {
      newErrors.linkProductId = 'Please select a product';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Prepare submission data
    const submitData = {
      title: formData.title.trim(),
      imageUrl: formData.imageUrl.trim(),
      linkUrl: formData.linkType === 'url' ? formData.linkUrl.trim() : null,
      linkProductId: formData.linkType === 'product' ? formData.linkProductId : null,
      displayOrder: parseInt(formData.displayOrder, 10),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
    };

    onSubmit(submitData);
  };

  return (
    <form className="banner-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">
          Banner Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'error' : ''}
          placeholder="Enter banner title"
          maxLength={255}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="imageUrl">
          Image URL <span className="required">*</span>
        </label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className={errors.imageUrl ? 'error' : ''}
          placeholder="https://example.com/banner.jpg"
        />
        {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
        {formData.imageUrl && (
          <div className="image-preview">
            <img src={formData.imageUrl} alt="Banner preview" onError={(e) => {
              e.target.style.display = 'none';
            }} />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Link Type</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="linkType"
              value="none"
              checked={formData.linkType === 'none'}
              onChange={handleLinkTypeChange}
            />
            <span>No Link</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="linkType"
              value="url"
              checked={formData.linkType === 'url'}
              onChange={handleLinkTypeChange}
            />
            <span>External URL</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="linkType"
              value="product"
              checked={formData.linkType === 'product'}
              onChange={handleLinkTypeChange}
            />
            <span>Link to Product</span>
          </label>
        </div>
      </div>

      {formData.linkType === 'url' && (
        <div className="form-group">
          <label htmlFor="linkUrl">
            External URL <span className="required">*</span>
          </label>
          <input
            type="text"
            id="linkUrl"
            name="linkUrl"
            value={formData.linkUrl}
            onChange={handleChange}
            className={errors.linkUrl ? 'error' : ''}
            placeholder="https://example.com/promotion"
          />
          {errors.linkUrl && <span className="error-message">{errors.linkUrl}</span>}
        </div>
      )}

      {formData.linkType === 'product' && (
        <div className="form-group">
          <label htmlFor="productSearch">
            Link to Product <span className="required">*</span>
          </label>
          <div className="product-search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                id="productSearch"
                value={productSearch}
                onChange={handleProductSearch}
                onFocus={() => productSearch.length >= 2 && setShowResults(true)}
                className={errors.linkProductId ? 'error' : ''}
                placeholder="Search for product by name..."
              />
              {selectedProduct && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={clearProductSelection}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {showResults && (
              <div className="product-search-results">
                {searching && <div className="search-loading">Searching...</div>}
                {!searching && searchResults.length === 0 && (
                  <div className="no-results">No products found</div>
                )}
                {!searching && searchResults.length > 0 && (
                  <ul className="results-list">
                    {searchResults.map((product) => (
                      <li
                        key={product.id}
                        className="result-item"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-meta">
                            ID: {product.id} | ${product.price}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {selectedProduct && (
              <div className="selected-product">
                Selected: <strong>{selectedProduct.name}</strong> (ID: {selectedProduct.id})
              </div>
            )}
          </div>
          {errors.linkProductId && <span className="error-message">{errors.linkProductId}</span>}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">
            Start Date <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={errors.startDate ? 'error' : ''}
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate">
            End Date <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={errors.endDate ? 'error' : ''}
          />
          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="displayOrder">Display Order</label>
        <input
          type="number"
          id="displayOrder"
          name="displayOrder"
          value={formData.displayOrder}
          onChange={handleChange}
          min="0"
          step="1"
        />
        <p className="help-text">Lower numbers display first (0, 1, 2...)</p>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <span>Banner is Active</span>
        </label>
        <p className="help-text">
          Inactive banners will not be displayed on the homepage
        </p>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-cancel"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : banner ? 'Update Banner' : 'Create Banner'}
        </button>
      </div>
    </form>
  );
};

BannerForm.propTypes = {
  banner: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    imageUrl: PropTypes.string,
    linkUrl: PropTypes.string,
    linkProductId: PropTypes.number,
    productName: PropTypes.string,
    displayOrder: PropTypes.number,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    isActive: PropTypes.bool,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

BannerForm.defaultProps = {
  banner: null,
  loading: false,
};

export default BannerForm;
