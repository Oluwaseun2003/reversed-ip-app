// Import API types first
import type { IPHistoryEntry } from '../services/api';

// Re-export API types for convenience
export type {
  ReverseIPRequest,
  ReverseIPResponse,
  GetIPHistoryResponse,
  IPHistoryEntry,
  APIError,
  HealthCheckResponse,
  StatsResponse,
  SearchResponse,
} from '../services/api';

// Additional frontend-specific types
export interface UIState {
  loading: boolean;
  error: string | null;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface SearchState {
  query: string;
  results: IPHistoryEntry[];
  isSearching: boolean;
}

// Theme types (for future dark mode support)
export type Theme = 'light' | 'dark';

// Navigation types
export type TabId = 'reverser' | 'history' | 'stats';

export interface Tab {
  id: TabId;
  name: string;
  icon: React.ReactNode;
}

// Form types
export interface IPForm {
  ipAddress: string;
  isValid: boolean;
  errors?: string[];
}

// Component state types
export interface ComponentState extends UIState {
  data?: any;
}

// Toast notification types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}