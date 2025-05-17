import SkeletonCard from './SkeletonCard';

const LoadingSkeleton = ({ count = 1, height = 200 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} lines={4} />
      ))}
    </>
  );
};

export default LoadingSkeleton;