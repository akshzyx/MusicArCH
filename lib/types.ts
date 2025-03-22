// lib/types.ts
export interface Track {
  id: string;
  title: string;
  duration: string;
  file: string;
}

export interface Album {
  id: string; // Custom ID as a string
  title: string;
  cover_image: string;
  release_date: string;
  tracks: Track[];
}
