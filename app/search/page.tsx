import { supabase } from "@/lib/supabase";
import TrackList from "@/components/TrackList"; // Adjust path as needed
import { Release } from "@/lib/types";

// Define the props type explicitly to satisfy Next.js App Router
type SearchPageProps = {
  searchParams: Promise<{ q?: string }>; // searchParams is a Promise
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await the searchParams promise to get the actual query object
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

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
      <h1 className="text-2xl font-bold mb-4">
        Search Results for &quot;{query}&quot;
      </h1>
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
