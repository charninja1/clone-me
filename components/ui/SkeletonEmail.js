import React from 'react';
import Card from './Card';
import Skeleton from './Skeleton';

export default function SkeletonEmail() {
  return (
    <Card className="animate-fadeIn">
      {/* Subject line */}
      <Skeleton variant="title" width="80%" className="mb-6" />
      
      {/* Email body */}
      <div className="space-y-4">
        <div>
          <Skeleton variant="text" className="mb-2" />
          <Skeleton variant="text" className="mb-2" />
          <Skeleton variant="text" width="70%" />
        </div>
        
        <div>
          <Skeleton variant="text" className="mb-2" />
          <Skeleton variant="text" width="90%" />
        </div>
        
        <div>
          <Skeleton variant="text" className="mb-2" />
          <Skeleton variant="text" className="mb-2" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <Skeleton variant="button" width="120px" />
        <Skeleton variant="button" width="120px" />
      </div>
    </Card>
  );
}