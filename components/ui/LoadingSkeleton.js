const LoadingSkeleton = ({ className = "", lines = 1, height = "h-4" }) => {
  return (
    <div className={`${className} animate-pulse`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-surface-200 dark:bg-surface-700 rounded mb-2 last:mb-0`}
          style={{
            width: index === lines - 1 && lines > 1 ? "80%" : "100%"
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;