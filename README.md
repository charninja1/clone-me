# Clone Me - AI-Powered Email Generator

A Next.js application that helps users generate professional emails with personalized tones using AI. This tool allows you to create, save, and refine emails using OpenAI's GPT models.

## Features

- **AI Email Generation**: Generate professional emails based on your input and selected tone
- **Customizable Tones**: Create and manage different writing styles/tones
- **Revision System**: Get AI-powered revisions based on your feedback
- **Firebase Integration**: User authentication and data storage with Firestore
- **Semantic Search**: Find similar past emails using embeddings

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase account
- OpenAI API key

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
   Create a `.env.local` file in the project root with the following:
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

5. Visit [http://localhost:3000](http://localhost:3000) in your browser

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Frontend**: Next.js, React
- **Backend**: Next.js API routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: OpenAI API (GPT-3.5 Turbo, Embeddings)
- **Styling**: TailwindCSS (planned)

## Current Status and Roadmap

### Current Features
- AI-powered email generation
- Customizable tones/writing styles
- User authentication system
- Modern, responsive UI with dark mode support
- Basic settings and preferences

### Upcoming Features
- Personalized prompts based on user's name (first/last name)
- Better tone differentiation with tone-specific saved emails
- Extended auto-save for all modifications including revisions
- Improved system theme detection
- Enhanced component library and UI refinements