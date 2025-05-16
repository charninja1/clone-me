import { useEffect, useState } from 'react';

export default function AnimatedTransition({ 
  children, 
  delay = 0, 
  duration = 500,
  animation = 'fadeIn' 
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationClass = {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    scaleIn: 'animate-scaleIn',
    slideDown: 'animate-slideDown',
    slideUp: 'animate-slideUp'
  }[animation] || 'animate-fadeIn';

  return (
    <div 
      className={`transition-all ${duration === 300 ? 'duration-300' : duration === 500 ? 'duration-500' : 'duration-700'} ${
        visible ? animationClass : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
}