// THIS CODE IS ADAPTED FROM https://github.com/RiotGames/LoRDeckCodes/blob/a39401113b68f436b7ac57855a68820253df9087/LoRDeckCodes/VarintTranslator.cs

// The reason these methods are not static all the way is that TypedArrays cannot be edited in place (like splicing)
// The only method they have to edit their content is slicing which does not provide a way to statically save changes
// See: https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABAZwDYwgUwBQEMBO+AXIrmAJ4DaAugJSIDeAsAFCKmGIC8H+AdGgw4AjLQDcrAL6tWoSLAQoADuix5CJMlTqNW7Avm68BKodlESW0lrPDR4SAEbkomAApwl64ogCqMMCgADgBBQlxyemY2XiMDAVURcSkZFgB6NMQAFThEJXw4ADdMRAgEZChETNRMSoATOExkRDA4SoBbXChXfFYysArS8qgw-AijSmEAGgAmKYBmKYAWKYBWakt+wa2of0DR8Z4wTAB3PwDgg-JsHavkmxYayoNDxEnZheW1jdYnxBALlcjMczntLuFrrcIfdWII1FCxpFNuU4DU+Kg4ABzRA3YZ3Syw0zwvHQ5EDVGYdFYnEIiIwljOVweLw7MH4vootEY7G4ga7QGk1JwnAvJEc8lc6neOkEljIIkiwUsLYUqk80X0xnuTzYAH7JUqyU8vUjUlAA
export default class VarintTranslator {
   private static readonly AllButMSB = 0x7f;
   private static readonly JustMSB = 0x80;

   private bytes: Uint8Array;

   constructor(_bytes: ArrayBuffer | Uint8Array) {
      this.bytes = new Uint8Array(_bytes);
   }

   public get length(): number {
      return this.bytes.length;
   }

   public PopVarint(): number {
      let result = 0;
      let currentShift = 0;
      let bytesPopped = 0;

      for (let i = 0; i < this.bytes.length; i++) {
         bytesPopped++;

         const current = this.bytes[i] & VarintTranslator.AllButMSB;
         result |= current << currentShift;

         if (
            (this.bytes[i] & VarintTranslator.JustMSB) !=
            VarintTranslator.JustMSB
         ) {
            this.bytes = this.bytes.slice(bytesPopped);
            return result;
         }

         currentShift += 7;
      }

      throw 'Byte array did not contain valid varints.';
   }

   public sliceAndSet(begin: number, end?: number): void {
      this.bytes = this.bytes.slice(begin, end);
   }

   public get(index: number): number {
      return this.bytes[index];
   }

   // Given a number, return that number in varint format
   public static GetVarint(value: number): Uint8Array {
      const buff = new Uint8Array(10);
      let currentIndex = 0;

      if (value == 0) return new Uint8Array([0]);

      while (value !== 0) {
         // bound from 0 - 127
         let byteVal = value & this.AllButMSB;

         // modulo 127
         value >>= 7;

         // if the value was above 127, set the value to be 128
         if (value != 0) byteVal |= this.JustMSB;

         buff[currentIndex++] = byteVal;
      }

      return buff.slice(0, currentIndex);
   }
}
