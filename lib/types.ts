export interface JsonFolder {
  [key: string]:
    | JsonFolder
    | {
        url: string;
        duration: string;
        size: number;
        type: string;
        sha: string;
      };
}

export interface Release {
  id: number;
  era_id: string;
  title: string; // Now represents the track title
  duration: string;
  file: string;
  cover_image: string;
  og_filename?: string;
  file_date?: string;
  leak_date?: string;
  aka?: string;
  category: "released" | "unreleased" | "stems";
  type?: string;
  track_type?: string;
  credit?: string;
  multi_files?: JsonFolder;
  available?:
    | "Confirmed"
    | "Partial"
    | "Snippet"
    | "Full"
    | "Rumored"
    | "OG File";
  quality?:
    | "Not Available"
    | "High Quality"
    | "Recording"
    | "Lossless"
    | "Low Quality"
    | "CD Quality";
  notes?: string;
}

export interface Era {
  id: string;
  title: string;
  description?: string;
  cover_image: string;
  start_date?: string;
  end_date?: string;
  album_rank: number;
}
