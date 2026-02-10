/**
 * uiStore.ts — UI State (Loading, Errors)
 *
 * Tracks transient UI state that isn't tied to any specific domain entity.
 * Components read from this store to show loading spinners and error messages.
 *
 * USAGE IN COMPONENTS:
 * ```tsx
 * import { useUIStore } from '../store/uiStore';
 *
 * function ProjectList() {
 *   const isLoading = useUIStore((s) => s.isLoading);
 *   const error = useUIStore((s) => s.error);
 *   const clearError = useUIStore((s) => s.clearError);
 *
 *   if (isLoading) return <ActivityIndicator />;
 *   if (error) return <ErrorBanner message={error} onDismiss={clearError} />;
 *   return <FlatList ... />;
 * }
 * ```
 */

import { create } from 'zustand';

// =============================================================================
// STATE TYPE
// =============================================================================

interface UIState {
  /** True while an async operation (DB load, optimization) is in progress. */
  isLoading: boolean;

  /** Last error message, or null if no error. Shown as an alert/banner. */
  error: string | null;

  // ─── Actions ────────────────────────────────────────────────────────────

  /** Show or hide the global loading indicator. */
  setLoading: (loading: boolean) => void;

  /** Set an error message to display to the user. */
  setError: (message: string) => void;

  /** Clear the current error (user dismissed or error resolved). */
  clearError: () => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useUIStore = create<UIState>()((set) => ({
  isLoading: false,
  error: null,

  setLoading: (isLoading) => set({ isLoading }),

  setError: (message) => set({ error: message, isLoading: false }),

  clearError: () => set({ error: null }),
}));
