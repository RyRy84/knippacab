/**
 * hardwareRecommendations.ts — Hardware Shopping List Generator (Phase 5.3)
 *
 * Recommends screws, hinges, drawer slides, and other hardware based on
 * the joinery method, cabinet type, and drawer configuration.
 *
 * DESIGN:
 * - Pure function: takes cabinets + drawers, returns a shopping list.
 * - Quantities are calculated per-cabinet and summed.
 * - No external state — caller provides all data.
 *
 * HARDWARE RULES (V1):
 *
 * SCREWS / FASTENERS (per joinery method):
 *   pocket_hole → 2-1/2" pocket screws (carcass) + 1-1/4" pocket screws (face frame/drawer)
 *   butt_screws → #8 × 2" wood screws (carcass) + #6 × 1-1/4" (drawer)
 *   dado_rabbet → 18-gauge × 1-1/4" brad nails + wood glue
 *   dowel       → 3/8" × 2" fluted dowels + wood glue
 *
 * HINGES (per cabinet with doors):
 *   Frameless cabinets → 35mm European cup hinges (107° or 120°)
 *   2 hinges per door (short doors <900mm), 3 hinges for tall doors (≥900mm)
 *
 * DRAWER SLIDES (per drawer):
 *   Full-extension ball-bearing slides
 *   Length matched to drawer depth: 12", 14", 16", 18", 20", 22"
 *   1 pair per drawer
 *
 * ADDITIONAL:
 *   Wood glue — 1 bottle per project (always needed)
 *   Edge banding — estimated linear footage for exposed plywood edges
 */

import { Cabinet, Drawer, JoineryMethod } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface HardwareItem {
  /** What the item is (e.g. "2-1/2\" Pocket Screws") */
  name: string;
  /** How many to buy */
  quantity: number;
  /** Unit of measurement (e.g. "screws", "pairs", "hinges", "bottles") */
  unit: string;
  /** Which category for grouping in the UI */
  category: 'fasteners' | 'hinges' | 'slides' | 'accessories';
  /** Optional note (e.g. "For Kreg jig — coarse thread for plywood") */
  note?: string;
}

export interface HardwareRecommendation {
  /** Flat list of all hardware items, quantities summed across the project */
  items: HardwareItem[];
  /** Total unique item types */
  totalItemTypes: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Pocket screws per carcass joint (top/bottom to sides = 4 joints × ~6 screws each) */
const POCKET_SCREWS_PER_CABINET_CARCASS = 24;
/** Pocket screws for toe kick attachment */
const POCKET_SCREWS_PER_TOE_KICK = 4;
/** Short pocket screws per drawer (4 corners × 2 screws) */
const POCKET_SCREWS_PER_DRAWER = 8;

/** Wood screws per butt joint cabinet (similar distribution to pocket) */
const WOOD_SCREWS_PER_CABINET = 20;
const WOOD_SCREWS_PER_DRAWER = 8;

/** Brad nails per dado joint (glued joints, brads are temporary clamps) */
const BRAD_NAILS_PER_CABINET = 32;
const BRAD_NAILS_PER_DRAWER = 16;

/** Dowels per joint (2 dowels per joint, 4 joints for carcass) */
const DOWELS_PER_CABINET = 16;
const DOWELS_PER_DRAWER = 8;

/** Door height threshold for adding a third hinge */
const TALL_DOOR_THRESHOLD_MM = 900;

// Standard drawer slide lengths in mm → display label
const SLIDE_LENGTHS: { maxDepthMm: number; label: string }[] = [
  { maxDepthMm: 330,  label: '12"' },
  { maxDepthMm: 381,  label: '14"' },
  { maxDepthMm: 432,  label: '16"' },
  { maxDepthMm: 483,  label: '18"' },
  { maxDepthMm: 560,  label: '20"' },
  { maxDepthMm: 9999, label: '22"' },
];

// =============================================================================
// MAIN EXPORTED FUNCTION
// =============================================================================

/**
 * Generate a hardware shopping list for a project.
 *
 * @param cabinets - All cabinets in the project
 * @param drawers  - All drawers in the project
 * @returns Consolidated hardware recommendation with summed quantities
 */
export function generateHardwareRecommendations(
  cabinets: Cabinet[],
  drawers: Drawer[],
): HardwareRecommendation {
  // Accumulate items in a map keyed by item name for easy merging
  const itemMap = new Map<string, HardwareItem>();

  function addItem(item: Omit<HardwareItem, 'quantity'> & { quantity: number }) {
    const existing = itemMap.get(item.name);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      itemMap.set(item.name, { ...item });
    }
  }

  // ── Process each cabinet ──────────────────────────────────────────────

  for (const cabinet of cabinets) {
    // Fasteners based on joinery method
    addFastenersForCabinet(cabinet, addItem);

    // Hinges for doors (base and wall cabinets get doors)
    if (cabinet.type === 'base' || cabinet.type === 'wall') {
      addHingesForCabinet(cabinet, addItem);
    }
  }

  // ── Process each drawer ───────────────────────────────────────────────

  // Group drawers by cabinet to know joinery method
  const cabinetMap = new Map<string, Cabinet>();
  for (const cab of cabinets) {
    cabinetMap.set(cab.id, cab);
  }

  for (const drawer of drawers) {
    // Drawer fasteners — use the drawer's own corner joinery
    addFastenersForDrawer(drawer, addItem);

    // Drawer slides
    addSlidesForDrawer(drawer, addItem);
  }

  // ── Always-needed accessories ─────────────────────────────────────────

  if (cabinets.length > 0) {
    // Wood glue
    addItem({
      name: 'Wood Glue (16 oz)',
      quantity: 1,
      unit: 'bottle',
      category: 'accessories',
      note: 'Titebond II or III — waterproof recommended for kitchens',
    });
  }

  // Consolidate into array, ordered by category
  const categoryOrder: HardwareItem['category'][] = ['fasteners', 'hinges', 'slides', 'accessories'];
  const items = Array.from(itemMap.values()).sort((a, b) => {
    const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });

  return {
    items,
    totalItemTypes: items.length,
  };
}

// =============================================================================
// CABINET FASTENERS
// =============================================================================

function addFastenersForCabinet(
  cabinet: Cabinet,
  addItem: (item: HardwareItem) => void,
) {
  const hasToeKick = cabinet.toeKickOption !== 'none';

  switch (cabinet.joineryMethod) {
    case 'pocket_hole': {
      const qty = POCKET_SCREWS_PER_CABINET_CARCASS + (hasToeKick ? POCKET_SCREWS_PER_TOE_KICK : 0);
      addItem({
        name: '2-1/2" Pocket Screws (coarse)',
        quantity: qty,
        unit: 'screws',
        category: 'fasteners',
        note: 'Kreg #8 coarse-thread for 3/4" plywood carcass',
      });
      break;
    }
    case 'butt_screws': {
      addItem({
        name: '#8 × 2" Wood Screws',
        quantity: WOOD_SCREWS_PER_CABINET + (hasToeKick ? 4 : 0),
        unit: 'screws',
        category: 'fasteners',
        note: 'Pre-drill pilot holes to prevent splitting',
      });
      break;
    }
    case 'dado_rabbet': {
      addItem({
        name: '18-gauge × 1-1/4" Brad Nails',
        quantity: BRAD_NAILS_PER_CABINET,
        unit: 'nails',
        category: 'fasteners',
        note: 'Temporary clamps while glue dries — can be omitted with enough pipe clamps',
      });
      break;
    }
    case 'dowel': {
      addItem({
        name: '3/8" × 2" Fluted Dowels',
        quantity: DOWELS_PER_CABINET,
        unit: 'dowels',
        category: 'fasteners',
        note: 'Use doweling jig (Jessem, Dowelmax, or similar) for accurate alignment',
      });
      break;
    }
  }

  // Back panel attachment — always brads or staples regardless of joinery
  addItem({
    name: '18-gauge × 3/4" Brad Nails',
    quantity: 16,
    unit: 'nails',
    category: 'fasteners',
    note: 'For attaching 1/4" back panel to cabinet box',
  });
}

// =============================================================================
// DRAWER FASTENERS
// =============================================================================

function addFastenersForDrawer(
  drawer: Drawer,
  addItem: (item: HardwareItem) => void,
) {
  switch (drawer.cornerJoinery) {
    case 'pocket_hole':
      addItem({
        name: '1-1/4" Pocket Screws (fine)',
        quantity: POCKET_SCREWS_PER_DRAWER,
        unit: 'screws',
        category: 'fasteners',
        note: 'Kreg #7 fine-thread for 1/2" plywood drawer boxes',
      });
      break;
    case 'butt':
      addItem({
        name: '#6 × 1-1/4" Wood Screws',
        quantity: WOOD_SCREWS_PER_DRAWER,
        unit: 'screws',
        category: 'fasteners',
        note: 'Pre-drill pilot holes in 1/2" plywood',
      });
      break;
    case 'dado':
      addItem({
        name: '18-gauge × 1" Brad Nails',
        quantity: BRAD_NAILS_PER_DRAWER,
        unit: 'nails',
        category: 'fasteners',
        note: 'Hold drawer joints while glue sets',
      });
      break;
  }

  // Drawer face attachment — always 1-1/4" screws from inside the box
  addItem({
    name: '#8 × 1-1/4" Washer-Head Screws',
    quantity: 4,
    unit: 'screws',
    category: 'fasteners',
    note: 'Attach decorative face from inside drawer box — allows adjustment',
  });
}

// =============================================================================
// HINGES
// =============================================================================

function addHingesForCabinet(
  cabinet: Cabinet,
  addItem: (item: HardwareItem) => void,
) {
  const useDoubleDoors = cabinet.width > 600;
  const doorCount = useDoubleDoors ? 2 : 1;
  // Hinge count: 2 per short door, 3 for tall doors
  const hingesPerDoor = cabinet.height >= TALL_DOOR_THRESHOLD_MM ? 3 : 2;
  const totalHinges = doorCount * hingesPerDoor;

  addItem({
    name: '35mm Euro Cup Hinges (110°)',
    quantity: totalHinges,
    unit: 'hinges',
    category: 'hinges',
    note: 'Frameless/full overlay — Blum, Grass, or equivalent soft-close',
  });

  // Hinge mounting plates (one per hinge)
  addItem({
    name: 'Hinge Mounting Plates (0mm)',
    quantity: totalHinges,
    unit: 'plates',
    category: 'hinges',
    note: '0mm overlay for frameless cabinets — snap-on or screw-on',
  });
}

// =============================================================================
// DRAWER SLIDES
// =============================================================================

function addSlidesForDrawer(
  drawer: Drawer,
  addItem: (item: HardwareItem) => void,
) {
  // Match drawer depth to nearest standard slide length
  const slideLength = SLIDE_LENGTHS.find(s => drawer.depth <= s.maxDepthMm)
    ?? SLIDE_LENGTHS[SLIDE_LENGTHS.length - 1];

  addItem({
    name: `${slideLength.label} Full-Extension Drawer Slides`,
    quantity: 1,
    unit: 'pair',
    category: 'slides',
    note: 'Ball-bearing, 100 lb capacity — mount at drawer box center height',
  });
}

// =============================================================================
// CATEGORY LABELS (for UI grouping)
// =============================================================================

export const CATEGORY_LABELS: Record<HardwareItem['category'], string> = {
  fasteners: 'Fasteners',
  hinges: 'Hinges & Mounting',
  slides: 'Drawer Slides',
  accessories: 'Accessories',
};
