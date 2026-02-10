/**
 * queries.ts — SQLite CRUD Operations
 *
 * All database read/write operations for the three main entity types:
 * Projects, Cabinets, and Drawers. Also includes Settings (key-value).
 *
 * DESIGN PRINCIPLES:
 * - Every function calls `getDb()` internally — callers don't manage the connection.
 * - All functions are synchronous (using expo-sqlite's sync API).
 *   For the data volumes a cabinet app works with (<100 rows), sync is fine
 *   and avoids async/await complexity throughout the store layer.
 * - Functions accept and return typed objects that match src/types/index.ts.
 * - SQL uses positional parameters (?) to prevent SQL injection.
 *   Never interpolate user input directly into SQL strings.
 *
 * C# COMPARISON NOTES:
 * - These functions are like Repository pattern methods in C# (IProjectRepository).
 * - `getDb().runSync(sql, params)` is like `dbContext.Database.ExecuteSqlRaw()`.
 * - `getDb().getAllSync<T>(sql)` is like `dbContext.Set<T>().FromSqlRaw().ToList()`.
 * - `getDb().getFirstSync<T>(sql, params)` is like `.FirstOrDefault()`.
 */

import { getDb } from './init';
import { Project, Cabinet, Drawer, MeasurementUnit, JoineryMethod } from '../types';
import { generateId, nowIso } from '../utils/helpers';

// =============================================================================
// PROJECTS
// =============================================================================

/**
 * Load all projects, most recently modified first.
 * Used for the Home screen project list.
 *
 * @returns Array of all Project records (may be empty on first launch)
 */
export function getAllProjects(): Project[] {
  return getDb().getAllSync<Project>(
    'SELECT * FROM projects ORDER BY modifiedAt DESC'
  );
}

/**
 * Load a single project by ID.
 *
 * @param id - The project UUID
 * @returns The Project, or null if not found
 */
export function getProject(id: string): Project | null {
  return getDb().getFirstSync<Project>(
    'SELECT * FROM projects WHERE id = ?',
    [id]
  );
}

/**
 * Create and save a new project to the database.
 *
 * @param name           - User-given project name (e.g., "Kitchen Reno 2026")
 * @param units          - Display unit preference for this project
 * @param defaultJoinery - Default joinery method for new cabinets
 * @returns The newly created Project object (with generated id and timestamps)
 */
export function insertProject(
  name: string,
  units: MeasurementUnit,
  defaultJoinery: JoineryMethod
): Project {
  const now = nowIso();
  const project: Project = {
    id: generateId(),
    name,
    units,
    defaultJoinery,
    createdAt: now,
    modifiedAt: now,
  };

  getDb().runSync(
    `INSERT INTO projects (id, name, units, defaultJoinery, createdAt, modifiedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [project.id, project.name, project.units, project.defaultJoinery, project.createdAt, project.modifiedAt]
  );

  return project;
}

/**
 * Update an existing project's editable fields.
 * Always updates modifiedAt to now.
 *
 * @param id      - The project UUID to update
 * @param updates - Partial Project fields to change (name, units, defaultJoinery)
 */
export function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'units' | 'defaultJoinery'>>
): void {
  // Build SQL dynamically based on which fields were provided
  // This avoids overwriting fields we didn't intend to change
  const fields: string[] = ['modifiedAt = ?'];
  const values: (string | number)[] = [nowIso()];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.units !== undefined) {
    fields.push('units = ?');
    values.push(updates.units);
  }
  if (updates.defaultJoinery !== undefined) {
    fields.push('defaultJoinery = ?');
    values.push(updates.defaultJoinery);
  }

  values.push(id); // for the WHERE clause

  getDb().runSync(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Delete a project and all its cabinets and drawers.
 * Cascading delete is handled by SQLite foreign key constraints.
 *
 * @param id - The project UUID to delete
 */
export function deleteProject(id: string): void {
  getDb().runSync('DELETE FROM projects WHERE id = ?', [id]);
}

// =============================================================================
// CABINETS
// =============================================================================

/**
 * Load all cabinets for a project.
 *
 * @param projectId - The parent project UUID
 * @returns Array of Cabinet records in insertion order
 */
export function getCabinetsForProject(projectId: string): Cabinet[] {
  return getDb().getAllSync<Cabinet>(
    'SELECT * FROM cabinets WHERE projectId = ? ORDER BY rowid ASC',
    [projectId]
  );
}

/**
 * Load a single cabinet by ID.
 *
 * @param id - The cabinet UUID
 * @returns The Cabinet, or null if not found
 */
export function getCabinet(id: string): Cabinet | null {
  return getDb().getFirstSync<Cabinet>(
    'SELECT * FROM cabinets WHERE id = ?',
    [id]
  );
}

/**
 * Save a new cabinet to the database.
 *
 * @param cabinetData - Cabinet fields (id and projectId must be provided)
 * @returns The saved Cabinet object
 */
export function insertCabinet(cabinetData: Cabinet): Cabinet {
  getDb().runSync(
    `INSERT INTO cabinets
       (id, projectId, type, width, height, depth, toeKickOption, toeKickHeight, joineryMethod)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cabinetData.id,
      cabinetData.projectId,
      cabinetData.type,
      cabinetData.width,
      cabinetData.height,
      cabinetData.depth,
      cabinetData.toeKickOption,
      cabinetData.toeKickHeight,
      cabinetData.joineryMethod,
    ]
  );
  return cabinetData;
}

/**
 * Update an existing cabinet's configuration.
 *
 * @param id      - The cabinet UUID to update
 * @param updates - Partial Cabinet fields to change
 */
export function updateCabinet(
  id: string,
  updates: Partial<Omit<Cabinet, 'id' | 'projectId'>>
): void {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.type !== undefined)          { fields.push('type = ?');          values.push(updates.type); }
  if (updates.width !== undefined)         { fields.push('width = ?');         values.push(updates.width); }
  if (updates.height !== undefined)        { fields.push('height = ?');        values.push(updates.height); }
  if (updates.depth !== undefined)         { fields.push('depth = ?');         values.push(updates.depth); }
  if (updates.toeKickOption !== undefined) { fields.push('toeKickOption = ?'); values.push(updates.toeKickOption); }
  if (updates.toeKickHeight !== undefined) { fields.push('toeKickHeight = ?'); values.push(updates.toeKickHeight); }
  if (updates.joineryMethod !== undefined) { fields.push('joineryMethod = ?'); values.push(updates.joineryMethod); }

  if (fields.length === 0) return; // nothing to update

  values.push(id);
  getDb().runSync(
    `UPDATE cabinets SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Delete a cabinet and all its drawers.
 *
 * @param id - The cabinet UUID to delete
 */
export function deleteCabinet(id: string): void {
  getDb().runSync('DELETE FROM cabinets WHERE id = ?', [id]);
}

// =============================================================================
// DRAWERS
// =============================================================================

/**
 * Load all drawers for a cabinet.
 *
 * @param cabinetId - The parent cabinet UUID
 * @returns Array of Drawer records
 */
export function getDrawersForCabinet(cabinetId: string): Drawer[] {
  return getDb().getAllSync<Drawer>(
    'SELECT * FROM drawers WHERE cabinetId = ? ORDER BY rowid ASC',
    [cabinetId]
  );
}

/**
 * Load a single drawer by ID.
 *
 * @param id - The drawer UUID
 * @returns The Drawer, or null if not found
 */
export function getDrawer(id: string): Drawer | null {
  return getDb().getFirstSync<Drawer>(
    'SELECT * FROM drawers WHERE id = ?',
    [id]
  );
}

/**
 * Save a new drawer to the database.
 *
 * @param drawerData - Full Drawer object to insert
 * @returns The saved Drawer object
 */
export function insertDrawer(drawerData: Drawer): Drawer {
  getDb().runSync(
    `INSERT INTO drawers
       (id, cabinetId, width, height, depth, cornerJoinery, bottomMethod, frontMaterial)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      drawerData.id,
      drawerData.cabinetId,
      drawerData.width,
      drawerData.height,
      drawerData.depth,
      drawerData.cornerJoinery,
      drawerData.bottomMethod,
      drawerData.frontMaterial,
    ]
  );
  return drawerData;
}

/**
 * Update an existing drawer's configuration.
 *
 * @param id      - The drawer UUID to update
 * @param updates - Partial Drawer fields to change
 */
export function updateDrawer(
  id: string,
  updates: Partial<Omit<Drawer, 'id' | 'cabinetId'>>
): void {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.width !== undefined)         { fields.push('width = ?');         values.push(updates.width); }
  if (updates.height !== undefined)        { fields.push('height = ?');        values.push(updates.height); }
  if (updates.depth !== undefined)         { fields.push('depth = ?');         values.push(updates.depth); }
  if (updates.cornerJoinery !== undefined) { fields.push('cornerJoinery = ?'); values.push(updates.cornerJoinery); }
  if (updates.bottomMethod !== undefined)  { fields.push('bottomMethod = ?');  values.push(updates.bottomMethod); }
  if (updates.frontMaterial !== undefined) { fields.push('frontMaterial = ?'); values.push(updates.frontMaterial); }

  if (fields.length === 0) return;

  values.push(id);
  getDb().runSync(
    `UPDATE drawers SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Delete a drawer.
 *
 * @param id - The drawer UUID to delete
 */
export function deleteDrawer(id: string): void {
  getDb().runSync('DELETE FROM drawers WHERE id = ?', [id]);
}

// =============================================================================
// SETTINGS (key-value store)
// =============================================================================

/**
 * Read a setting value by key.
 *
 * @param key          - The setting key (e.g., "units", "defaultJoinery")
 * @param defaultValue - Returned if the key doesn't exist yet
 * @returns The stored value string, or defaultValue if missing
 */
export function getSetting(key: string, defaultValue: string): string {
  const row = getDb().getFirstSync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? defaultValue;
}

/**
 * Write a setting value. Inserts on first write, updates on subsequent writes.
 * (SQL UPSERT pattern using INSERT OR REPLACE.)
 *
 * @param key   - The setting key
 * @param value - The value to store (always stored as TEXT)
 */
export function setSetting(key: string, value: string): void {
  getDb().runSync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}
