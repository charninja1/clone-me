import { useState, useEffect } from 'react';
import { Card, Button, Select, TextArea, Badge, EmailDisplay } from '../components';
import LoadingSkeleton from './ui/LoadingSkeleton';

export default function SavedEmailsList({
  emails,
  voices,
  filterVoiceId,
  onFilterChange,
  onRevise,
  onApprove,
  onEmailEdit,
  onRevisionEdit,
  onCopy,
  onOpenGmail,
  onDownload,
  feedbacks,
  onFeedbackChange,
  loadingId,
  isLoading = false
}) {
  const [animatedItems, setAnimatedItems] = useState({});
  
  useEffect(() => {
    // Animate emails as they appear
    emails.forEach((email, index) => {
      setTimeout(() => {
        setAnimatedItems(prev => ({ ...prev, [email.id]: true }));
      }, index * 100);
    });
  }, [emails]);

  const getFilteredEmails = () => {
    if (filterVoiceId === "all") {
      return emails;
    }
    return emails.filter(email => email.voiceId === filterVoiceId);
  };

  const filteredEmails = getFilteredEmails();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton count={3} height={200} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-300">
          Your Saved Emails
        </h2>
        
        <div className="max-w-xs">
          <Select
            id="filter-voice"
            value={filterVoiceId}
            onChange={(e) => onFilterChange(e.target.value)}
            options={[
              { value: "all", label: "All Voices" },
              ...voices.map(voice => ({ value: voice.id, label: voice.name }))
            ]}
          />
        </div>
      </div>
      
      {emails.length === 0 ? (
        <Card className="text-center p-12 animate-fadeIn">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full mx-auto flex items-center justify-center">
              <span className="text-3xl">📧</span>
            </div>
            <p className="text-surface-600 dark:text-surface-400 text-lg">
              No saved emails yet. Generate your first one above!
            </p>
          </div>
        </Card>
      ) : filteredEmails.length === 0 ? (
        <Card className="text-center p-8 animate-fadeIn">
          <p className="text-surface-600 dark:text-surface-400">
            No emails found with the selected voice. Try selecting a different voice or generate a new email.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredEmails.map((email) => (
            <Card 
              key={email.id} 
              className={`overflow-hidden p-0 shadow-md hover:shadow-xl transition-all duration-500 ${
                animatedItems[email.id] ? 'animate-slideIn' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="p-6">
                {/* Email header */}
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div className="mb-2 mr-4">
                    <span className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                      Topic:
                    </span>
                    <h3 className="text-lg font-medium text-surface-900 dark:text-surface-200">
                      {email.originalTopic}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="mr-2 animate-fadeIn">
                      {voices.find(v => v.id === email.voiceId)?.name || "Unknown Voice"}
                    </Badge>
                    
                    {email.approved && (
                      <Badge variant="success" className="animate-scaleIn">
                        ✅ Approved
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Original email */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Current Email:
                  </h4>
                  <EmailDisplay 
                    email={email.generatedEmail}
                    onCopy={onCopy}
                    onOpenInGmail={onOpenGmail}
                    onDownload={(text) => onDownload(text, `email-${email.id}.txt`)}
                    onEdit={(newContent) => onEmailEdit(email.id, newContent)}
                    editable={true}
                    autoSave={true}
                    showHeader={false}
                  />
                </div>
                
                {/* Feedback section */}
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                  <TextArea
                    id={`feedback-${email.id}`}
                    label="Feedback for revision:"
                    placeholder="What would you like to change?"
                    rows={3}
                    value={feedbacks[email.id] || ""}
                    onChange={(e) => onFeedbackChange(email.id, e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    onClick={() => onRevise(email)}
                    disabled={loadingId === email.id || !feedbacks[email.id]}
                    isLoading={loadingId === email.id}
                    className="hover:scale-105 transition-transform"
                  >
                    Revise with AI
                  </Button>
                </div>

                {/* Revision display */}
                {email.revision && (
                  <div className="mt-6 border-t border-surface-200 dark:border-surface-700 pt-4 animate-slideIn">
                    <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      AI Revision:
                    </h4>
                    <EmailDisplay 
                      email={email.revision}
                      onCopy={onCopy}
                      onOpenInGmail={onOpenGmail}
                      onDownload={(text) => onDownload(text, `revision-${email.id}.txt`)}
                      onEdit={(newContent) => onRevisionEdit(email.id, newContent)}
                      editable={true}
                      autoSave={true}
                      showHeader={false}
                    />
                    
                    {!email.approved && (
                      <div className="mt-4">
                        <Button
                          onClick={() => onApprove(email.id)}
                          variant="success"
                          icon={<span>✅</span>}
                          className="hover:scale-105 transition-transform animate-fadeIn"
                        >
                          Approve for Training
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}