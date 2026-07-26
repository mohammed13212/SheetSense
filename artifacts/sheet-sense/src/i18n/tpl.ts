/**
 * Simple string-template interpolator.
 * Replaces {key} placeholders with values from `vars`.
 *
 * Example:
 *   tpl('Showing {count} rows of "{sheet}"', { count: 5, sheet: "Sheet1" })
 *   → 'Showing 5 rows of "Sheet1"'
 */
export function tpl(
  str: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce<string>(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    str,
  );
}
