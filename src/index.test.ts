import { ok, strictEqual, deepStrictEqual } from 'node:assert'
import test from 'node:test'

import CompoundKeyMap from './index.js'

test('constructs with initial value list', () => {
  const map = new CompoundKeyMap<string, string>([
    // Supports array keys (which become unordered)
    [['foo', 'bar'], 'baz'],
    // Supports set keys
    [new Set(['bax', 'bix']), 'bux']
  ])

  // Has expected size
  strictEqual(map.size, 2, 'has expected size')

  // Check presence of initial values, and unorderedness
  const found = [
    map.get(new Set(['foo', 'bar'])),
    map.get(['bix', 'bax'])
  ]

  const expected = [
    'baz',
    'bux'
  ]

  deepStrictEqual(found, expected, 'gets expected values')
})

test('set and get values', () => {
  const map = new CompoundKeyMap<number, number>()

  // Support setting with both array and set keys
  map.set([1, 2], 3)
  map.set(new Set([4, 5]), 6)

  // Retrieval should also support both array and set keys and be unordered
  const found = [
    map.get(new Set([2, 1])),
    map.get([5, 4])
  ]
  const expected = [ 3, 6 ]

  deepStrictEqual(found, expected, 'gets expected values')

  // Unset keys should return undefined
  strictEqual(map.get([7, 8]), undefined, 'no value for unset key')
})

test('check presence with has', () => {
  const map = new CompoundKeyMap<number, number>([
    [[1, 2], 3]
  ])

  // Should support both array and set keys
  strictEqual(map.has([2, 1]), true, 'finds by array form, unordered')
  strictEqual(map.has(new Set([1, 2])), true, 'finds by set form')
  strictEqual(map.has([3, 4]), false, 'does not find unset key')
})

test('can delete entries', () => {
  const map = new CompoundKeyMap<number, number>([
    [[1, 2], 3]
  ])

  // Should delete entries
  strictEqual(map.delete([2, 1]), true, 'deletes by array form, unordered')
  strictEqual(map.has([2, 1]), false, 'entry no longer present after delete')

  // Returns false if entry doesn't exist
  strictEqual(map.delete([2, 1]), false, 'informs when entry does not exist')
})

test('can clear map', () => {
  const map = new CompoundKeyMap<number, number>([
    [[1, 2], 3]
  ])

  // Clears map entries
  map.clear()
  strictEqual(map.size, 0, 'is empty after clear')
})

test('iterators', async (t) => {
  function matchKeySet<Key>(a: Set<Key>, b: Set<Key>): boolean {
    return a.size === b.size && [...a].every(key => b.has(key))
  }

  await t.test('keys', () => {
    const map = new CompoundKeyMap<number, number>([
      [[1, 2], 3],
      [[4, 5], 6]
    ])

    // Produces a key iterator of the expected length
    const keys = [...map.keys()]
    strictEqual(keys.length, 2, 'has expected number of keys')

    // Order and content of keys matches expectation
    const expectedKeys = [ [1, 2], [4, 5] ]
    const found = keys.map((key, i) => {
      return matchKeySet(key, new Set(expectedKeys[i]))
    })
    deepStrictEqual(found, [true, true], 'keys match expected order and content')
  })

  await t.test('values', () => {
    const map = new CompoundKeyMap<number, number>([
      [[1, 2], 3],
      [[4, 5], 6]
    ])

    // Produces a value iterator of the expected length
    const values = [...map.values()]
    strictEqual(values.length, 2, 'has expected number of values')

    // Order and content of values matches expectation
    deepStrictEqual(values, [3, 6], 'values match expected order and content')
  })

  await t.test('entries', () => {
    const map = new CompoundKeyMap<number, number>([
      [[1, 2], 3],
      [[4, 5], 6]
    ])

    // Produces an entry iterator of the expected length
    const entries = [...map.entries()]
    strictEqual(entries.length, 2, 'has expected number of entries')

    // Order and content of entries matches expectation
    const expectedKeys = [ [1, 2], [4, 5] ]
    const found = entries.map(([key, value], i) => {
      return [ matchKeySet(key, new Set(expectedKeys[i])), value ]
    })
    deepStrictEqual(found, [
      [true, 3],
      [true, 6]
    ], 'entries match expected order and content')
  })

  await t.test('Symbol.iterator', () => {
    const map = new CompoundKeyMap<number, number>([
      [[1, 2], 3],
      [[4, 5], 6]
    ])

    // Produces an entry iterator of the expected length
    const entries = [...map]
    strictEqual(entries.length, 2, 'has expected number of entries')

    // Order and content of entries matches expectation
    const expectedKeys = [ [1, 2], [4, 5] ]
    const found = entries.map(([key, value], i) => {
      return [ matchKeySet(key, new Set(expectedKeys[i])), value ]
    })
    deepStrictEqual(found, [
      [true, 3],
      [true, 6]
    ], 'entries match expected order and content')
  })

  await t.test('forEach', () => {
    const map = new CompoundKeyMap<number, number>([
      [[1, 2], 3],
      [[4, 5], 6]
    ])

    // Loops with expected keys and values in expected order
    const expectedKeys = [ [1, 2], [4, 5] ]
    const expectedValues = [ 3, 6 ]
    let times = 0

    // Run and test loop iterations
    map.forEach(function (value, key, m) {
      strictEqual(this, 'foo', 'uses given thisArg')
      strictEqual(m, map, 'passes through expected map reference')
      ok(matchKeySet(key, new Set(expectedKeys[times])), 'has expected key')
      strictEqual(value, expectedValues[times], 'has expected value')
      times++
    }, 'foo')

    // Should have run the expected number of times
    strictEqual(times, 2)
  })
})
