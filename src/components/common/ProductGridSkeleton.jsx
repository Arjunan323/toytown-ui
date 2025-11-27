import { Grid, Card, CardContent, Skeleton, Box } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ProductGridSkeleton Component
 * 
 * Displays skeleton loaders while products are loading.
 * Provides visual feedback during async operations.
 */
function ProductGridSkeleton({ count = 8 }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card elevation={2}>
            {/* Image skeleton */}
            <Skeleton 
              variant="rectangular" 
              height={200} 
              animation="wave"
              sx={{ bgcolor: 'grey.200' }}
            />
            
            <CardContent>
              {/* Title skeleton */}
              <Skeleton 
                variant="text" 
                width="80%" 
                height={28}
                animation="wave"
                sx={{ mb: 1 }}
              />
              
              {/* Subtitle skeleton */}
              <Skeleton 
                variant="text" 
                width="60%" 
                height={20}
                animation="wave"
                sx={{ mb: 2 }}
              />
              
              {/* Price and button skeleton */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton 
                  variant="text" 
                  width={80} 
                  height={32}
                  animation="wave"
                />
                <Skeleton 
                  variant="rectangular" 
                  width={100} 
                  height={36}
                  animation="wave"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

ProductGridSkeleton.propTypes = {
  count: PropTypes.number,
};

export default ProductGridSkeleton;
