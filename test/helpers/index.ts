import { CardCodeAndCount } from '../../src/types';

interface LoadAndParseDeckCodesTestDataResult {
   codes: string[];
   decks: CardCodeAndCount[][];
}

export function LoadAndParseDeckCodesTestData(): LoadAndParseDeckCodesTestDataResult {
   let codes: string[] = [];
   let decks: CardCodeAndCount[][] = [];

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

         const newDeck: CardCodeAndCount[] = [];

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

export function sortDeck(deck: CardCodeAndCount[]) {
   deck.sort((a, b) => (a.cardCode < b.cardCode ? -1 : 1));
}
