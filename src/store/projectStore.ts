/**
 * projectStore.ts — Project, Cabinet & Drawer State (Zustand)
 *
 * The main state store for KnippaCab. Holds the currently open project
 * and all its associated cabinets and drawers in memory for fast UI access.
 * Every mutation writes to SQLite immediately to ensure data is never lost.
 *
 * DATA FLOW:
 *   User action (tap "Add Cabinet")
 *     ↓
 *   Store action: addCabinet(data)
 *     ↓
 *   1. Write to SQLite (persist)
 *     ↓
 *   2. Update Zustand state (trigger UI re-render)
 *     ↓
 *   Screens automatically show the new cabinet (no manual refresh needed)
 *
 * STATE STRUCTURE:
 * - `projects`: All projects loaded from DB (for the Home screen list)
 * - `currentProject`: The project the user is currently editing
 * - `cabinets`: All cabinets in currentProject
 * - `drawers`: All drawers across all cabinets in currentProject
 *   (loaded all at once — avoids per-cabinet DB calls during cut list generation)
 *
 * ZUSTAND SELECTOR PATTERN:
 * In components, select only the state you need to avoid unnecessary re-renders:
 *
 * ```tsx
 * // Good: re-renders only when cabinets changes
 * const cabinets = useProjectStore((s) => s.cabinets);
 *
 * // Avoid: re-renders on any state change
 * const store = useProjectStore();
 * ```
 *
 * C# COMPARISON NOTES:
 * - This store replaces a C# ViewModel + Repository combination.
 *   The ViewModel holds in-memory state; the Repository handles DB access.
 *   In KnippaCab, they're unified in a single Zustand store.
 * - `set()` is like calling `OnPropertyChanged()` but for the whole state object.
 * - The Cabinet/Drawer arrays are immutable snapshots — we replace the whole
 *   array rather than mutating it in place (React needs new references to detect changes).
 */

import { create } from 'zustand';
import {
  Project, Cabinet, Drawer,
  CabinetType, JoineryMethod, ToeKickOption,
  DrawerCornerJoinery, DrawerBottomMethod, MeasurementUnit,
} from '../types';
import {
  getAllProjects, getProject, insertProject, updateProject, deleteProject,
  getCabinetsForProject, insertCabinet, updateCabinet, deleteCabinet,
  getDrawersForCabinet, insertDrawer, updateDrawer, deleteDrawer,
} from '../db/queries';
import { generateId } from '../utils/helpers';
import {
  BASE_CABINET_HEIGHT_MM, BASE_CABINET_DEPTH_MM,
  WALL_CABINET_HEIGHT_MM, WALL_CABINET_DEPTH_MM,
  TALL_CABINET_HEIGHT_MM, TALL_CABINET_DEPTH_MM,
  STANDARD_TOE_KICK_HEIGHT_MM,
  DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM, DRAWER_TOP_CLEARANCE_MM,
} from '../constants/cabinetDefaults';

// =============================================================================
// INPUT TYPES (what callers provide when creating entities)
// =============================================================================

/**
 * Fields required to create a new project.
 * All other fields (id, timestamps) are generated automatically.
 */
export interface NewProjectInput {
  name: string;
  units: MeasurementUnit;
  defaultJoinery: JoineryMethod;
}

/**
 * Fields required to create a new cabinet.
 * projectId and id are handled by the store.
 */
export interface NewCabinetInput {
  type: CabinetType;
  width: number;
  height?: number;       // optional: defaults to type-specific standard
  depth?: number;        // optional: defaults to type-specific standard
  toeKickOption?: ToeKickOption;
  toeKickHeight?: number;
  joineryMethod?: JoineryMethod; // optional: defaults to project's defaultJoinery
}

/**
 * Fields required to create a new drawer within a cabinet.
 * cabinetId and id are handled by the store.
 * Width/height/depth should be INTERNAL box dimensions (after slide clearances).
 */
export interface NewDrawerInput {
  width: number;
  height: number;
  depth: number;
  cornerJoinery?: DrawerCornerJoinery;
  bottomMethod?: DrawerBottomMethod;
  frontMaterial?: string;
}

// =============================================================================
// STATE TYPE
// =============================================================================

interface ProjectState {
  // ─── Data ────────────────────────────────────────────────────────────────
  /** All saved projects, for the Home screen list. */
  projects: Project[];

  /** The project currently being edited. Null on the Home screen. */
  currentProject: Project | null;

  /** Cabinets in the current project, in creation order. */
  cabinets: Cabinet[];

  /** All drawers across all cabinets in the current project. */
  drawers: Drawer[];

  // ─── Project Actions ─────────────────────────────────────────────────────

  /** Load all projects from the database into the projects list. */
  loadAllProjects: () => void;

  /**
   * Create a new project, save to DB, and set it as the current project.
   * @returns The new Project object
   */
  createProject: (input: NewProjectInput) => Project;

  /**
   * Open an existing project: load it from DB, load its cabinets and drawers.
   * Sets currentProject, cabinets, drawers in one call.
   */
  openProject: (projectId: string) => void;

  /** Update fields on the current project (name, units, defaultJoinery). */
  updateCurrentProject: (updates: Partial<Pick<Project, 'name' | 'units' | 'defaultJoinery'>>) => void;

  /**
   * Delete a project and all its data.
   * If deleting the current project, clears currentProject.
   */
  deleteProject: (projectId: string) => void;

  /** Clear the current project (return to Home screen state). */
  closeProject: () => void;

  // ─── Cabinet Actions ──────────────────────────────────────────────────────

  /**
   * Add a cabinet to the current project.
   * Defaults: height/depth filled from type-specific standards.
   * @returns The new Cabinet object
   */
  addCabinet: (input: NewCabinetInput) => Cabinet;

  /** Update a cabinet's configuration. */
  updateCabinet: (cabinetId: string, updates: Partial<Omit<Cabinet, 'id' | 'projectId'>>) => void;

  /** Delete a cabinet and all its drawers. */
  deleteCabinet: (cabinetId: string) => void;

  /** Duplicate a cabinet (new ID, same config, appended to the cabinet list). */
  duplicateCabinet: (cabinetId: string) => Cabinet | null;

  // ─── Drawer Actions ───────────────────────────────────────────────────────

  /**
   * Add a drawer to a cabinet.
   * @returns The new Drawer object
   */
  addDrawer: (cabinetId: string, input: NewDrawerInput) => Drawer;

  /** Update a drawer's configuration. */
  updateDrawer: (drawerId: string, updates: Partial<Omit<Drawer, 'id' | 'cabinetId'>>) => void;

  /** Delete a drawer. */
  deleteDrawer: (drawerId: string) => void;

  /** Get all drawers belonging to a specific cabinet. */
  getDrawersForCabinet: (cabinetId: string) => Drawer[];
}

// =============================================================================
// DEFAULT DIMENSION HELPERS
// =============================================================================

/**
 * Get the standard height for a cabinet type in mm.
 */
function defaultHeight(type: CabinetType): number {
  switch (type) {
    case 'base': return BASE_CABINET_HEIGHT_MM;
    case 'wall': return WALL_CABINET_HEIGHT_MM;
    case 'tall': return TALL_CABINET_HEIGHT_MM;
  }
}

/**
 * Get the standard depth for a cabinet type in mm.
 */
function defaultDepth(type: CabinetType): number {
  switch (type) {
    case 'base': return BASE_CABINET_DEPTH_MM;
    case 'wall': return WALL_CABINET_DEPTH_MM;
    case 'tall': return TALL_CABINET_DEPTH_MM;
  }
}

/**
 * Get the default toe kick option for a cabinet type.
 * Only base cabinets get a standard toe kick.
 */
function defaultToeKickOption(type: CabinetType): ToeKickOption {
  return type === 'base' ? 'standard' : 'none';
}

/**
 * Get the default toe kick height for a cabinet type.
 */
function defaultToeKickHeight(type: CabinetType): number {
  return type === 'base' ? STANDARD_TOE_KICK_HEIGHT_MM : 0;
}

// =============================================================================
// STORE
// =============================================================================

export const useProjectStore = create<ProjectState>()((set, get) => ({
  // ─── Initial state ────────────────────────────────────────────────────────
  projects: [],
  currentProject: null,
  cabinets: [],
  drawers: [],

  // ─── Project Actions ──────────────────────────────────────────────────────

  loadAllProjects: () => {
    const projects = getAllProjects();
    set({ projects });
  },

  createProject: (input) => {
    const project = insertProject(input.name, input.units, input.defaultJoinery);
    // Add to in-memory list and set as current
    set((state) => ({
      projects: [project, ...state.projects],
      currentProject: project,
      cabinets: [],
      drawers: [],
    }));
    return project;
  },

  openProject: (projectId) => {
    const project = getProject(projectId);
    if (!project) return;

    const cabinets = getCabinetsForProject(projectId);

    // Load drawers for ALL cabinets in one pass (avoids N+1 DB calls)
    const drawers: Drawer[] = [];
    for (const cabinet of cabinets) {
      const cabinetDrawers = getDrawersForCabinet(cabinet.id);
      drawers.push(...cabinetDrawers);
    }

    set({ currentProject: project, cabinets, drawers });
  },

  updateCurrentProject: (updates) => {
    const { currentProject } = get();
    if (!currentProject) return;

    updateProject(currentProject.id, updates);

    const updated: Project = { ...currentProject, ...updates, modifiedAt: new Date().toISOString() };
    set((state) => ({
      currentProject: updated,
      projects: state.projects.map((p) => p.id === updated.id ? updated : p),
    }));
  },

  deleteProject: (projectId) => {
    deleteProject(projectId);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      // Clear current project if it's the one being deleted
      currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
      cabinets: state.currentProject?.id === projectId ? [] : state.cabinets,
      drawers: state.currentProject?.id === projectId ? [] : state.drawers,
    }));
  },

  closeProject: () => {
    set({ currentProject: null, cabinets: [], drawers: [] });
  },

  // ─── Cabinet Actions ──────────────────────────────────────────────────────

  addCabinet: (input) => {
    const { currentProject } = get();
    if (!currentProject) throw new Error('No project open');

    const cabinet: Cabinet = {
      id: generateId(),
      projectId: currentProject.id,
      type: input.type,
      width: input.width,
      height: input.height ?? defaultHeight(input.type),
      depth: input.depth ?? defaultDepth(input.type),
      toeKickOption: input.toeKickOption ?? defaultToeKickOption(input.type),
      toeKickHeight: input.toeKickHeight ?? defaultToeKickHeight(input.type),
      joineryMethod: input.joineryMethod ?? currentProject.defaultJoinery,
    };

    insertCabinet(cabinet);
    set((state) => ({ cabinets: [...state.cabinets, cabinet] }));
    return cabinet;
  },

  updateCabinet: (cabinetId, updates) => {
    updateCabinet(cabinetId, updates);
    set((state) => ({
      cabinets: state.cabinets.map((c) =>
        c.id === cabinetId ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteCabinet: (cabinetId) => {
    deleteCabinet(cabinetId);
    set((state) => ({
      cabinets: state.cabinets.filter((c) => c.id !== cabinetId),
      drawers: state.drawers.filter((d) => d.cabinetId !== cabinetId),
    }));
  },

  duplicateCabinet: (cabinetId) => {
    const { currentProject, cabinets } = get();
    if (!currentProject) return null;

    const source = cabinets.find((c) => c.id === cabinetId);
    if (!source) return null;

    const copy: Cabinet = { ...source, id: generateId() };
    insertCabinet(copy);
    set((state) => ({ cabinets: [...state.cabinets, copy] }));
    return copy;
  },

  // ─── Drawer Actions ───────────────────────────────────────────────────────

  addDrawer: (cabinetId, input) => {
    const drawer: Drawer = {
      id: generateId(),
      cabinetId,
      width: input.width,
      height: input.height,
      depth: input.depth,
      cornerJoinery: input.cornerJoinery ?? 'pocket_hole',
      bottomMethod: input.bottomMethod ?? 'applied',
      frontMaterial: input.frontMaterial ?? '3/4" Plywood',
    };

    insertDrawer(drawer);
    set((state) => ({ drawers: [...state.drawers, drawer] }));
    return drawer;
  },

  updateDrawer: (drawerId, updates) => {
    updateDrawer(drawerId, updates);
    set((state) => ({
      drawers: state.drawers.map((d) =>
        d.id === drawerId ? { ...d, ...updates } : d
      ),
    }));
  },

  deleteDrawer: (drawerId) => {
    deleteDrawer(drawerId);
    set((state) => ({
      drawers: state.drawers.filter((d) => d.id !== drawerId),
    }));
  },

  getDrawersForCabinet: (cabinetId) => {
    return get().drawers.filter((d) => d.cabinetId === cabinetId);
  },
}));
