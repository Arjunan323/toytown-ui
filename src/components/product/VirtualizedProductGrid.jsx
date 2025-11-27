import { useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import ProductCard from './ProductCard';
import PropTypes from 'prop-types';

/**
 * VirtualizedProductGrid Component
 * 
 * Efficiently renders large product lists using virtual scrolling.
 * Only renders visible items for optimal performance.
 * Automatically switches to regular grid for smaller result sets.
 */
function VirtualizedProductGrid({ products, onAddToCart, onProductClick }) {
  const theme = useTheme();
  const gridRef = useRef(null);
  
  // Responsive column count
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const columnCount = isXs ? 1 : isSm ? 2 : isMd ? 3 : 4;
  const columnWidth = isXs ? 300 : isSm ? 280 : isMd ? 260 : 240;
  const rowHeight = 400; // Height of ProductCard
  const rowCount = Math.ceil(products.length / columnCount);
  
  // Calculate grid dimensions
  const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 1200; // Adjust for container padding
  const gridWidth = Math.min(containerWidth, columnCount * (columnWidth + 24)); // 24px for spacing
  const gridHeight = Math.min(800, window.innerHeight - 300); // Max height with spacing for header/footer

  // Reset scroll position when products change
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTo({ scrollTop: 0 });
    }
  }, [products]);

  // Cell renderer
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    
    if (index >= products.length) {
      return null;
    }
    
    const product = products[index];
    
    return (
      <Box
        style={style}
        sx={{
          padding: 1.5,
          boxSizing: 'border-box',
        }}
      >
        <ProductCard 
          id={product.id}
          name={product.name}
          price={product.price}
          imageUrl={product.images?.[0]?.imageUrl || product.imageUrl || '/placeholder-toy.jpg'}
          rating={product.averageRating || product.rating || 0}
          reviewCount={product.reviewCount || 0}
          inStock={product.stockQuantity > 0 || product.inStock}
          isFeatured={product.isFeatured || false}
          onClick={onProductClick}
        />
      </Box>
    );
  };

  Cell.propTypes = {
    columnIndex: PropTypes.number.isRequired,
    rowIndex: PropTypes.number.isRequired,
    style: PropTypes.object.isRequired,
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mb: 3,
      }}
    >
      <Grid
        ref={gridRef}
        columnCount={columnCount}
        columnWidth={columnWidth + 24}
        height={gridHeight}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={gridWidth}
        style={{
          outline: 'none',
        }}
      >
        {Cell}
      </Grid>
    </Box>
  );
}

VirtualizedProductGrid.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      productId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      imageUrl: PropTypes.string,
      manufacturer: PropTypes.string,
      ageMin: PropTypes.number,
      ageMax: PropTypes.number,
    })
  ).isRequired,
  onAddToCart: PropTypes.func,
  onProductClick: PropTypes.func,
};

export default VirtualizedProductGrid;
