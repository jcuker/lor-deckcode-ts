# LoR Deckcode

This is a TypeScript port of the Legends of Runeterra deck encoder/decoder. The goal of this project is to keep up-to-date with Riot's [Implementation](https://github.com/RiotGames/LoRDeckCodes), stay as close to the original source code as possible, and use zero external runtime dependencies.

## Installation

```
npm i lor-deckcodes-ts
```
## Usage

```ts
import { 
   getCodeFromDeck, 
   getDeckFromCode, 
   CardCodeAndCount, 
   Deck 
} from 'lor-deckcodes-ts';

// convert a deck code into a Deck / CardCodeAndCount[]
const code: string =
   'CEBQGAIFAMJC6BABAMCBGFJUAICAGAQRAICACBIWDQOS4AIBAM4AEAIEAUIQEBADAEHQ';

const decodedDeck: Deck = getDeckFromCode(code);

/* Expected Output 
[
  {
    "cardCode": "01SI003",
    "count": 3
  },
  {
    "cardCode": "01SI018",
    "count": 3
  },
  {
    "cardCode": "01SI047",
    "count": 3
  },
  {
    "cardCode": "01NX004",
    "count": 3
  },
  {
    "cardCode": "01NX019",
    "count": 3
  },
  {
    "cardCode": "01NX021",
    "count": 3
  },
  {
    "cardCode": "01NX052",
    "count": 3
  },
  {
    "cardCode": "04NX002",
    "count": 3
  },
  {
    "cardCode": "04NX017",
    "count": 3
  },
  {
    "cardCode": "01SI022",
    "count": 2
  },
  {
    "cardCode": "01SI028",
    "count": 2
  },
  {
    "cardCode": "01SI029",
    "count": 2
  },
  {
    "cardCode": "01SI046",
    "count": 2
  },
  {
    "cardCode": "01NX056",
    "count": 2
  },
  {
    "cardCode": "04SI017",
    "count": 1
  },
  {
    "cardCode": "04NX001",
    "count": 1
  },
  {
    "cardCode": "04NX015",
    "count": 1
  }
]
*/

// Convert a Deck / CardCodeAndCount[] into a deck code
const deck: Deck = [
   {
      cardCode: '03MT009',
      count: 3,
   },
   {
      cardCode: '03MT027',
      count: 3,
   },
   {
      cardCode: '03MT035',
      count: 3,
   },
   {
      cardCode: '03MT040',
      count: 3,
   },
   {
      cardCode: '03MT041',
      count: 3,
   },
   {
      cardCode: '03MT051',
      count: 3,
   },
   {
      cardCode: '03MT092',
      count: 3,
   },
   {
      cardCode: '02IO003',
      count: 3,
   },
   {
      cardCode: '02IO006',
      count: 3,
   },
   {
      cardCode: '03IO020',
      count: 2,
   },
   {
      cardCode: '03MT019',
      count: 2,
   },
   {
      cardCode: '03MT085',
      count: 2,
   },
   {
      cardCode: '01IO049',
      count: 2,
   },
   {
      cardCode: '02IO009',
      count: 2,
   },
   {
      cardCode: '03MT086',
      count: 1,
   },
   {
      cardCode: '02IO005',
      count: 1,
   },
   {
      cardCode: '02IO008',
      count: 1,
   },
];

const deckCode: string = getCodeFromDeck(deck);

/* expected output
CEBAOAYJBENSGKBJGNOAEAQCAMDAIAIDAIKAEAYJCNKQCAICGEAQEAQJAIAQGCKWAIBAEBII
*/
```
