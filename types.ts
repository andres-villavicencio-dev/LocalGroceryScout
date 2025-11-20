
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
        author: string;
      }[];
    }[];
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  groundingSupports?: any[];
  webSearchQueries?: string[];
}

export interface ParsedPrice {
  store: string;
  price: number;
  productName?: string;
  originalQuery?: string;
}

export interface SearchResult {
  text: string;
  groundingMetadata?: GroundingMetadata;
  parsedPrices?: ParsedPrice[];
  productName?: string; // The query or identified product
}

export enum AppState {
  IDLE = 'IDLE',
  LOCATING = 'LOCATING',
  READY = 'READY',
  SEARCHING = 'SEARCHING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  SCANNING = 'SCANNING',
  LISTS = 'LISTS'
}

// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Shopping List Types
export interface ShoppingListItem {
  id: string;
  name: string;
  checked: boolean;
  addedAt: number;
  bestPrice?: number;
  bestStore?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: number;
}

// Price History Types
export interface PricePoint {
  date: string; // ISO date string YYYY-MM-DD
  price: number;
}

export interface StoreHistory {
  storeName: string;
  history: PricePoint[];
}

export interface ProductHistory {
  [storeName: string]: PricePoint[];
}
