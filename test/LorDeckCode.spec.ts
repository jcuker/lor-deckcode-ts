import LorDeckCode from '../src/LoRDeckCode';
import { Deck } from '../src/types';
import {
   encodeDeckAndExpectValidRehydration,
   LoadAndParseDeckCodesTestData,
} from './helpers';

describe('LoRDeckCodes', () => {
   describe('#GetDeckFromCode', () => {
      let codes: string[] = [];
      let decks: Deck[] = [];

      beforeAll(() => {
         const {
            codes: parsedCodes,
            decks: parsedDecks,
         } = LoadAndParseDeckCodesTestData();

         codes = parsedCodes;
         decks = parsedDecks;
      });

      it('should decode each deck from the text file correctly', () => {
         for (let i = 0; i < codes.length; i++) {
            const code: string = codes[i];
            const deck: Deck = decks[i];

            const decodedDeck = LorDeckCode.getDeckFromCode(code);

            deck.forEach((cardAndCodeCount) => {
               const found = decodedDeck.find(
                  (e) =>
                     e.cardCode === cardAndCodeCount.cardCode &&
                     e.count === cardAndCodeCount.count
               );
               expect(found).toBeTruthy();
            });
         }
      });

      it('should handle short decks', () => {
         const deck: Deck = [];
         deck.push({ cardCode: '01DE002', count: 1 });

         encodeDeckAndExpectValidRehydration(deck);
      });

      it('should handle large decks', () => {
         const deck: Deck = [];

         deck.push({ cardCode: '01DE002', count: 3 });
         deck.push({ cardCode: '01DE003', count: 3 });
         deck.push({ cardCode: '01DE004', count: 3 });
         deck.push({ cardCode: '01DE005', count: 3 });
         deck.push({ cardCode: '01DE006', count: 3 });
         deck.push({ cardCode: '01DE007', count: 3 });
         deck.push({ cardCode: '01DE008', count: 3 });
         deck.push({ cardCode: '01DE009', count: 3 });
         deck.push({ cardCode: '01DE010', count: 3 });
         deck.push({ cardCode: '01DE011', count: 3 });
         deck.push({ cardCode: '01DE012', count: 3 });
         deck.push({ cardCode: '01DE013', count: 3 });
         deck.push({ cardCode: '01DE014', count: 3 });
         deck.push({ cardCode: '01DE015', count: 3 });
         deck.push({ cardCode: '01DE016', count: 3 });
         deck.push({ cardCode: '01DE017', count: 3 });
         deck.push({ cardCode: '01DE018', count: 3 });
         deck.push({ cardCode: '01DE019', count: 3 });
         deck.push({ cardCode: '01DE020', count: 3 });
         deck.push({ cardCode: '01DE021', count: 3 });

         encodeDeckAndExpectValidRehydration(deck);
      });

      it('should handle the same card 40 times', () => {
         const deck: Deck = [];
         deck.push({ cardCode: '01DE002', count: 40 });

         encodeDeckAndExpectValidRehydration(deck);
      });

      it('should handle worst case length', () => {
         const deck: Deck = [];

         deck.push({ cardCode: '01DE002', count: 4 });
         deck.push({ cardCode: '01DE003', count: 4 });
         deck.push({ cardCode: '01DE004', count: 4 });
         deck.push({ cardCode: '01DE005', count: 4 });
         deck.push({ cardCode: '01DE006', count: 4 });
         deck.push({ cardCode: '01DE007', count: 5 });
         deck.push({ cardCode: '01DE008', count: 6 });
         deck.push({ cardCode: '01DE009', count: 7 });
         deck.push({ cardCode: '01DE010', count: 8 });
         deck.push({ cardCode: '01DE011', count: 9 });
         deck.push({ cardCode: '01DE012', count: 4 });
         deck.push({ cardCode: '01DE013', count: 4 });
         deck.push({ cardCode: '01DE014', count: 4 });
         deck.push({ cardCode: '01DE015', count: 4 });
         deck.push({ cardCode: '01DE016', count: 4 });
         deck.push({ cardCode: '01DE017', count: 4 });
         deck.push({ cardCode: '01DE018', count: 4 });
         deck.push({ cardCode: '01DE019', count: 4 });
         deck.push({ cardCode: '01DE020', count: 4 });
         deck.push({ cardCode: '01DE021', count: 4 });

         encodeDeckAndExpectValidRehydration(deck);
      });

      it('should not care about the order', () => {
         const deck1: Deck = [];
         const deck2: Deck = [];
         const deck3: Deck = [];
         const deck4: Deck = [];

         deck1.push({ cardCode: '01DE002', count: 1 });
         deck1.push({ cardCode: '01DE003', count: 2 });
         deck1.push({ cardCode: '02DE003', count: 3 });
         deck2.push({ cardCode: '01DE003', count: 2 });
         deck2.push({ cardCode: '02DE003', count: 3 });
         deck2.push({ cardCode: '01DE002', count: 1 });
         deck3.push({ cardCode: '01DE002', count: 4 });
         deck3.push({ cardCode: '01DE003', count: 2 });
         deck3.push({ cardCode: '02DE003', count: 3 });
         deck4.push({ cardCode: '01DE003', count: 2 });
         deck4.push({ cardCode: '02DE003', count: 3 });
         deck4.push({ cardCode: '01DE002', count: 4 });

         const code3 = LorDeckCode.getCodeFromDeck(deck1);
         const code4 = LorDeckCode.getCodeFromDeck(deck2);
         const code1 = LorDeckCode.getCodeFromDeck(deck1);
         const code2 = LorDeckCode.getCodeFromDeck(deck2);

         expect(code1).toEqual(code2);
         expect(code3).toEqual(code4);
      });

      //importantly this order test includes more than 1 card with counts >3, which are sorted by card code and appending to the <=3 encodings.
      it('should not care about the order even if card count is greater than 3', () => {
         const deck1: Deck = [];
         const deck2: Deck = [];

         deck1.push({ cardCode: '01DE002', count: 4 });
         deck1.push({ cardCode: '01DE003', count: 2 });
         deck1.push({ cardCode: '02DE003', count: 3 });
         deck1.push({ cardCode: '01DE004', count: 5 });
         deck2.push({ cardCode: '01DE004', count: 5 });
         deck2.push({ cardCode: '01DE003', count: 2 });
         deck2.push({ cardCode: '02DE003', count: 3 });
         deck2.push({ cardCode: '01DE002', count: 4 });

         const code1 = LorDeckCode.getCodeFromDeck(deck1);
         const code2 = LorDeckCode.getCodeFromDeck(deck2);

         expect(code1).toEqual(code2);
      });

      it('should handle Bilgewater', () => {
         const deck: Deck = [];

         deck.push({ cardCode: '01DE002', count: 4 });
         deck.push({ cardCode: '02BW003', count: 2 });
         deck.push({ cardCode: '02BW010', count: 3 });
         deck.push({ cardCode: '01DE004', count: 5 });

         encodeDeckAndExpectValidRehydration(deck);
      });

      it('should handle Shurima', () => {
         const deck: Deck = [];

         deck.push({ cardCode: '01DE002', count: 4 });
         deck.push({ cardCode: '02BW003', count: 2 });
         deck.push({ cardCode: '02BW010', count: 3 });
         deck.push({ cardCode: '04SH047', count: 5 });

         encodeDeckAndExpectValidRehydration(deck);
      });

      it('should handle MtTargon', () => {
         const deck: Deck = [];

         deck.push({ cardCode: '01DE002', count: 4 });
         deck.push({ cardCode: '03MT003', count: 2 });
         deck.push({ cardCode: '03MT010', count: 3 });
         deck.push({ cardCode: '02BW004', count: 5 });

         encodeDeckAndExpectValidRehydration(deck);
      });

      it('should fail an invalid deck version', () => {
         const deck: Deck = [];

         deck.push({ cardCode: '01DE002', count: 4 });
         deck.push({ cardCode: '01DE003', count: 2 });
         deck.push({ cardCode: '02DE003', count: 3 });
         deck.push({ cardCode: '01DE004', count: 5 });

         //encodeDeckAndExpectValidRehydration(deck);
      });
   });
});
