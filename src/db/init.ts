/**
 * init.ts — Database Initialization and Singleton
 *
 * Opens the SQLite database, enables foreign keys, and runs any pending
 * migrations. Exports `getDb()` for use by queries.ts and the stores.
 *
 * SINGLETON PATTERN:
 * The database is opened once and the reference is kept in a module-level
 * variable. All subsequent calls to `getDb()` return the same instance.
 * This is safe because JavaScript (and React Native's JS thread) is
 * single-threaded — no race conditions are possible.
 *
 * INITIALIZATION FLOW:
 *   App.tsx renders <SQLiteProvider> OR calls initDatabase() directly
 *     ↓
 *   initDatabase() opens 'knippacab.db' (creates file if new install)
 *     ↓
 *   Enables PRAGMA foreign_keys = ON
 *     ↓
 *   Reads current user_version PRAGMA
 *     ↓
 *   Runs all migrations with version > current user_version
 *     ↓
 *   Updates user_version to latest
 *     ↓
 *   App is ready — getDb() returns the initialized instance
 *
 * C# COMPARISON NOTES:
 * - This is like a DbContext factory in EF Core — you call the factory once
 *   at startup, and everywhere else calls `GetDbContext()` to get the shared instance.
 * - `user_version` PRAGMA is like EF Core's __EFMigrationsHistory table,
 *   but built into SQLite itself.
 */

import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';

// =============================================================================
// SINGLETON STATE
// =============================================================================

/**
 * Module-level database singleton. Null until initDatabase() is called.
 * Private to this module — only accessible via getDb().
 */
let _db: SQLite.SQLiteDatabase | null = null;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Initialize the database: open, configure, and migrate.
 * Call this ONCE at app startup before rendering any screens.
 *
 * Safe to call multiple times — subsequent calls are no-ops if the
 * database is already initialized.
 *
 * @throws Error if the database cannot be opened or migrations fail
 */
export function initDatabase(): void {
  if (_db !== null) {
    // Already initialized — skip (idempotent)
    return;
  }

  // Open (or create) the SQLite database file
  _db = SQLite.openDatabaseSync('knippacab.db');

  // Enable foreign key enforcement (disabled by default in SQLite)
  // Without this, ON DELETE CASCADE won't work
  _db.execSync('PRAGMA foreign_keys = ON');

  // Run any pending migrations
  runMigrations(_db);
}

/**
 * Get the initialized database instance.
 * Must be called AFTER initDatabase().
 *
 * @throws Error if initDatabase() has not been called yet
 * @returns The open SQLiteDatabase instance
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (_db === null) {
    throw new Error(
      'Database not initialized. Call initDatabase() before using getDb().'
    );
  }
  return _db;
}

/**
 * Close the database and reset the singleton.
 * Use for testing or if the app needs to reinitialize.
 * Not needed in normal app flow — the OS handles cleanup on exit.
 */
export function closeDatabase(): void {
  if (_db !== null) {
    _db.closeSync();
    _db = null;
  }
}

// =============================================================================
// MIGRATION RUNNER (private)
// =============================================================================

/**
 * Apply any pending migrations to the database.
 *
 * Reads the current `user_version` PRAGMA, runs all migrations with a
 * version number greater than the current version (in order), then
 * updates `user_version` to the highest applied version.
 *
 * Each migration's statements run inside a transaction so that if any
 * statement fails, the database stays at the previous version.
 *
 * @param db - The open database to migrate
 */
function runMigrations(db: SQLite.SQLiteDatabase): void {
  // user_version is a built-in SQLite integer PRAGMA, default 0 on new database
  const versionRow = db.getFirstSync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = versionRow?.user_version ?? 0;

  // Filter to only migrations we haven't applied yet
  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);

  if (pending.length === 0) {
    // Database is up to date
    return;
  }

  // Apply each pending migration in a transaction
  for (const migration of pending) {
    try {
      db.withTransactionSync(() => {
        for (const sql of migration.statements) {
          db.execSync(sql);
        }
        // Update user_version inside the transaction
        // Note: PRAGMA user_version = N cannot use bound parameters,
        // so we interpolate directly (safe — version is a hardcoded integer)
        db.execSync(`PRAGMA user_version = ${migration.version}`);
      });
    } catch (error) {
      throw new Error(
        `Migration v${migration.version} ("${migration.description}") failed: ${error}`
      );
    }
  }
}
