import React from 'react';
import Card from './Card';
import Skeleton from './Skeleton';

export default function SkeletonCard({ showAvatar = false, lines = 3 }) {
  return (
    <Card className="animate-fadeIn">
      {showAvatar && (
        <div className="flex items-center mb-4">
          <Skeleton variant="circle" className="mr-3" />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" className="mb-2" />
            <Skeleton variant="text" width="40%" height="3" />
          </div>
        </div>
      )}
      
      {!showAvatar && (
        <>
          <Skeleton variant="title" width="70%" className="mb-4" />
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton 
              key={index} 
              variant="text" 
              width={index === lines - 1 ? "80%" : "100%"}
              className="mb-2"
            />
          ))}
        </>
      )}
    </Card>
  );
}