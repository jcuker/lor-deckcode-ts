export type FactionCode =
   | 'DE'
   | 'FR'
   | 'IO'
   | 'NX'
   | 'PZ'
   | 'SI'
   | 'BW'
   | 'SH'
   | 'MT';

export interface CardCodeAndCount {
   cardCode: string;
   count: number;
}

export type Deck = CardCodeAndCount[];
