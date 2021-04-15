import { Deck } from './types';

export function sortDeck(deck: Deck) {
   deck.sort((a, b) => (a.cardCode < b.cardCode ? -1 : 1));
}

export function mergeUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
   const merged = new Uint8Array(a.length + b.length);

   merged.set(a);
   merged.set(b, a.length);

   return merged;
}
