import { supabase } from "@/lib/supabase";
import TrackList from "@/components/TrackList"; // Adjust path as needed
import { Release } from "@/lib/types";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  // Fetch tracks from Supabase matching the query
  const { data: tracks, error } = await supabase
    .from("releases")
    .select("*")
    .ilike("title", `%${query}%`)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching search results:", error);
    return (
      <div className="p-4 text-white sm:px-6">
        <h1 className="text-2xl font-bold">Search Results</h1>
        <p>Error loading search results. Please try again.</p>
      </div>
    );
  }

  const searchResults: Release[] = tracks || [];

  return (
    <div className="p-4 text-white sm:px-6">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      {searchResults.length > 0 ? (
        <TrackList
          initialTracks={searchResults}
          sectionTracks={searchResults}
          viewMode="default"
        />
      ) : (
        <p>No tracks found matching your search.</p>
      )}
    </div>
  );
}
