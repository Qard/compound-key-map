/**
 * A compound key, which is an unordered set of any hashable type.
 */
export type CompoundKey<Key> = Key[] | Set<Key>

/**
 * A map which accepts compound keys.
 */
export default class CompoundMap<Key, Value> extends Map<Set<Key>, Value> {
  /**
   * Create a new compound map.
   *
   * @param initial An iterable of key-value pairs to initialize the map with.
   */
  constructor(initial?: Iterable<[CompoundKey<Key>, Value]>) {
    const data: [Set<Key>, Value][] = Array.from(initial ?? [])
      .map(([keys, value]) => [toKeySet(keys), value])

    super(data)
  }

  /**
   * Set the value for the given key set.
   *
   * @param keys The key set to set the value for.
   * @param value The value to set.
   * @returns The map itself.
   */
  set(keys: CompoundKey<Key>, value: Value): this {
    return super.set(toKeySet(keys), value)
  }

  /**
   * Get the value for the given key set.
   *
   * @param keys The key set to get the value for.
   * @returns The value for the given key set, or `undefined` if not found.
   */
  get(keys: CompoundKey<Key>): Value | undefined {
    return forKeySet(this, keys, (storedValue) => storedValue)
  }

  /**
   * Check if the map has a value for the given key set.
   *
   * @param keys The key set to check for.
   * @returns True if the map has a value for the given key set, false otherwise.
   */
  has(keys: CompoundKey<Key>): boolean {
    return forKeySet(this, keys, () => true) ?? false
  }

  /**
   * Delete the value for the given key set.
   *
   * @param keys The key set to delete the value for.
   * @returns True if the value was deleted, false otherwise.
   */
  delete(keys: CompoundKey<Key>): boolean {
    return forKeySet(this, keys, (_, storedKeys) => super.delete(storedKeys)) ?? false
  }
}

/*!
 * Convert a key array to a key set.
 */
function toKeySet<Key>(keys: Key[] | Set<Key>): Set<Key> {
  return Array.isArray(keys) ? new Set(keys) : keys
}

/*!
 * Check if two key sets are equal.
 */
function matchKeySet<Key>(a: Set<Key>, b: Set<Key>): boolean {
  return a.size === b.size && [...a].every(key => b.has(key))
}

/*!
 * Call a callback with the value and stored key set for a given key set.
 *
 * NOTE: The input key set may not be reference equal to the stored key set.
 */
function forKeySet<Key, Value, T>(
  map: Map<Set<Key>, Value>,
  keys: Key[] | Set<Key>,
  callback: (value: Value, keys: Set<Key>) => T
): T | undefined {
  const keySet = toKeySet(keys)
  for (const [myKeys, myValue] of map) {
    if (matchKeySet(keySet, myKeys)) {
      return callback(myValue, myKeys)
    }
  }
}
