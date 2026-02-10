/**
 * migrations.ts — Database Migration Definitions
 *
 * A migration is a one-way schema change applied in order as the app evolves.
 * Once a migration has been applied to a real user's database, it must NEVER
 * be modified — create a new migration instead.
 *
 * HOW THE MIGRATION SYSTEM WORKS:
 * 1. SQLite has a built-in `user_version` PRAGMA (an integer, default 0).
 * 2. On every app launch, we read `user_version`.
 * 3. We run every migration whose `version` is greater than the current `user_version`.
 * 4. We update `user_version` to the latest migration's version number.
 *
 * WHY NOT ORM/DRIZZLE/ETC?
 * We're keeping dependencies minimal (React Native + Expo already has a heavy
 * dependency tree). A simple migration array is easy to understand, easy to
 * debug, and has zero additional dependencies.
 *
 * ADDING A NEW MIGRATION:
 * 1. Add a new object to the MIGRATIONS array below.
 * 2. Set version = previous version + 1.
 * 3. Write the SQL (can be multiple statements separated by semicolons — but
 *    run them separately, not in one execSync call, for compatibility).
 * 4. Increment CURRENT_SCHEMA_VERSION in schema.ts.
 * 5. Never modify or delete existing migrations.
 *
 * C# COMPARISON NOTES:
 * - This is similar to EF Core migrations but hand-written.
 * - The array-of-objects pattern is like a list of migration classes,
 *   each with an `Up()` method — but simpler.
 */

import {
  SQL_CREATE_PROJECTS,
  SQL_CREATE_CABINETS,
  SQL_CREATE_DRAWERS,
  SQL_CREATE_SETTINGS,
  SQL_CREATE_INDEX_CABINETS_PROJECT,
  SQL_CREATE_INDEX_DRAWERS_CABINET,
} from './schema';

// =============================================================================
// MIGRATION TYPE
// =============================================================================

/**
 * A single migration step.
 * - `version`: The schema version this migration brings the database TO.
 * - `statements`: Array of SQL strings to execute (each runs separately).
 */
export interface Migration {
  version: number;
  description: string;
  statements: string[];
}

// =============================================================================
// MIGRATION DEFINITIONS
// =============================================================================

/**
 * All migrations in version order. NEVER reorder or remove entries.
 * Add new migrations to the END of this array only.
 */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial schema: projects, cabinets, drawers, settings',
    statements: [
      SQL_CREATE_PROJECTS,
      SQL_CREATE_CABINETS,
      SQL_CREATE_DRAWERS,
      SQL_CREATE_SETTINGS,
      SQL_CREATE_INDEX_CABINETS_PROJECT,
      SQL_CREATE_INDEX_DRAWERS_CABINET,
    ],
  },

  // ─── ADD FUTURE MIGRATIONS BELOW ─────────────────────────────────────────
  // Example Phase 4 migration (not yet active):
  // {
  //   version: 2,
  //   description: 'Add shelves table for adjustable shelf support',
  //   statements: [
  //     `CREATE TABLE IF NOT EXISTS shelves (
  //       id TEXT PRIMARY KEY NOT NULL,
  //       cabinetId TEXT NOT NULL,
  //       heightFromBottom REAL NOT NULL,
  //       FOREIGN KEY (cabinetId) REFERENCES cabinets(id) ON DELETE CASCADE
  //     )`,
  //   ],
  // },
];
