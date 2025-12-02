# Local Grocery Scout 🥬

Local Grocery Scout is a smart web application designed to help users find the best grocery prices in their local area. Powered by **Google Gemini**, it scouts prices from various sources, tracks price history, and helps you manage your shopping lists efficiently.

## Features 🚀

*   **Smart Price Scouting**: Search for any grocery item to find the best prices near you, powered by Gemini 2.5.
*   **Shopping Lists**: Create and manage multiple shopping lists.
*   **Bulk Scout**: Automatically find the best prices for all items in your shopping list with one click.
*   **Price History**: Track price trends over time to know when to buy.
*   **Barcode Scanner**: Scan product barcodes to quickly identify and search for items.
*   **Location-Based**: tailored results based on your current location.
*   **User Accounts**: Sign in with Google to sync your lists and history across devices (Firebase Auth & Firestore).
*   **Dark Mode**: Sleek dark mode support for comfortable viewing.
*   **Pro Membership**: Unlock unlimited searches and advanced features.

## Tech Stack 🛠️

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **AI/ML**: Google Gemini API (Multimodal capabilities)
*   **Backend Services**: Firebase (Authentication, Firestore)
*   **Build Tool**: Vite

## Quick Start Guide ⚡

Follow these steps to get the project running locally on your machine.

### Prerequisites

*   **Node.js** (v16 or higher recommended)
*   **npm** or **yarn**
*   A **Google Gemini API Key**
*   A **Firebase Project** (for Auth and Firestore)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd LocalGroceryScout
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root directory and add your API keys:

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

4.  **Run the Application**
    Start the development server:
    ```bash
    npm run dev
    ```

5.  **Open in Browser**
    Visit `http://localhost:5173` (or the URL shown in your terminal) to start scouting!

## Usage 📖

1.  **Search**: Enter a product name (e.g., "Milk", "Eggs") in the search bar.
2.  **View Results**: See the best prices and store locations.
3.  **Add to List**: Click the "+" button to add items to your shopping list.
4.  **Track History**: Click on an item in your list to view its price history chart.
5.  **Scan**: Use the barcode icon to scan physical products.

## License

[MIT](LICENSE)
