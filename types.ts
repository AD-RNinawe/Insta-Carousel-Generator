
export type SlideContent =
  | { type: 'cover'; imageUrl: string; title: string }
  | { type: 'prose'; text: string };
