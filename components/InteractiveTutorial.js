import React, { useState, useEffect } from 'react';
import { Button } from './ui';

const InteractiveTutorial = ({ steps, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Handle keyboard navigation
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onSkip();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep]);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  if (!isVisible || !steps || steps.length === 0) return null;
  
  const currentTutorialStep = steps[currentStep];
  const { target, title, content, position = 'bottom' } = currentTutorialStep;
  
  // Get target element position
  const targetElement = target ? document.querySelector(target) : null;
  let tooltipStyle = {};
  
  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    
    switch (position) {
      case 'top':
        tooltipStyle = {
          bottom: window.innerHeight - rect.top + 10,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        };
        break;
      case 'bottom':
        tooltipStyle = {
          top: rect.bottom + 10,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        };
        break;
      case 'left':
        tooltipStyle = {
          top: rect.top + rect.height / 2,
          right: window.innerWidth - rect.left + 10,
          transform: 'translateY(-50%)'
        };
        break;
      case 'right':
        tooltipStyle = {
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
          transform: 'translateY(-50%)'
        };
        break;
      default:
        // Center of screen
        tooltipStyle = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  } else {
    // Center of screen if no target
    tooltipStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onSkip}
      >
        {/* Highlight target element */}
        {targetElement && (
          <div
            className="absolute bg-white/10 border-2 border-primary-500 rounded-lg"
            style={{
              top: targetElement.getBoundingClientRect().top - 5,
              left: targetElement.getBoundingClientRect().left - 5,
              width: targetElement.getBoundingClientRect().width + 10,
              height: targetElement.getBoundingClientRect().height + 10,
            }}
          />
        )}
      </div>
      
      {/* Tutorial tooltip */}
      <div
        className="fixed z-50 bg-white dark:bg-surface-800 rounded-lg shadow-xl p-6 max-w-sm"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow pointer */}
        {targetElement && (
          <div
            className={`absolute w-0 h-0 border-8 ${
              position === 'top' 
                ? 'bottom-[-16px] left-1/2 -translate-x-1/2 border-t-white dark:border-t-surface-800 border-x-transparent border-b-transparent'
                : position === 'bottom'
                ? 'top-[-16px] left-1/2 -translate-x-1/2 border-b-white dark:border-b-surface-800 border-x-transparent border-t-transparent'
                : position === 'left'
                ? 'right-[-16px] top-1/2 -translate-y-1/2 border-l-white dark:border-l-surface-800 border-y-transparent border-r-transparent'
                : 'left-[-16px] top-1/2 -translate-y-1/2 border-r-white dark:border-r-surface-800 border-y-transparent border-l-transparent'
            }`}
          />
        )}
        
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="text-sm text-surface-600 dark:text-surface-400 mb-4">
          {content}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-surface-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
              >
                Back
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
            >
              Skip
            </Button>
            
            <Button
              size="sm"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InteractiveTutorial;