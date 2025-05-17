# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL DESIGN PRINCIPLE: SIMPLICITY FIRST

**Our users want a SIMPLE, EASY-TO-USE tool, not a complicated application.**

### Core Design Philosophy
- **Less is More**: Every feature must justify its existence
- **Minimal Clicks**: Users should achieve their goals with minimal interaction
- **Clear Purpose**: Each button/option should have an obvious function
- **No Feature Creep**: Resist adding "nice to have" features that complicate the experience
- **Progressive Disclosure**: Show advanced features only when needed

### UI/UX Guidelines
1. **Clean Interface**
   - Maximum 3-4 options visible at once
   - Use icons + text for clarity
   - Plenty of whitespace
   - No nested menus or complex hierarchies

2. **Smart Defaults**
   - Everything should work out-of-the-box
   - Advanced settings hidden by default
   - Common use cases prioritized

3. **One-Click Actions**
   - Generate email → One button
   - Copy → One click
   - Edit → One click
   - Save → Automatic or one click

4. **No Overwhelming Options**
   - Limit quick actions to 4-5 max
   - Group related features
   - Hide rarely used features
   - Avoid technical jargon

### Implementation Principles
- **Start Simple**: Launch with minimal viable features
- **User Testing**: Let user feedback drive additions
- **Remove Friction**: Every extra step is a potential user drop-off
- **Mobile-First**: Must work perfectly on phones
- **Fast**: Every action should feel instant

## Commands

### Development

```bash
# Start the development server with Turbopack
npm run dev

# Build the application for production
npm run build

# Start the production server
npm run start

# Run ESLint
npm run lint
```

## Project Architecture

This is a Next.js application that provides an AI-powered email generation tool with Firebase authentication and Firestore database integration.

### Core Components

1. **Authentication** - Firebase Authentication is used for user management (login, signup, etc.)
2. **Database** - Firestore is used to store user data, email tones, and generated emails
3. **API Endpoints** - Next.js API routes for email generation, revision, and embedding
4. **UI** - React components for the user interface with dark mode support

### Key Files and Directories

- `/lib/firebase.js` - Firebase initialization and exports for auth and db
- `/pages/index.js` - Main page for email generation
- `/pages/tones.js` - Management of email tones/voice styles
- `/pages/settings.js` - User settings management 
- `/pages/login.js` - Authentication page
- `/pages/api/` - API endpoints:
  - `embed.js` - Creates embeddings for generated emails
  - `generate.js` - Generates emails (currently uses mock data)
  - `revise.js` - Revises emails based on user feedback
- `/components/` - UI and layout components:
  - `/components/layout/` - Layout components (MainLayout)
  - `/components/ui/` - UI component library (Button, Input, Card, etc.)
- `/contexts/ThemeContext.js` - Context for managing theme state

### Data Model

1. **Users** - Stored in Firestore `users` collection
   - Default voice/tone settings
   - UI preferences
   - First name and last name (to be added)
   
2. **Voices/Tones** - Stored in Firestore `voices` collection
   - Instructions for how to write in specific tones
   - Associated with user accounts
   - Each tone should represent a distinct writing style

3. **Emails** - Stored in Firestore `emails` collection
   - Generated emails
   - Revisions
   - Approval status
   - Embeddings for similarity matching
   - Associated with specific tone

### Application Flow

1. Users authenticate with email/password
2. Users can create and manage different writing "tones"
3. Users provide a topic and select a tone for email generation
4. The system uses previously approved emails as examples when generating new ones
5. Users can provide feedback for revisions
6. Users can approve emails for training (adds embeddings for similarity matching)
7. Generated emails can be copied, downloaded, or opened in Gmail

### OpenAI Integration

The application uses OpenAI API for:
1. Text generation (GPT models)
2. Text embeddings (Ada embeddings)

Note: Some API calls are currently mocked in development.

## Requirements and TODOs

### Core Mission
CloneMe AI for Emails enables users to generate emails in their own voice, across multiple personalized tones such as formal, academic, professional, and casual. The AI must sound indistinguishable from human-written content and should be able to evolve through direct feedback from the user to ensure it truly mirrors how they write.

### Tier 1: Core Email Voice Engine (Primary Requirements)

1. **Individualized Email Tones (FOUNDATIONAL REQUIREMENT)**
   - Each user can create and manage multiple tones—e.g., "Professor Tone," "Internship Applications," "Casual Check-ins."
   - Each tone functions as a separate voice profile, with its own personalized training data.
   - Users must be able to provide written samples and conversational feedback to refine each tone.

2. **Real-Time Conversational Tuning**
   - Users can talk to the AI and say things like:
     - "I don't talk like that."
     - "Don't use that word, I'd say ___ instead."
     - "This is too formal/casual/wordy/etc."
   - The AI must remember this feedback per tone, per user.
   - All updates must persist across sessions.

3. **Human-Sounding, Undetectable Output**
   - Emails must be indistinguishable from human-written text.
   - By definition of being trained on the user's real voice and adjusted through dialogue, output should:
     - Be undetectable by AI detectors.
     - Avoid generic or templated phrasing.
     - Reflect the user's personal phrasing, rhythm, and style.

### Tier 2: Email Generation Experience

4. **Seamless Generation UI**
   - Users choose:
     - The tone (e.g., "Professor Tone").
     - The email type (e.g., "Thank You," "Request," "Follow-Up").
     - Input prompt or key message to send.
   - AI returns a draft in the selected voice.

5. **Inline Revisions and Feedback**
   - User can revise or edit any sentence inline.
   - Feedback options include:
     - "Too formal"
     - "Not how I'd phrase this"
     - "Use this word instead: ___"
   - Option to instantly retrain the voice profile from feedback.

### Tier 3: Data and Memory Management

6. **Tone Memory System**
   - All conversational edits and feedback are saved per tone.
   - A tone can be exported, duplicated, or version-controlled.
   - System stores examples, corrections, and vocabulary preferences.

7. **Auto-Save and Versioning**
   - Emails are auto-saved after generation and after revisions (if user enables).
   - Option to delete last auto-save.
   - Logs store training interactions for transparency and retraining.

### Tier 4: User Settings & Controls

8. **Personal Settings Panel**
   - Toggles for:
     - Auto-copy to clipboard
     - Auto-save on generate/revise
     - Auto-open Gmail with email body
   - Live updates without page reload.

9. **Privacy and Data Protection**
   - All personal voice data stays user-owned and secure.
   - Option to delete data and voice memory fully at any time.

### Simplicity Examples in Our App

1. **Email Generation**
   - One text box for input
   - One button to generate
   - Automatic voice selection (uses default)
   - No complex forms or options

2. **Voice Training**
   - Simple personality quiz (not technical)
   - Quick feedback buttons (not detailed forms)
   - Visual progress indicators
   - Auto-saves everything

3. **Settings**
   - Only 3 toggles (auto-save, auto-copy, auto-Gmail)
   - Set once and forget
   - No complex configuration

4. **Revision System**
   - One "Edit" button
   - Only 4 quick adjustment options
   - Simple save/cancel
   - No complex versioning UI (handled in background)

### How to Evaluate New Features

Before adding ANY new feature, ask:
1. Can 80% of users understand it in 5 seconds?
2. Does it require documentation to use?
3. Can it be done in 1-2 clicks?
4. Will it confuse new users?
5. Is there a simpler way?

If any answer is "no" or "yes" (for #2 and #4), reconsider the implementation.

### Current Implementation Status

#### ✅ Completed Features

1. **Voice System with Advanced Training**:
   - Full voice management system with Firebase integration
   - Voice renaming throughout codebase (was "tones")
   - Voice onboarding wizard with personality quiz
   - Interactive voice calibration mode
   - Feedback memory visualization and analytics
   - Voice training status indicators

2. **Human-like Email Generation**:
   - OpenAI API integration with human-like instructions
   - Pattern analysis from user's sample emails
   - Personality-based variety patterns for natural variations
   - Dynamic language variations based on formality/warmth/emotion settings
   - Feedback memory integration for continuous improvement

3. **Modern UI/UX**:
   - Enhanced UI with subtle gradients, animations, and modern styling
   - Dark mode support with smooth transitions
   - Component library (Button, Card, Input, etc.)
   - Voice training indicators throughout the app
   - Auto-save functionality for generated emails
   - Loading skeletons for better UX
   - Hover effects on all interactive elements
   - Micro-animations throughout the app
   - **SIMPLIFIED DESIGN**: Removed excessive gradients for cleaner look
   - PWA support ready (install prompt currently disabled)
   - Error boundary components for graceful error handling
   - Real-time saving indicators with multiple states
   - Auto-save hooks for forms
   - **MINIMAL GRADIENTS**: Only essential gradients in hero sections

4. **User Profile**:
   - First name/last name personalization implemented
   - User settings panel with auto-save toggle
   - Theme preference management

5. **Voice Rules System**:
   - Instructions vs Rules distinction (general guidance vs specific requirements)
   - Chat-based coaching for rule creation
   - Editable rules per voice
   - Rules override general instructions
   - Categorized rule management

6. **AI Detection Note**:
   - Landing page now mentions "Emails so human-like, they pass all AI detection tests"
   - Core feature highlighted in marketing

#### 🚧 Partially Completed

- Email revision API with human-like output (implemented but using mock data when no API key)
- Voice export/duplication (backend ready, needs UI)

#### ❌ Not Yet Implemented

- Email versioning system (keep simple - just a history list)
- Voice export/import UI (simple download/upload buttons)
- Additional email types (keep to 3-4 max types)
- Copy to clipboard success animation
- Email tone analyzer
- Quick templates for common scenarios
- AI-powered subject line generator
- Email sentiment analysis

### IMPORTANT: Simplicity Reminders

⚠️ **What NOT to Add:**
- Complex version control UI
- Detailed analytics dashboards  
- Multiple editing modes
- Nested settings menus
- Technical configuration options
- Feature-rich text editors
- Complicated workflows

✅ **What TO Add:**
- One-click actions
- Visual feedback
- Smart defaults
- Automatic saves
- Simple toggles
- Clear labels
- Minimal options

### High Priority TODOs (With Simplicity in Mind)

1. ✅ **COMPLETED: Inline Revision UI**:
   - Simple edit button and mode
   - Only 4 quick feedback options
   - Clean save/cancel flow

2. **Email Versioning & History** (Keep Simple):
   - Just show a simple list of previous versions
   - One-click to view old version
   - One-click to restore
   - NO complex diff views or merge options

3. **Complete User Settings**:
   - Just add the 2 missing toggles (already have auto-save)
   - Simple on/off switches
   - Settings save automatically

4. **Voice Export/Import** (Dead Simple):
   - One button: "Download Voice"
   - One button: "Upload Voice" 
   - No complex file management
   - No marketplace (too complex)

5. **Email Type Selection** (Maximum Simplicity):
   - Just 3 types: Professional, Casual, Thank You
   - Simple dropdown menu
   - Auto-detected from topic when possible
   - No custom templates (too complex)

### Technical Architecture Updates

#### New Files Added
- `/lib/emailPatterns.js` - Analyzes email patterns from samples
- `/lib/personalityVarieties.js` - Generates personality-based variations
- `/lib/contextDetection.js` - Detects email context for better generation
- `/components/VoiceOnboardingWizard.js` - Step-by-step voice creation
- `/components/VoiceCalibration.js` - Interactive voice training
- `/components/FeedbackMemoryVisualization.js` - Training analytics
- `/components/VoiceCoachingChat.js` - Chat-based rule creation
- `/components/VoiceRules.js` - Rule management interface
- `/components/ContextDetector.js` - UI for context detection
- `/components/ErrorBoundary.js` - Base error boundary for app stability
- `/components/PageErrorBoundary.js` - Page-level error handling
- `/components/ComponentErrorBoundary.js` - Component-level error handling
- `/components/SavingIndicator.js` - Real-time saving status display
- `/components/GlobalSavingIndicator.js` - App-wide saving indicators
- `/components/PWAPrompt.js` - PWA install prompt component (currently disabled)
- `/contexts/SavingContext.js` - Global saving state management
- `/hooks/useAutoSave.js` - Auto-save functionality hook
- `/hooks/useErrorHandler.js` - Centralized error handling
- `/public/manifest.json` - PWA manifest file
- `/public/service-worker.js` - PWA service worker

#### Key API Updates
- `/pages/api/generate.js` - Now uses pattern analysis, personality variations, and voice rules
- `/pages/api/revise.js` - Human-like revision with personality awareness and voice rules
- Both APIs integrate feedback memory, sample email analysis, and custom rules

#### Recent UI Simplifications (IMPORTANT for Future Sessions)
1. **Removed Excessive Gradients**: 
   - Settings page: All cards now use simple `bg-surface-50 dark:bg-surface-800`
   - Landing page: Feature/pricing/testimonial cards simplified
   - Voices page: Removed gradient backgrounds and headers
   - Kept only essential gradients in hero sections

2. **PWA Install Prompt Disabled**:
   - PWAPrompt component commented out in MainLayout
   - Service worker still registered but no visible prompt
   - Can be re-enabled when ready

3. **Simplified Color Usage**:
   - Headers use solid colors instead of gradient text
   - Buttons simplified without gradient backgrounds
   - Cards use subtle borders and shadows instead of gradient backgrounds
   - More professional, minimal appearance

#### Key UI Files Updated for Simplification
- `/pages/settings.js` - All gradient backgrounds removed from cards
- `/pages/index.js` - Feature cards, pricing, testimonials simplified
- `/pages/simple-voices.js` - Gradient headers and cards simplified
- `/components/layout/MainLayout.js` - PWAPrompt commented out