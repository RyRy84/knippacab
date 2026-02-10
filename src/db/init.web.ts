/**
 * init.web.ts — Web Platform Stub for Database Initialization
 *
 * WHY THIS FILE EXISTS:
 * expo-sqlite v16 on web requires WebAssembly (wa-sqlite.wasm) and
 * SharedArrayBuffer, which in turn require Cross-Origin Isolation headers
 * (COOP + COEP). The Expo dev server doesn't provide these headers, so
 * expo-sqlite fails to bundle/run on web.
 *
 * Metro bundler resolves `.web.ts` files before `.ts` files when building
 * for web. This stub replaces `init.ts` on web — expo-sqlite is never
 * imported, the WASM error disappears, and the app runs normally.
 *
 * TRADE-OFF:
 * On web, database operations are no-ops. Data is held in Zustand memory
 * only and resets on page refresh. This is fine for web development testing
 * of the UI and calculation engine. SQLite persistence works on native.
 *
 * C# COMPARISON:
 * This is like having a MemoryDatabase provider for unit tests vs.
 * a SqlServer provider for production — same interface, different backing store.
 */

// No expo-sqlite import — this file intentionally avoids the native module.

/**
 * No-op on web. Database initialization is skipped.
 */
export function initDatabase(): void {
  // Web: SQLite not available. Data will be in-memory only (lost on refresh).
}

/**
 * Throws on web — db operations should go through queries.web.ts which
 * doesn't call getDb() at all.
 */
export function getDb(): never {
  throw new Error('SQLite database is not available on web.');
}

/**
 * No-op on web.
 */
export function closeDatabase(): void {
  // nothing to close
}
