/**
 * helpers.ts — General-Purpose Utility Functions
 *
 * Small helpers used across the database layer and stores.
 * Kept separate from unitConversion.ts (which is display-focused)
 * and the calculator modules (which are domain-focused).
 *
 * C# COMPARISON NOTES:
 * - These are equivalent to C# static utility methods.
 * - `generateId()` replaces the need for `System.Guid.NewGuid()` —
 *   we can't use the .NET GUID type in JS, so we generate a UUID v4
 *   manually from random bytes.
 */

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generate a UUID v4 string — a universally unique identifier.
 *
 * Format: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 * Example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *
 * WHY NO LIBRARY?
 * Adding `uuid` + `react-native-get-random-values` to the bundle just for
 * ID generation is overkill. This standard implementation is widely used
 * in React Native projects and works correctly on all platforms.
 *
 * UNIQUENESS:
 * The probability of a collision with UUID v4 is astronomically small
 * (~1 in 10^18 for 1 million IDs). For cabinet projects, we're generating
 * maybe 100-1000 IDs total — collisions are essentially impossible.
 *
 * C# equivalent: System.Guid.NewGuid().ToString()
 *
 * @returns A UUID v4 string (lowercase hex with hyphens)
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomNibble = (Math.random() * 16) | 0;
    // For 'y': must be 8, 9, a, or b (RFC 4122 variant bits)
    const value = char === 'x' ? randomNibble : (randomNibble & 0x3) | 0x8;
    return value.toString(16);
  });
}

// =============================================================================
// DATE / TIME UTILITIES
// =============================================================================

/**
 * Return the current date and time as an ISO 8601 string.
 *
 * Example: "2026-02-09T14:32:11.456Z"
 *
 * WHY ISO STRINGS IN THE DATABASE?
 * SQLite doesn't have a native datetime type — everything is TEXT, REAL, or INTEGER.
 * ISO 8601 strings are:
 *   - Human-readable in DB browser tools
 *   - Sortable lexicographically (newest last when sorted alphabetically)
 *   - Parseable by `new Date(isoString)` everywhere
 *
 * C# equivalent: DateTime.UtcNow.ToString("o")  // roundtrip format
 *
 * @returns ISO 8601 UTC timestamp string
 */
export function nowIso(): string {
  return new Date().toISOString();
}
