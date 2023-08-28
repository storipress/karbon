export function verboseInvariant(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ? `Invariant failed: ${message}` : 'Invariant failed')
  }
}
