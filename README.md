# compound-key-map

A map type which accepts compound keys, meaning keys which are arrays or sets.
Arrays are treated as unordered, so `[1, 2]` is the same as `[2, 1]`.

## Install

```sh
npm install compound-key-map
```

## Usage

```ts
import CompoundKeyMap from 'compound-key-map'

enum Relationship {
  Friends = 'friends',
  Enemies = 'enemies'
}

// Same iterable construction as Map<Key, Value>, but with compound keys.
// Accepts both arrays and sets as keys, arrays will be converted to sets.
const relationships = new CompoundKeyMap<string, Relationship>([
  [['alice', 'bob'], Relationship.Friends],
  [['bob', 'carol'], Relationship.Friends],
  [['alice', 'carol'], Relationship.Enemies]
])

// Get a value by compound key.
const carolLikesBob = relationships.get(['bob', 'alice']) === Relationship.Friends
  ? Relationship.Enemies
  : Relationship.Friends

// Set a value by compound key.
relationships.set(['bob', 'carol'], carolLikesBob)

// Check presence of an entry for the compound key.
if (relationships.has(['bob', 'carol'])) {
  relationships.set(['alice', 'carol'], Relationship.Enemies)
  relationships.delete(['bob', 'carol'])
}
```
