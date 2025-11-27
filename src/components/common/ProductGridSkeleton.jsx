/**
 * ProductGridSkeleton Component
 * 
 * Skeleton loader for product grid while data is loading.
 */
const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="card overflow-hidden animate-pulse">
          {/* Image Skeleton */}
          <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300" />
          
          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
            </div>
            
            {/* Rating */}
            <div className="h-4 bg-gray-200 rounded w-24" />
            
            {/* Price */}
            <div className="h-7 bg-gray-200 rounded w-20" />
            
            {/* Button */}
            <div className="h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
