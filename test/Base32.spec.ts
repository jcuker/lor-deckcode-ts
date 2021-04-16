// Adopted from https://github.com/scttcper/ts-base32
import { TEST_CASES } from './data/Base32TestCases';
import { base32Decode, base32Encode } from '../src/base32';
import { hexToArrayBuffer } from './helpers';

describe('base32', () => {
   describe('encode', () => {
      it.each(TEST_CASES)('should encode (%s, %s)', (variant: any, input: string, expected: string) => {
         expect(base32Encode(hexToArrayBuffer(input))).toEqual(expected);
      });

      it('should encode simple examples', () => {
         expect(base32Encode(Buffer.from('a'))).toBe('ME======');
         expect(base32Encode(Buffer.from('be'))).toBe('MJSQ====');
         expect(base32Encode(Buffer.from('bee'))).toBe('MJSWK===');
         expect(base32Encode(Buffer.from('beer'))).toBe('MJSWK4Q=');
         expect(base32Encode(Buffer.from('beers'))).toBe('MJSWK4TT');
         expect(base32Encode(Buffer.from('beers 1'))).toBe('MJSWK4TTEAYQ====');
         expect(base32Encode(Buffer.from('shockingly dismissed'))).toBe('ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE');
      });
   });

   describe('decode', () => {
      it.each(TEST_CASES)('should decode (%s, %s)', (variant: any, input: string, expected: string) => {
         expect(base32Decode(expected)).toEqual(hexToArrayBuffer(input));
      });

      it('should decode simple examples', () => {
         expect(Buffer.from(base32Decode('ME======')).toString()).toBe('a');
         expect(Buffer.from(base32Decode('MJSQ====')).toString()).toBe('be');
         expect(Buffer.from(base32Decode('ONXW4===')).toString()).toBe('son');
         expect(Buffer.from(base32Decode('MJSWK===')).toString()).toBe('bee');
         expect(Buffer.from(base32Decode('MJSWK4Q=')).toString()).toBe('beer');
         expect(Buffer.from(base32Decode('MJSWK4TT')).toString()).toBe('beers');
         expect(Buffer.from(base32Decode('mjswK4TT')).toString()).toBe('beers');
         expect(Buffer.from(base32Decode('MJSWK4TTN5XA====')).toString()).toBe('beerson');
         expect(Buffer.from(base32Decode('MJSWK4TTEAYQ====')).toString()).toBe('beers 1');
         expect(Buffer.from(base32Decode('ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE')).toString()).toBe('shockingly dismissed');
      });

      it('should be binary safe', () => {
         expect(Buffer.from(base32Decode(base32Encode(Buffer.from([0x00, 0xff, 0x88])))).toString('hex')).toBe(
            '00ff88',
         );
         const code = 'f61e1f998d69151de8334dbe753ab17ae831c13849a6aecd95d0a4e5dc25';
         const encoded = '6YPB7GMNNEKR32BTJW7HKOVRPLUDDQJYJGTK5TMV2CSOLXBF';
         expect(base32Encode(Buffer.from(code, 'hex')).toString()).toBe(encoded);
         expect(Buffer.from(base32Decode(encoded)).toString('hex')).toBe(code);
      });

      it('should error from invalid encoding characters', () => {
         expect(() => base32Decode('M😴')).toThrow('Invalid character found: ');
      });
   });
});
