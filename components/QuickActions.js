import { useState } from 'react';
import { Button } from '../components';

export default function QuickActions({ onAction }) {
  const [selectedAction, setSelectedAction] = useState(null);

  const actions = [
    { id: 'copy', icon: '📋', label: 'Copy to Clipboard', action: 'copy' },
    { id: 'gmail', icon: '📧', label: 'Open in Gmail', action: 'gmail' },
    { id: 'download', icon: '⬇️', label: 'Download', action: 'download' },
    { id: 'share', icon: '🔗', label: 'Share', action: 'share' }
  ];

  const handleAction = (action) => {
    setSelectedAction(action.id);
    onAction(action.action);
    
    // Reset animation after 2 seconds
    setTimeout(() => setSelectedAction(null), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.id}
          onClick={() => handleAction(action)}
          variant="outline"
          size="sm"
          className={`hover:scale-105 transition-all duration-300 ${
            selectedAction === action.id ? 'ring-2 ring-primary-500 scale-110' : ''
          }`}
          icon={<span className={selectedAction === action.id ? 'animate-bounce' : ''}>{action.icon}</span>}
        >
          {selectedAction === action.id ? 'Done!' : action.label}
        </Button>
      ))}
    </div>
  );
}