import { useState } from 'react';
import { Layout, Card, Button, ComponentErrorBoundary, AsyncErrorBoundary } from '../components';

// Component that throws an error
function BrokenComponent() {
  throw new Error('This component is intentionally broken!');
  return <div>This will never render</div>;
}

// Component that throws async error
function AsyncBrokenComponent() {
  const [trigger, setTrigger] = useState(false);
  
  if (trigger) {
    throw new Error('Async error triggered!');
  }
  
  const handleAsyncError = async () => {
    setTrigger(true);
  };
  
  return (
    <div>
      <Button onClick={handleAsyncError}>
        Trigger Async Error
      </Button>
    </div>
  );
}

export default function TestErrorPage() {
  const [showBroken, setShowBroken] = useState(false);
  const [showAsyncBroken, setShowAsyncBroken] = useState(false);
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
            Error Boundary Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page demonstrates our error boundary components. Click the buttons below to trigger errors.
          </p>
        </Card>
        
        {/* Synchronous Error Test */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Synchronous Error Test</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This will trigger a synchronous error that gets caught by the error boundary.
          </p>
          
          <ComponentErrorBoundary componentName="Broken Component">
            {showBroken ? (
              <BrokenComponent />
            ) : (
              <Button
                onClick={() => setShowBroken(true)}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                Trigger Synchronous Error
              </Button>
            )}
          </ComponentErrorBoundary>
        </Card>
        
        {/* Async Error Test */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Async Error Test</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This will trigger an async error with a retry option.
          </p>
          
          <AsyncErrorBoundary>
            {({ handleAsyncError }) => (
              <ComponentErrorBoundary componentName="Async Component">
                {showAsyncBroken ? (
                  <AsyncBrokenComponent />
                ) : (
                  <Button
                    onClick={() => setShowAsyncBroken(true)}
                    className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                  >
                    Show Async Error Component
                  </Button>
                )}
              </ComponentErrorBoundary>
            )}
          </AsyncErrorBoundary>
        </Card>
        
        {/* Reset Test */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Reset Everything</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Reset all error states to try again.
          </p>
          <Button
            onClick={() => {
              setShowBroken(false);
              setShowAsyncBroken(false);
            }}
            variant="secondary"
          >
            Reset All Errors
          </Button>
        </Card>
      </div>
    </Layout>
  );
}