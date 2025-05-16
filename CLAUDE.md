# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
   - Enhanced UI with gradients, animations, and modern styling
   - Dark mode support with smooth transitions
   - Component library (Button, Card, Input, etc.)
   - Voice training indicators throughout the app
   - Auto-save functionality for generated emails

4. **User Profile**:
   - First name/last name personalization implemented
   - User settings panel with auto-save toggle
   - Theme preference management

#### 🚧 Partially Completed

- Email revision API with human-like output (implemented but using mock data when no API key)
- Auto-save system (works for generation, needs extension for revisions)
- Voice export/duplication (backend ready, needs UI)

#### ❌ Not Yet Implemented

- Inline revision UI (backend ready, needs frontend)
- Email versioning system
- Auto-copy to clipboard setting
- Auto-open Gmail integration
- Voice export/import UI
- Additional email types (Thank You, Request, Follow-Up)

### High Priority TODOs

1. **Complete Inline Revision UI**:
   - Build frontend for inline email editing
   - Add quick feedback buttons ("Too formal", "Too casual", etc.)
   - Connect to existing revision API

2. **Email Versioning & History**:
   - Implement version control for emails
   - Add revision history view
   - Extend auto-save to work with revisions

3. **Additional User Settings**:
   - Auto-copy to clipboard toggle
   - Auto-open Gmail with email body
   - Email format preferences

4. **Voice Management Enhancements**:
   - Voice export/import UI
   - Voice duplication feature
   - Voice templates marketplace

5. **Email Type Templates**:
   - Add email type selection (Thank You, Request, Follow-Up)
   - Type-specific generation prompts
   - Template customization per voice

### Technical Architecture Updates

#### New Files Added
- `/lib/emailPatterns.js` - Analyzes email patterns from samples
- `/lib/personalityVarieties.js` - Generates personality-based variations
- `/components/VoiceOnboardingWizard.js` - Step-by-step voice creation
- `/components/VoiceCalibration.js` - Interactive voice training
- `/components/FeedbackMemoryVisualization.js` - Training analytics

#### Key API Updates
- `/pages/api/generate.js` - Now uses pattern analysis and personality variations
- `/pages/api/revise.js` - Human-like revision with personality awareness
- Both APIs integrate feedback memory and sample email analysis