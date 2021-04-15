// This is adopted from https://github.com/RiotGames/LoRDeckCodes
// This was written to have 0 dependencies, have Typescript support, and to stay as close to the source code as possible

import { CardCodeAndCount, Deck, FactionCode } from './types';
import VarintTranslator from './VarintTranslator';
import { mergeUint8Arrays, sortDeck } from './helpers';
import { base32Decode, base32Encode } from './base32';

class LorDeckCode {
   private static readonly CARD_CODE_LENGTH: number = 7;
   private static readonly MAX_KNOWN_VERSION: number = 3;

   private static readonly FACTION_CODE_TO_INT: Record<
      FactionCode | string,
      number
   > = {
      DE: 0,
      FR: 1,
      IO: 2,
      NX: 3,
      PZ: 4,
      SI: 5,
      BW: 6,
      SH: 7,
      MT: 9,
   };

   private static readonly INT_TO_FACTION_CODE: Record<
      number,
      FactionCode | string
   > = {
      0: 'DE',
      1: 'FR',
      2: 'IO',
      3: 'NX',
      4: 'PZ',
      5: 'SI',
      6: 'BW',
      7: 'SH',
      9: 'MT',
   };

   public static getDeckFromCode(code: string): Deck {
      const result: Deck = [];

      const bytes = base32Decode(code);

      if (!bytes) throw 'Invalid deck code';

      const byteList = new VarintTranslator(bytes);

      // grab format and version
      // This is actually unused in the C# code as of version 3 (March 3rd 2021)
      const format = byteList.get(0) >> 4;
      const version = byteList.get(0) & 0xf;

      byteList.sliceAndSet(1);

      if (version > LorDeckCode.MAX_KNOWN_VERSION) {
         throw 'The provided code requires a higher version of this library; please update.';
      }

      for (let i = 3; i > 0; i--) {
         const numGroupOfs = byteList.PopVarint();

         for (let j = 0; j < numGroupOfs; j++) {
            const numOfsInThisGroup = byteList.PopVarint();
            const set = byteList.PopVarint();
            const faction = byteList.PopVarint();

            for (let k = 0; k < numOfsInThisGroup; k++) {
               const card = byteList.PopVarint();

               const setString = set.toString().padStart(2, '0');
               const factionString = this.INT_TO_FACTION_CODE[faction];
               const cardString = card.toString().padStart(3, '0');

               const newEntry: CardCodeAndCount = {
                  cardCode: setString + factionString + cardString,
                  count: i,
               };

               result.push(newEntry);
            }
         }
      }

      //the remainder of the deck code is comprised of entries for cards with counts >= 4
      //this will only happen in Limited and special game modes.
      //the encoding is simply [count] [cardcode]
      while (byteList.length > 0) {
         const fourPlusCount = byteList.PopVarint();
         const fourPlusSet = byteList.PopVarint();
         const fourPlusFaction = byteList.PopVarint();
         const fourPlusNumber = byteList.PopVarint();

         const fourPlusSetString = fourPlusSet.toString().padStart(2, '0');
         const fourPlusFactionString = this.INT_TO_FACTION_CODE[
            fourPlusFaction
         ];
         const fourPlusNumberString = fourPlusNumber
            .toString()
            .padStart(3, '0');

         const newEntry: CardCodeAndCount = {
            cardCode:
               fourPlusSetString + fourPlusFactionString + fourPlusNumberString,
            count: fourPlusCount,
         };

         result.push(newEntry);
      }

      return result;
   }

   public static getCodeFromDeck(deck: Deck) {
      const bytes = this.GetDeckCodeBytes(deck);
      const result = base32Encode(bytes);

      return result;
   }

   private static GetDeckCodeBytes(deck: Deck): Uint8Array {
      if (!LorDeckCode.ValidCardCodesAndCounts(deck))
         throw 'The provided deck contains invalid card codes.';

      const formatAndVersion = 19; //i.e. 00010011
      let result = new Uint8Array([formatAndVersion]);

      const of3: Deck = [];
      const of2: Deck = [];
      const of1: Deck = [];
      let ofN: Deck = [];

      for (const ccc of deck) {
         if (ccc.count == 3) of3.push(ccc);
         else if (ccc.count == 2) of2.push(ccc);
         else if (ccc.count == 1) of1.push(ccc);
         else if (ccc.count < 1)
            throw 'Invalid count of ' + ccc.count + ' for card ' + ccc.cardCode;
         else ofN.push(ccc);
      }

      //build the lists of set and faction combinations within the groups of similar card counts
      let groupedOf3s: Deck[] = LorDeckCode.GetGroupedOfs(of3);
      let groupedOf2s: Deck[] = LorDeckCode.GetGroupedOfs(of2);
      let groupedOf1s: Deck[] = LorDeckCode.GetGroupedOfs(of1);

      //to ensure that the same decklist in any order produces the same code, do some sorting
      groupedOf3s = LorDeckCode.SortGroupOf(groupedOf3s);
      groupedOf2s = LorDeckCode.SortGroupOf(groupedOf2s);
      groupedOf1s = LorDeckCode.SortGroupOf(groupedOf1s);

      //Nofs (since rare) are simply sorted by the card code - there's no optimiziation based upon the card count
      sortDeck(ofN);

      const encodedGroupedOf3s = LorDeckCode.EncodeGroupOf(groupedOf3s);
      const encodedGroupedOf2s = LorDeckCode.EncodeGroupOf(groupedOf2s);
      const encodedGroupedOf1s = LorDeckCode.EncodeGroupOf(groupedOf1s);
      const encodedOfN = LorDeckCode.EncodeNOfs(ofN);

      //Encode
      result = mergeUint8Arrays(result, encodedGroupedOf3s);
      result = mergeUint8Arrays(result, encodedGroupedOf2s);
      result = mergeUint8Arrays(result, encodedGroupedOf1s);

      //Cards with 4+ counts are handled differently: simply [count] [card code] for each
      result = mergeUint8Arrays(result, encodedOfN);

      return result;
   }

   private static GetGroupedOfs(list: Deck): Deck[] {
      const result: Deck[] = [];
      while (list.length > 0) {
         const currentSet: Deck = [];

         //get info from first
         const firstCardCode = list[0].cardCode;
         const { set, faction, number } = LorDeckCode.ParseCardCode(
            firstCardCode
         );

         //now add that to our new list, remove from old
         currentSet.push(list[0]);
         list.shift();

         //sweep through rest of list and grab entries that should live with our first one.
         //matching means same set and faction - we are already assured the count matches from previous grouping.
         for (let i = list.length - 1; i >= 0; i--) {
            const currentCardCode = list[i].cardCode;
            const currentSetNumber = Number(currentCardCode.substring(0, 2));
            const currentFactionCode = currentCardCode.substring(2, 4);

            if (currentSetNumber === set && currentFactionCode === faction) {
               currentSet.push(list[i]);
               list.splice(i, 1);
            }
         }
         result.push(currentSet);
      }
      return result;
   }

   private static EncodeNOfs(nOfs: Deck): Uint8Array {
      let bytes: Uint8Array = new Uint8Array();

      for (const ccc of nOfs) {
         bytes = mergeUint8Arrays(bytes, VarintTranslator.GetVarint(ccc.count));

         const { set, faction, number } = LorDeckCode.ParseCardCode(
            ccc.cardCode
         );
         const factionNumber = this.FACTION_CODE_TO_INT[faction];

         bytes = mergeUint8Arrays(bytes, VarintTranslator.GetVarint(set));
         bytes = mergeUint8Arrays(
            bytes,
            VarintTranslator.GetVarint(factionNumber)
         );
         bytes = mergeUint8Arrays(bytes, VarintTranslator.GetVarint(number));
      }

      return bytes;
   }

   //The sorting convention of this encoding scheme is
   //First by the number of set/faction combinations in each top-level list
   //Second by the alphanumeric order of the card codes within those lists.
   private static SortGroupOf(groupOf: Deck[]): Deck[] {
      const sorted = groupOf.sort((a, b) => (a.length < b.length ? -1 : 1));

      sorted.forEach((deck) => sortDeck(deck));

      return sorted;
   }

   private static EncodeGroupOf(groupOf: Deck[]): Uint8Array {
      let bytes: Uint8Array = new Uint8Array([]);

      bytes = mergeUint8Arrays(
         bytes,
         VarintTranslator.GetVarint(groupOf.length)
      );

      for (const currentList of groupOf) {
         //how many cards in current group?
         bytes = mergeUint8Arrays(
            bytes,
            VarintTranslator.GetVarint(currentList.length)
         );

         //what is this group, as identified by a set and faction pair
         const currentCardCode = currentList[0].cardCode;
         const { set, faction } = LorDeckCode.ParseCardCode(currentCardCode);
         const currentFactionNumber = this.FACTION_CODE_TO_INT[faction];
         bytes = mergeUint8Arrays(bytes, VarintTranslator.GetVarint(set));
         bytes = mergeUint8Arrays(
            bytes,
            VarintTranslator.GetVarint(currentFactionNumber)
         );

         //what are the cards, as identified by the third section of card code only now, within this group?
         for (const cd of currentList) {
            const code = cd.cardCode;
            const sequenceNumber = Number(code.substring(4, 7));
            bytes = mergeUint8Arrays(
               bytes,
               VarintTranslator.GetVarint(sequenceNumber)
            );
         }
      }

      return bytes;
   }

   private static ParseCardCode(code: string) {
      return {
         set: Number(code.substring(0, 2)),
         faction: code.substring(2, 4),
         number: Number(code.substring(4, 7)),
      };
   }

   public static ValidCardCodesAndCounts(deck: Deck): boolean {
      for (const ccc of deck) {
         if (ccc.cardCode.length != LorDeckCode.CARD_CODE_LENGTH) return false;

         if (isNaN(Number(ccc.cardCode.substring(0, 2)))) return false;

         const faction = ccc.cardCode.substring(2, 4) as FactionCode;
         if (this.FACTION_CODE_TO_INT[faction] === undefined) return false;

         if (isNaN(Number(ccc.cardCode.substring(4, 7)))) return false;

         if (ccc.count < 1) return false;
      }
      return true;
   }
}

export default LorDeckCode;
