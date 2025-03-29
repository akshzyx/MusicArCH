export interface Release {
  id: number;
  era_id: string;
  title: string; // Now represents the track title
  duration: string;
  file: string;
  cover_image: string;
  file_date?: string;
  leak_date?: string;
  category: "released" | "unreleased" | "stems" | "og" | "sessions";
  type?: string;
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
