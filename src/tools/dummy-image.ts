export const dummyImage = (width: number, height: number, seed?: string): string => `https://picsum.photos${seed && `/seed/${seed}`}/${width}/${height}`;
