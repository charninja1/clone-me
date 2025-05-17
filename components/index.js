// For backward compatibility
export { default as Layout } from './layout/MainLayout';

// UI Components
export * from './ui';

// Layout Components
export * from './layout';

// Onboarding & Help Components
export { default as SimpleOnboarding } from './SimpleOnboarding';
export { default as SimpleDashboard } from './SimpleDashboard';
export { default as InteractiveTutorial } from './InteractiveTutorial';
export { default as HelpTooltip } from './HelpTooltip';
export { default as SimpleVoiceCreator } from './SimpleVoiceCreator';
export { default as ContextDetector } from './ContextDetector';

// Email Generation Components
export { default as GenerationForm } from './GenerationForm';
export { default as GeneratedEmailDisplay } from './GeneratedEmailDisplay';
export { default as SavedEmailsList } from './SavedEmailsList';

// Voice Components
export { default as VoicesList } from './VoicesList';

// Error Boundaries
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as PageErrorBoundary } from './PageErrorBoundary';
export { default as ComponentErrorBoundary } from './ComponentErrorBoundary';