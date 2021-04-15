import LorDeckCode from '../src/LoRDeckCode';
import { Deck } from '../src/types';

interface LoadAndParseDeckCodesTestDataResult {
   codes: string[];
   decks: Deck[];
}

export function LoadAndParseDeckCodesTestData(): LoadAndParseDeckCodesTestDataResult {
   let codes: string[] = [];
   let decks: Deck[] = [];

   // load the test data from file
   const fs = require('fs');

   try {
      const fileContent: string[] = fs
         .readFileSync('test/data/DeckCodesTestData.txt', 'utf8')
         .split('\n');

      // expect the test file to *not* be malformed
      while (fileContent && fileContent.length > 0) {
         codes.push(fileContent[0]);
         fileContent.shift();

         const newDeck: Deck = [];

         while (fileContent && fileContent[0]) {
            const parts = fileContent[0].split(':');
            newDeck.push({ count: Number(parts[0]), cardCode: parts[1] });
            fileContent.shift();
         }

         if (fileContent && fileContent.length > 0) fileContent.shift();

         decks.push(newDeck);
      }
   } catch (err) {
      console.error(err);
   }

   return { codes, decks };
}

export function verifyRehydration(d: Deck, rehydratedList: Deck): boolean {
   if (d.length !== rehydratedList.length) return false;

   for (const cd of rehydratedList) {
      let found = false;

      for (const cc of d) {
         if (cc.cardCode == cd.cardCode && cc.count == cd.count) {
            found = true;
            break;
         }
      }
      if (!found) return false;
   }

   return true;
}

export function encodeDeckAndExpectValidRehydration(deck: Deck) {
   const code = LorDeckCode.getCodeFromDeck(deck);
   const decoded = LorDeckCode.getDeckFromCode(code);
   expect(verifyRehydration(deck, decoded)).toBeTruthy();
}

/**
 * Turn a string of hexadecimal characters into an ArrayBuffer
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
   if (hex.length % 2 !== 0) {
      throw new RangeError(
         'Expected string to be an even number of characters'
      );
   }

   const view = new Uint8Array(hex.length / 2);

   for (let i = 0; i < hex.length; i += 2) {
      view[i / 2] = parseInt(hex.substring(i, i + 2), 16);
   }

   return view.buffer;
}
