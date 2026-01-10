# Local Grocery Scout - Project Overview

## What This Project Is

Local Grocery Scout is a smart web application that helps users find the best grocery prices in their local area. It uses Google Gemini AI to scout prices from various sources, track price history, and manage shopping lists efficiently.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **AI Service**: Google Gemini API (multimodal capabilities)
- **Backend Services**: Firebase (Authentication & Firestore)
- **Styling**: Tailwind CSS (inferred from typical React setup)

## Project Structure

```
LocalGroceryScout/
├── App.tsx                 # Main application component (29KB - central hub)
├── index.tsx              # React app entry point
├── types.ts               # TypeScript type definitions
├── components/            # React UI components
│   ├── AuthModal.tsx         # User authentication UI
│   ├── BarcodeScanner.tsx    # Barcode scanning functionality
│   ├── PriceHistoryChart.tsx # Price trend visualization
│   ├── ResultsView.tsx       # Search results display
│   ├── ShoppingListView.tsx  # Shopping list management (29KB)
│   ├── Toast.tsx            # Toast notification component
│   ├── ToastContainer.tsx   # Toast notification container
│   ├── AdBanner.tsx         # Advertisement banner
│   └── UpgradeModal.tsx     # Pro membership upgrade UI
├── services/              # Backend service integrations
│   ├── firebase.ts           # Firebase initialization
│   ├── firestoreService.ts   # Firestore database operations
│   └── geminiService.ts      # Google Gemini API integration
└── contexts/              # React context providers

```

## Key Files

### App.tsx
The main application component that orchestrates the entire app. At 29KB, it's the central hub managing:
- Application state (IDLE, SEARCHING, RESULTS, etc.)
- User location detection
- Navigation between views
- Integration of all major features

### types.ts
Defines all TypeScript interfaces and types:
- `GeoLocation` - User location data
- `SearchResult` - AI search results with grounding metadata
- `ParsedPrice` - Store price information
- `User` - User profile with Pro membership status
- `ShoppingList` & `ShoppingListItem` - Shopping list data structures
- `ProductHistory` & `PricePoint` - Price tracking data
- `AppState` - Application state enum

### Services

**geminiService.ts** (7.7KB)
- Integrates with Google Gemini AI
- Performs price searches with location context
- Handles multimodal AI requests

**firestoreService.ts** (2.9KB)
- Manages Firestore database operations
- Handles shopping lists persistence
- Stores price history data

**firebase.ts** (923B)
- Firebase initialization
- Authentication and Firestore configuration

## Environment Variables Required

Create a `.env.local` file with:

```env
# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Main Features

1. **Smart Price Scouting** - AI-powered price search using Gemini 2.5
2. **Shopping Lists** - Create and manage multiple shopping lists
3. **Bulk Scout** - Find best prices for all items in a list at once
4. **Price History** - Track price trends over time
5. **Barcode Scanner** - Scan products for quick search
6. **Location-Based** - Tailored results based on user location
7. **User Accounts** - Google Sign-In with Firebase Auth
8. **Dark Mode** - Theme support
9. **Pro Membership** - Monetization with unlimited searches

## Application States

The app uses a state machine pattern with these states:
- `IDLE` - Initial state
- `LOCATING` - Getting user location
- `READY` - Ready for search
- `SEARCHING` - Actively searching for prices
- `RESULTS` - Displaying search results
- `ERROR` - Error state
- `SCANNING` - Barcode scanning mode
- `LISTS` - Shopping list view

## Development Commands

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Data Flow

1. User enters product search or scans barcode
2. App gets user's geolocation
3. geminiService queries Gemini AI with location context
4. AI returns parsed prices with grounding metadata (sources)
5. Results displayed with store names and prices
6. User can save to shopping list (persisted in Firestore)
7. Price history tracked over time for trend analysis

## Key Dependencies

- `react` & `react-dom` (v19.2.0)
- `@google/genai` (v1.30.0) - Google Gemini API client
- `firebase` (v12.6.0) - Authentication & Firestore
- `typescript` (~5.8.2)
- `vite` (^6.2.0)

## Notes for AI Assistants

- The main logic is in App.tsx - start there for understanding the flow
- Type definitions in types.ts are comprehensive and well-structured
- Firebase services are separated into their own modules
- The app uses React hooks and functional components throughout
- Toast notifications are implemented for user feedback
- Pro membership is enforced with daily search limits
