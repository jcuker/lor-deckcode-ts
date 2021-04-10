// THIS CODE IS ADAPTED FROM https://github.com/RiotGames/LoRDeckCodes/blob/a39401113b68f436b7ac57855a68820253df9087/LoRDeckCodes/VarintTranslator.csz

export default class VarintTranslator {
   private readonly AllButMSB = 0x7f;
   private readonly JustMSB = 0x80;

   private bytes: Uint8Array;

   constructor(_bytes: ArrayBuffer | Uint8Array) {
      this.bytes = new Uint8Array(_bytes);
   }

   public get length() {
      return this.bytes.length;
   }

   public PopVarint(): number {
      let result = 0;
      let currentShift = 0;
      let bytesPopped = 0;

      for (let i = 0; i < this.bytes.length; i++) {
         bytesPopped++;
         const current = this.bytes[i] & this.AllButMSB;
         result |= current << currentShift;

         if ((this.bytes[i] & this.JustMSB) != this.JustMSB) {
            this.bytes = this.bytes.slice(bytesPopped);
            return result;
         }

         currentShift += 7;
      }

      throw 'Byte array did not contain valid varints.';
   }

   public GetVarint(value: number): Uint8Array {
      const buff = new Uint8Array(10);
      let currentIndex = 0;

      if (value == 0) return new Uint8Array([0]);

      while (value != 0) {
         let byteVal = value & this.AllButMSB;
         value >>= 7;

         if (value != 0) byteVal |= this.JustMSB;

         buff[currentIndex++] = byteVal;
      }

      return buff;
   }

   public sliceAndSet(begin: number, end?: number) {
      this.bytes = this.bytes.slice(begin, end);
   }

   public get(index: number) {
      return this.bytes[index];
   }
}
