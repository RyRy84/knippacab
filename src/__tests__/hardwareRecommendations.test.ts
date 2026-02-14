/**
 * Hardware Recommendations Tests (Phase 5.3)
 *
 * Validates that the hardware shopping list generator produces correct
 * quantities and items for various cabinet/drawer configurations.
 */

import {
  generateHardwareRecommendations,
  HardwareItem,
  CATEGORY_LABELS,
} from '../utils/hardwareRecommendations';
import { Cabinet, Drawer } from '../types';

// =============================================================================
// TEST HELPERS
// =============================================================================

function makeCabinet(overrides: Partial<Cabinet> = {}): Cabinet {
  return {
    id: 'cab-1',
    projectId: 'proj-1',
    type: 'base',
    width: 914,        // 36" — double doors
    height: 876,       // 34.5"
    depth: 610,        // 24"
    toeKickOption: 'standard',
    toeKickHeight: 102,
    joineryMethod: 'pocket_hole',
    ...overrides,
  };
}

function makeDrawer(overrides: Partial<Drawer> = {}): Drawer {
  return {
    id: 'drw-1',
    cabinetId: 'cab-1',
    width: 559,        // 22" internal
    height: 127,       // 5"
    depth: 508,        // 20"
    cornerJoinery: 'pocket_hole',
    bottomMethod: 'applied',
    frontMaterial: '3/4" Maple Plywood',
    ...overrides,
  };
}

function findItem(items: HardwareItem[], nameSubstring: string): HardwareItem | undefined {
  return items.find(i => i.name.includes(nameSubstring));
}

// =============================================================================
// TESTS
// =============================================================================

describe('generateHardwareRecommendations', () => {

  // ── Empty project ──────────────────────────────────────────────────────

  test('returns no items for empty project', () => {
    const result = generateHardwareRecommendations([], []);
    expect(result.items).toHaveLength(0);
    expect(result.totalItemTypes).toBe(0);
  });

  // ── Single base cabinet (pocket hole) ──────────────────────────────────

  test('pocket hole base cabinet — generates screws, hinges, back panel nails, glue', () => {
    const result = generateHardwareRecommendations([makeCabinet()], []);

    // Pocket screws for carcass + toe kick
    const pocketScrews = findItem(result.items, '2-1/2" Pocket Screws');
    expect(pocketScrews).toBeDefined();
    expect(pocketScrews!.quantity).toBe(28); // 24 carcass + 4 toe kick

    // Back panel brad nails
    const backNails = findItem(result.items, '3/4" Brad Nails');
    expect(backNails).toBeDefined();

    // Hinges (36" wide → double doors, 34.5" height → 2 hinges each = 4 total)
    const hinges = findItem(result.items, 'Euro Cup Hinges');
    expect(hinges).toBeDefined();
    expect(hinges!.quantity).toBe(4);

    // Mounting plates (same count as hinges)
    const plates = findItem(result.items, 'Mounting Plates');
    expect(plates).toBeDefined();
    expect(plates!.quantity).toBe(4);

    // Wood glue
    const glue = findItem(result.items, 'Wood Glue');
    expect(glue).toBeDefined();
    expect(glue!.quantity).toBe(1);
  });

  // ── Dado cabinet — brads instead of screws ─────────────────────────────

  test('dado cabinet uses brad nails instead of screws', () => {
    const cab = makeCabinet({ joineryMethod: 'dado_rabbet' });
    const result = generateHardwareRecommendations([cab], []);

    const brads = findItem(result.items, '1-1/4" Brad Nails');
    expect(brads).toBeDefined();
    expect(brads!.quantity).toBe(32);

    // Should NOT have pocket screws
    const pocketScrews = findItem(result.items, 'Pocket Screws');
    expect(pocketScrews).toBeUndefined();
  });

  // ── Dowel cabinet ──────────────────────────────────────────────────────

  test('dowel cabinet generates fluted dowels', () => {
    const cab = makeCabinet({ joineryMethod: 'dowel' });
    const result = generateHardwareRecommendations([cab], []);

    const dowels = findItem(result.items, 'Fluted Dowels');
    expect(dowels).toBeDefined();
    expect(dowels!.quantity).toBe(16);
  });

  // ── Butt screw cabinet ────────────────────────────────────────────────

  test('butt screw cabinet generates wood screws', () => {
    const cab = makeCabinet({ joineryMethod: 'butt_screws' });
    const result = generateHardwareRecommendations([cab], []);

    const screws = findItem(result.items, '#8 × 2" Wood Screws');
    expect(screws).toBeDefined();
    expect(screws!.quantity).toBe(24); // 20 + 4 toe kick
  });

  // ── Wall cabinet (no toe kick) ────────────────────────────────────────

  test('wall cabinet with pocket hole — fewer screws (no toe kick)', () => {
    const cab = makeCabinet({ type: 'wall', toeKickOption: 'none', toeKickHeight: 0 });
    const result = generateHardwareRecommendations([cab], []);

    const pocketScrews = findItem(result.items, '2-1/2" Pocket Screws');
    expect(pocketScrews!.quantity).toBe(24); // no toe kick = no extra 4
  });

  // ── Single door (narrow cabinet) ──────────────────────────────────────

  test('narrow cabinet gets single door with 2 hinges', () => {
    const cab = makeCabinet({ width: 457 }); // 18" — single door
    const result = generateHardwareRecommendations([cab], []);

    const hinges = findItem(result.items, 'Euro Cup Hinges');
    expect(hinges!.quantity).toBe(2); // 1 door × 2 hinges
  });

  // ── Tall door gets 3 hinges ───────────────────────────────────────────

  test('tall cabinet door gets 3 hinges per door', () => {
    const cab = makeCabinet({ height: 1200 }); // very tall — 3 hinges
    const result = generateHardwareRecommendations([cab], []);

    const hinges = findItem(result.items, 'Euro Cup Hinges');
    expect(hinges!.quantity).toBe(6); // 2 doors × 3 hinges each
  });

  // ── Tall cabinet type has no doors/hinges ─────────────────────────────

  test('tall cabinet type does not generate hinges (deferred)', () => {
    const cab = makeCabinet({ type: 'tall' });
    const result = generateHardwareRecommendations([cab], []);

    const hinges = findItem(result.items, 'Euro Cup Hinges');
    expect(hinges).toBeUndefined();
  });

  // ── Drawer with pocket hole ───────────────────────────────────────────

  test('pocket hole drawer generates 1-1/4" screws and slides', () => {
    const cab = makeCabinet();
    const drw = makeDrawer();
    const result = generateHardwareRecommendations([cab], [drw]);

    const shortScrews = findItem(result.items, '1-1/4" Pocket Screws');
    expect(shortScrews).toBeDefined();
    expect(shortScrews!.quantity).toBe(8);

    // Face attachment screws
    const faceScrews = findItem(result.items, 'Washer-Head');
    expect(faceScrews).toBeDefined();
    expect(faceScrews!.quantity).toBe(4);

    // Drawer slides (508mm depth → 20" slides)
    const slides = findItem(result.items, '20" Full-Extension');
    expect(slides).toBeDefined();
    expect(slides!.quantity).toBe(1);
    expect(slides!.unit).toBe('pair');
  });

  // ── Multiple drawers accumulate quantities ────────────────────────────

  test('multiple drawers accumulate fastener and slide quantities', () => {
    const cab = makeCabinet();
    const drw1 = makeDrawer({ id: 'drw-1' });
    const drw2 = makeDrawer({ id: 'drw-2' });
    const drw3 = makeDrawer({ id: 'drw-3' });
    const result = generateHardwareRecommendations([cab], [drw1, drw2, drw3]);

    const shortScrews = findItem(result.items, '1-1/4" Pocket Screws');
    expect(shortScrews!.quantity).toBe(24); // 8 × 3

    const faceScrews = findItem(result.items, 'Washer-Head');
    expect(faceScrews!.quantity).toBe(12); // 4 × 3

    const slides = findItem(result.items, '20" Full-Extension');
    expect(slides!.quantity).toBe(3); // 1 pair × 3
  });

  // ── Drawer slide length matching ──────────────────────────────────────

  test('shallow drawer gets shorter slides', () => {
    const drw = makeDrawer({ depth: 305 }); // 12" depth
    const result = generateHardwareRecommendations([makeCabinet()], [drw]);

    const slides = findItem(result.items, '12" Full-Extension');
    expect(slides).toBeDefined();
  });

  // ── Dado drawer uses brad nails ───────────────────────────────────────

  test('dado drawer generates brad nails', () => {
    const drw = makeDrawer({ cornerJoinery: 'dado' });
    const result = generateHardwareRecommendations([makeCabinet()], [drw]);

    const brads = findItem(result.items, '1" Brad Nails');
    expect(brads).toBeDefined();
    expect(brads!.quantity).toBe(16);
  });

  // ── Multi-cabinet project accumulates correctly ────────────────────────

  test('two cabinets accumulate all hardware', () => {
    const cab1 = makeCabinet({ id: 'cab-1' });
    const cab2 = makeCabinet({ id: 'cab-2', width: 457 }); // narrow = single door
    const result = generateHardwareRecommendations([cab1, cab2], []);

    const pocketScrews = findItem(result.items, '2-1/2" Pocket Screws');
    expect(pocketScrews!.quantity).toBe(56); // 28 × 2

    // cab1: 4 hinges (double), cab2: 2 hinges (single) = 6 total
    const hinges = findItem(result.items, 'Euro Cup Hinges');
    expect(hinges!.quantity).toBe(6);

    // Still just 1 bottle of glue
    const glue = findItem(result.items, 'Wood Glue');
    expect(glue!.quantity).toBe(1);
  });

  // ── Items are sorted by category ──────────────────────────────────────

  test('items are sorted: fasteners → hinges → slides → accessories', () => {
    const result = generateHardwareRecommendations(
      [makeCabinet()],
      [makeDrawer()],
    );

    const categories = result.items.map(i => i.category);
    const expected = ['fasteners', 'hinges', 'slides', 'accessories'];

    // Check that categories appear in order (not necessarily all present)
    let lastIdx = -1;
    for (const cat of categories) {
      const idx = expected.indexOf(cat);
      expect(idx).toBeGreaterThanOrEqual(lastIdx);
      lastIdx = idx;
    }
  });

  // ── CATEGORY_LABELS covers all categories ─────────────────────────────

  test('CATEGORY_LABELS has entries for all 4 categories', () => {
    expect(CATEGORY_LABELS.fasteners).toBe('Fasteners');
    expect(CATEGORY_LABELS.hinges).toBe('Hinges & Mounting');
    expect(CATEGORY_LABELS.slides).toBe('Drawer Slides');
    expect(CATEGORY_LABELS.accessories).toBe('Accessories');
  });
});
