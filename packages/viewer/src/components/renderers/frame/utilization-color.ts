/** Get display color based on utilization from structural analysis metadata.
 *
 * - No metadata (no analysis yet): returns `defaultColor` unchanged
 * - utilization <= 0.8: green  (#4ade80) — comfortable
 * - utilization 0.8–1.0: yellow (#facc15) — tight but passing
 * - utilization > 1.0: red    (#ef4444) — failing
 */
export function getUtilizationColor(
  metadata: Record<string, unknown> | undefined,
  defaultColor: string,
): string {
  const utilization =
    (metadata as { utilization?: number } | undefined)?.utilization ?? undefined
  if (utilization === undefined || utilization === null) return defaultColor
  if (utilization <= 0.8) return '#4ade80'
  if (utilization <= 1.0) return '#facc15'
  return '#ef4444'
}
