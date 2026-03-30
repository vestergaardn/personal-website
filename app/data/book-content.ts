export interface BookPageData {
  pageNumber: number;
  chapterHeading?: string;
  body: string[];
  dropCap?: boolean;
}

export const bookContent: BookPageData[] = [
  {
    pageNumber: 7,
    chapterHeading: "Chapter IV",
    dropCap: true,
    body: [
      "Morning came differently after that. The sunlight that poured through the tall windows seemed thicker somehow, more golden, as if it too had read the mysterious book and been transformed by the experience.",
      "The librarian arrived early, as she always did, but today she paused at the threshold. The door, which she had opened ten thousand times before, felt different beneath her hand. The wood grain seemed to pulse with a rhythm she could almost decipher.",
    ],
  },
  {
    pageNumber: 8,
    body: [
      "The green book was still there on the center table, exactly where she had left it. But now there were others \u2014 three more volumes, each bound in a different color. One was the deep red of autumn leaves, another the blue of a winter sky just before dawn, and the third was black as a moonless night.",
      "She understood then that the first book had been a key, and that she had unwittingly turned it in a lock she hadn\u2019t known existed. Whatever door had opened, it would not be easily closed again.",
      "With steady hands and a racing heart, she reached for the red volume.",
    ],
  },
  {
    pageNumber: 9,
    chapterHeading: "Chapter V",
    dropCap: true,
    body: [
      "The red book burned. Not with fire, but with memory. Each page held not words but sensations \u2014 the weight of a grandmother\u2019s hand on a child\u2019s shoulder, the taste of rain in a city that no longer exists, the sound of a voice saying a name that had been forgotten for three hundred years.",
      "She read it in an hour and lived a thousand lives. When she set it down, tears streaked her face, though she could not have said whether they were tears of joy or sorrow. Perhaps they were both.",
    ],
  },
  {
    pageNumber: 10,
    body: [
      "The blue book was different. It was cold and precise, filled with equations and diagrams that seemed to describe the architecture of thought itself. Reading it was like climbing a mountain made of crystal \u2014 every step revealed new vistas of terrifying clarity.",
      "She saved the black book for last. It sat on the table like a held breath, waiting. She knew, with a certainty that bypassed reason entirely, that once she opened it, the library \u2014 and perhaps the world beyond its walls \u2014 would never be the same.",
      "The clock on the wall had stopped. The dust motes hung motionless. Even the sunlight seemed to pause, waiting for her decision.",
    ],
  },
];
