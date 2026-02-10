/**
 * queries.web.ts — Web Platform Stubs for Database Queries
 *
 * WHY THIS FILE EXISTS:
 * See init.web.ts for the full explanation. On web, expo-sqlite is unavailable,
 * so all DB calls are replaced with in-memory stubs.
 *
 * BEHAVIOR ON WEB:
 * - Reads return empty arrays or null (no data initially).
 * - Writes are no-ops — data lives only in Zustand state and resets on refresh.
 * - insertProject() still returns a proper Project object (Zustand needs it).
 * - insertCabinet() / insertDrawer() pass through their input (Zustand needs it).
 * - getSetting() always returns the defaultValue (settings use defaults on web).
 *
 * This means the web app works fully for testing the UI and calculation engine.
 * Projects/cabinets created during a web session disappear on page refresh.
 * Persistence is a native-only feature until proper web storage is added.
 */

import { Project, Cabinet, Drawer, MeasurementUnit, JoineryMethod } from '../types';
import { generateId, nowIso } from '../utils/helpers';

// =============================================================================
// PROJECTS
// =============================================================================

export function getAllProjects(): Project[] {
  return [];
}

export function getProject(_id: string): Project | null {
  return null;
}

/**
 * Creates and returns a Project object without persisting it.
 * The returned object is stored in Zustand and exists for the session.
 */
export function insertProject(
  name: string,
  units: MeasurementUnit,
  defaultJoinery: JoineryMethod
): Project {
  const now = nowIso();
  return {
    id: generateId(),
    name,
    units,
    defaultJoinery,
    createdAt: now,
    modifiedAt: now,
  };
}

export function updateProject(
  _id: string,
  _updates: Partial<Pick<Project, 'name' | 'units' | 'defaultJoinery'>>
): void {
  // no-op on web
}

export function deleteProject(_id: string): void {
  // no-op on web
}

// =============================================================================
// CABINETS
// =============================================================================

export function getCabinetsForProject(_projectId: string): Cabinet[] {
  return [];
}

export function getCabinet(_id: string): Cabinet | null {
  return null;
}

export function insertCabinet(cabinetData: Cabinet): Cabinet {
  return cabinetData; // pass-through; Zustand holds it in memory
}

export function updateCabinet(
  _id: string,
  _updates: Partial<Omit<Cabinet, 'id' | 'projectId'>>
): void {
  // no-op on web
}

export function deleteCabinet(_id: string): void {
  // no-op on web
}

// =============================================================================
// DRAWERS
// =============================================================================

export function getDrawersForCabinet(_cabinetId: string): Drawer[] {
  return [];
}

export function getDrawer(_id: string): Drawer | null {
  return null;
}

export function insertDrawer(drawerData: Drawer): Drawer {
  return drawerData; // pass-through; Zustand holds it in memory
}

export function updateDrawer(
  _id: string,
  _updates: Partial<Omit<Drawer, 'id' | 'cabinetId'>>
): void {
  // no-op on web
}

export function deleteDrawer(_id: string): void {
  // no-op on web
}

// =============================================================================
// SETTINGS
// =============================================================================

/**
 * Always returns the default value on web (no persistent storage).
 */
export function getSetting(_key: string, defaultValue: string): string {
  return defaultValue;
}

export function setSetting(_key: string, _value: string): void {
  // no-op on web
}
