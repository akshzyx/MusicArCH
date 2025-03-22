// lib/types.ts
export interface Track {
  id: string;
  title: string;
  duration: string; // e.g., "3:45"
  file: string; // Raw GitHub URL for the song
}

export interface Album {
  id: string;
  title: string;
  cover_image: string;
  release_date: string;
  tracks: Track[];
}
