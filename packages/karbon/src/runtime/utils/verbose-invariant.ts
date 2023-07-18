export function verboseInvariant(condition: unknown, message = 'Invariant error'): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
