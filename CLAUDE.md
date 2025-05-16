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

### Current Status
- Dark mode has been implemented with three options: light, dark, and system preference. However, system preference detection has some issues that need to be fixed.
- Auto-save currently works after initial email generation but needs to be extended to work for revisions and other changes.

### Future Requirements
1. **Personalized Prompts**: Update OpenAI prompts to generate emails for the specific user rather than a generic "Charlie". This requires:
   - Adding first name and last name fields to user registration/profile
   - Modifying prompts to include user's name instead of hardcoded "Charlie"

2. **Improved Tone System**:
   - Each tone should represent a clearly different writing style
   - When a specific tone is selected, only display saved emails created with that tone

3. **Extended Auto-Save**:
   - Make auto-save work for revisions and other changes, not just first generation

4. **Fix System Theme Preference**:
   - Address issues with system/browser theme preference detection

5. **Component Library**:
   - Continue to refine the UI component system for consistency across the application