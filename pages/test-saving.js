import { useState } from 'react';
import { Layout, Card, Button, Input, Checkbox } from '../components';
import { useAutoSave } from '../hooks/useAutoSave';
import { useSaving } from '../contexts/SavingContext';

export default function TestSavingPage() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subscribe: false
  });

  // Different saving examples
  const [globalSaveData, setGlobalSaveData] = useState('');
  
  // Global saving indicator
  const { startSaving, savingSuccess, savingError } = useSaving('test_global');
  
  // Auto-save mock function
  const mockSave = async (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(data);
        } else {
          reject(new Error('Mock save failed'));
        }
      }, 1500);
    });
  };

  // Auto-save for form
  const {
    isDirty,
    lastSaved,
    saveNow,
    SavingIndicator
  } = useAutoSave({
    data: formData,
    onSave: mockSave,
    enabled: true,
    delay: 2000
  });

  // Handle form changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Global save example
  const handleGlobalSave = async () => {
    startSaving('Saving global data...');
    try {
      await mockSave(globalSaveData);
      savingSuccess('Global data saved successfully!');
    } catch (error) {
      savingError('Failed to save global data');
    }
  };

  // Multiple saves example
  const handleMultipleSaves = async () => {
    // Start multiple save operations
    const saves = ['file1', 'file2', 'file3'].map(async (file, index) => {
      const { startSaving, savingSuccess, savingError } = useSaving(`${file}_save`);
      
      startSaving(`Saving ${file}...`);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000 + index * 500));
        savingSuccess(`${file} saved!`);
      } catch (error) {
        savingError(`Failed to save ${file}`);
      }
    });
    
    await Promise.all(saves);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Real-time Saving Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This page demonstrates the real-time saving indicators and auto-save functionality.
          </p>
        </Card>

        {/* Auto-save Form Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Auto-save Form</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            This form auto-saves after 2 seconds of inactivity. Try editing the fields!
          </p>
          
          <div className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your name"
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Enter your message"
              />
            </div>
            
            <Checkbox
              checked={formData.subscribe}
              onChange={(e) => handleInputChange('subscribe', e.target.checked)}
              label="Subscribe to newsletter"
            />
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={saveNow}
                disabled={!isDirty}
                variant="secondary"
              >
                Save Now
              </Button>
              {isDirty && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </span>
              )}
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <SavingIndicator />
          </div>
        </Card>

        {/* Global Saving Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Global Saving Indicator</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Global saving indicators appear in the bottom-left corner.
          </p>
          
          <Input
            label="Global Data"
            value={globalSaveData}
            onChange={(e) => setGlobalSaveData(e.target.value)}
            placeholder="Enter some data to save"
            className="mb-4"
          />
          
          <Button
            onClick={handleGlobalSave}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            Save Global Data
          </Button>
        </Card>

        {/* Multiple Saves Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Multiple Simultaneous Saves</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This demonstrates multiple save operations happening at once.
          </p>
          
          <Button
            onClick={handleMultipleSaves}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Trigger Multiple Saves
          </Button>
        </Card>

        {/* Status Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Auto-save triggers after 2 seconds of inactivity</li>
            <li>• Manual save available with "Save Now" button</li>
            <li>• Global indicators show in bottom-left corner</li>
            <li>• Local indicators show inline with forms</li>
            <li>• Success/error states auto-hide after 3 seconds</li>
            <li>• Multiple saves can run simultaneously</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}