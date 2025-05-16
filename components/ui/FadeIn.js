const FadeIn = ({ children, delay = 0, duration = 500, className = "" }) => {
  return (
    <div
      className={`animate-fadeIn ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;