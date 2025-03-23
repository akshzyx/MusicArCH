export interface Track {
  id: string;
  release_id: string;
  title: string;
  duration: string;
  file: string;
}

export interface Release {
  id: string;
  era_id: string;
  title: string;
  cover_image: string;
  release_date?: string;
  category: "released" | "unreleased" | "og" | "stems" | "sessions";
}

export interface Era {
  id: string;
  title: string;
  description?: string;
  cover_image: string;
  start_date?: string;
  end_date?: string;
}
