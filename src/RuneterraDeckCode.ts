import { CardCodeAndCount, FactionCode } from './types';
import { base32Encode, base32Decode } from '@ctrl/ts-base32';
import VarintTranslator from './VarintTranslator';

class LoRDeckEncoder {
   private static readonly CARD_CODE_LENGTH: number = 7;
   private static readonly MAX_KNOWN_VERSION: number = 3;
   private static readonly FACTION_CODE_TO_INT: Record<FactionCode, number> = {
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
   private static readonly INT_TO_FACTION_CODE: Record<number, FactionCode> = {
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

   public static getDeckFromCode(code: string): CardCodeAndCount[] {
      const result: CardCodeAndCount[] = [];

      const bytes = base32Decode(code);

      if (!bytes) throw 'Invalid deck code';

      const byteList = new VarintTranslator(bytes);

      //grab format and version
      const format = byteList.get(0) >> 4;
      const version = byteList.get(0) & 0xf;

      byteList.sliceAndSet(1);

      if (version > LoRDeckEncoder.MAX_KNOWN_VERSION) {
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
}

export default LoRDeckEncoder;
