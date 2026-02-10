/**
 * schema.ts — SQLite Table Definitions
 *
 * Contains the SQL CREATE TABLE statements for every table in KnippaCab.
 * These strings are used by the migration system — each schema change
 * should be captured as a new migration, not an edit to existing SQL here.
 *
 * DATABASE DESIGN NOTES:
 *
 * SQLite TYPE SYSTEM:
 * SQLite uses "type affinity" — it only has 5 storage classes:
 *   NULL, INTEGER, REAL, TEXT, BLOB
 * We map TypeScript types as follows:
 *   string  → TEXT
 *   number  → REAL  (dimensions in mm, fractional values allowed)
 *   boolean → INTEGER (1 = true, 0 = false)
 *
 * FOREIGN KEYS:
 * SQLite has foreign keys but they're DISABLED by default.
 * The init module enables them with: PRAGMA foreign_keys = ON
 * ON DELETE CASCADE means deleting a project automatically deletes its cabinets,
 * and deleting a cabinet automatically deletes its drawers.
 *
 * PARTS ARE NOT STORED:
 * Parts are calculated on demand from Cabinet + Drawer configs.
 * Storing them would require keeping them in sync with config changes —
 * re-calculating is simpler and always guaranteed to be correct.
 *
 * C# COMPARISON NOTES:
 * - These SQL strings are like EF Core migrations, but written by hand.
 * - "IF NOT EXISTS" prevents errors if migrations run more than once.
 */

// =============================================================================
// SCHEMA VERSION
// =============================================================================

/**
 * Current schema version. Increment this when adding a new migration.
 * Stored in SQLite's built-in `user_version` PRAGMA.
 */
export const CURRENT_SCHEMA_VERSION = 1;

// =============================================================================
// TABLE DEFINITIONS (Migration 1)
// =============================================================================

/**
 * Projects table — top-level container for a set of cabinets.
 * One project per kitchen/bathroom/etc.
 */
export const SQL_CREATE_PROJECTS = `
  CREATE TABLE IF NOT EXISTS projects (
    id           TEXT PRIMARY KEY NOT NULL,
    name         TEXT NOT NULL,
    units        TEXT NOT NULL DEFAULT 'imperial',
    defaultJoinery TEXT NOT NULL DEFAULT 'pocket_hole',
    createdAt    TEXT NOT NULL,
    modifiedAt   TEXT NOT NULL
  )
`;

/**
 * Cabinets table — individual cabinet configurations within a project.
 * ON DELETE CASCADE: deleting a project deletes all its cabinets.
 */
export const SQL_CREATE_CABINETS = `
  CREATE TABLE IF NOT EXISTS cabinets (
    id             TEXT PRIMARY KEY NOT NULL,
    projectId      TEXT NOT NULL,
    type           TEXT NOT NULL DEFAULT 'base',
    width          REAL NOT NULL,
    height         REAL NOT NULL,
    depth          REAL NOT NULL,
    toeKickOption  TEXT NOT NULL DEFAULT 'standard',
    toeKickHeight  REAL NOT NULL DEFAULT 102,
    joineryMethod  TEXT NOT NULL DEFAULT 'pocket_hole',
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  )
`;

/**
 * Drawers table — drawer boxes within a cabinet.
 * ON DELETE CASCADE: deleting a cabinet deletes all its drawers.
 */
export const SQL_CREATE_DRAWERS = `
  CREATE TABLE IF NOT EXISTS drawers (
    id            TEXT PRIMARY KEY NOT NULL,
    cabinetId     TEXT NOT NULL,
    width         REAL NOT NULL,
    height        REAL NOT NULL,
    depth         REAL NOT NULL,
    cornerJoinery TEXT NOT NULL DEFAULT 'pocket_hole',
    bottomMethod  TEXT NOT NULL DEFAULT 'applied',
    frontMaterial TEXT NOT NULL DEFAULT '3/4" Plywood',
    FOREIGN KEY (cabinetId) REFERENCES cabinets(id) ON DELETE CASCADE
  )
`;

/**
 * Settings table — key-value store for user preferences.
 * Simple TEXT key → TEXT value pairs. Values are parsed to the correct
 * type by settingsStore.ts.
 *
 * Keys used:
 *   "units"          → "imperial" | "metric"
 *   "defaultJoinery" → "pocket_hole" | "butt_screws" | "dado_rabbet" | "dowel"
 *   "defaultSawKerf" → number string (mm), e.g. "3.175"
 *   "defaultToeKick" → "standard" | "custom" | "none"
 */
export const SQL_CREATE_SETTINGS = `
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  )
`;

// =============================================================================
// INDEX DEFINITIONS
// =============================================================================

/**
 * Index on cabinets.projectId for fast cabinet lookups per project.
 * Without this, loading all cabinets for a project would do a full table scan.
 * For small projects this doesn't matter, but it's good practice.
 */
export const SQL_CREATE_INDEX_CABINETS_PROJECT = `
  CREATE INDEX IF NOT EXISTS idx_cabinets_projectId ON cabinets(projectId)
`;

/**
 * Index on drawers.cabinetId for fast drawer lookups per cabinet.
 */
export const SQL_CREATE_INDEX_DRAWERS_CABINET = `
  CREATE INDEX IF NOT EXISTS idx_drawers_cabinetId ON drawers(cabinetId)
`;
