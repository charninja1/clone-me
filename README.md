# CloneMe - AI-Powered Personal Email Assistant

CloneMe is an advanced AI email generation tool that learns your unique writing style and creates emails that are indistinguishable from your own writing. Using personality-based voice profiles, pattern analysis, and continuous learning, CloneMe ensures every email sounds authentically you. Generated emails are so human-like, they pass all AI detection tests.

## ✨ Key Features

### 🎭 Advanced Voice Profiles
- **Personality-Based Voices**: Create multiple voice profiles with different personality traits (formality, warmth, emotion, detail)
- **Voice Onboarding Wizard**: Step-by-step voice creation with sample email uploads and personality quiz
- **Interactive Training**: Calibration mode with quick feedback buttons for continuous improvement
- **Training Analytics**: Visualize your voice training progress with detailed analytics

### 🤖 Human-Like Email Generation
- **Undetectable AI Output**: Emails that are indistinguishable from human writing
- **Pattern Analysis**: Learns from your sample emails to match your unique style
- **Dynamic Variations**: Personality-driven language variations for natural-sounding emails
- **Continuous Learning**: Feedback memory system that improves with every revision

### 🎨 Modern UI/UX
- **Clean Interface**: Simplified design with subtle gradients and smooth animations
- **Dark Mode**: Full dark mode support with seamless transitions
- **Component Library**: Comprehensive UI components (Button, Card, Input, etc.)
- **Training Indicators**: Visual feedback on voice training progress throughout the app
- **Progressive Web App (PWA)**: Ready for installation (prompt currently disabled)
- **Error Boundaries**: Graceful error handling throughout the app
- **Real-time Saving**: Visual indicators for all save operations
- **Auto-save**: Forms automatically save as you type
- **Loading Skeletons**: Smooth loading states everywhere
- **Minimal Gradients**: Professional design with gradients only where essential
- **Consistent Styling**: Unified design language throughout

### 🛠️ User Features
- **User Profiles**: Personalized with first/last name integration
- **Auto-Save**: Automatic email saving with toggle control
- **Revision System**: AI-powered revisions based on your feedback
- **Settings Panel**: Customizable preferences and controls

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase account
- OpenAI API key (optional - app works with mock data for development)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/clone-me
   cd clone-me
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Technology Stack

- **Frontend**: Next.js 13+, React 18
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: OpenAI API (GPT-3.5/4, Ada Embeddings)
- **Styling**: Tailwind CSS, Custom CSS with CSS Variables
- **State Management**: React Context API
- **UI Enhancements**: Loading skeletons, micro-animations, hover effects
- **PWA**: Service worker, manifest.json for installability
- **Error Handling**: Comprehensive error boundaries
- **Saving System**: Real-time indicators, auto-save hooks

## 📁 Project Structure

```
clone-me/
├── components/
│   ├── ui/                    # UI component library
│   ├── layout/               # Layout components
│   ├── VoiceOnboardingWizard.js
│   ├── VoiceCalibration.js
│   ├── VoiceCoachingChat.js
│   ├── VoiceRules.js
│   ├── FeedbackMemoryVisualization.js
│   ├── ErrorBoundary.js      # Error handling components
│   ├── SavingIndicator.js    # Saving status display
│   └── PWAPrompt.js          # PWA install prompt
├── contexts/
│   ├── ThemeContext.js       # Theme management
│   └── SavingContext.js      # Global saving state
├── lib/
│   ├── firebase.js          # Firebase configuration
│   ├── emailPatterns.js     # Email pattern analysis
│   └── personalityVarieties.js # Personality variations
├── pages/
│   ├── api/                 # API endpoints
│   ├── index.js            # Main email generation
│   ├── voices.js           # Voice management
│   ├── settings.js         # User settings
│   └── login.js            # Authentication
├── styles/
│   └── globals.css         # Global styles with gradients
├── hooks/
│   ├── useAutoSave.js      # Auto-save functionality
│   └── useErrorHandler.js  # Error handling
└── public/
    ├── manifest.json       # PWA manifest
    └── service-worker.js   # PWA service worker
```

## 🎯 Current Status

### ✅ Implemented Features
- Advanced voice system with personality profiles
- Voice onboarding wizard and training tools
- Human-like email generation with pattern analysis
- Feedback memory system
- Modern UI with dark mode and animations
- User authentication and profiles
- Auto-save functionality
- Voice Rules System (specific requirements)
- Coaching Chat (interactive rule creation)
- Instructions vs Rules distinction
- Loading skeletons and hover effects
- Undetectable AI output (passes detection tests)
- PWA support ready (install prompt disabled)
- Comprehensive error boundaries
- Real-time saving indicators
- Auto-save hooks for forms
- Simplified color scheme (removed excessive gradients)
- Professional minimal design

### 🚧 In Progress
- Email versioning system
- Additional user settings (auto-copy, Gmail integration)
- Copy to clipboard success animation

### 📋 Planned Features
- Voice export/import functionality
- Email type templates (Thank You, Request, Follow-Up)
- Email tone analyzer
- Quick templates for common scenarios
- AI-powered subject line generator
- Email sentiment analysis
- Advanced analytics dashboard
- Team collaboration features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Important Design Decisions (for future sessions)

### Recent UI Simplifications
1. **Gradient Reduction**: Removed excessive gradients throughout the app for a cleaner, more professional look
   - Settings page: All cards use solid backgrounds
   - Landing page: Simplified feature/pricing/testimonial cards
   - Voices page: Removed gradient backgrounds and headers
   
2. **PWA Install**: Install prompt is implemented but currently disabled (commented out in MainLayout)

3. **Design Philosophy**: Shifted towards minimal, clean design with:
   - Subtle borders and shadows instead of gradient backgrounds
   - Solid color headers instead of gradient text
   - Professional appearance with gradients only in hero sections
   - Consistent styling patterns across all pages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js and React
- Powered by OpenAI's GPT models
- UI components inspired by modern design systems
- Special thanks to all contributors

---

**Note**: This project requires API keys for full functionality. The app includes mock data for development without API keys.