import { supabase } from "@/lib/supabase";
import TrackList from "@/components/TrackList";
import { Release } from "@/lib/types";
import { Metadata } from "next";

// Define props type for Next.js App Router
type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

// Dynamic metadata for SEO
export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  return {
    title: query ? `Search "${query}" - JojiArCH` : "Search - JojiArCH",
    description: `Search results for "${query}" in Joji & his aliases discography.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() || "";

  // Handle empty query upfront
  if (!query) {
    return (
      <div className="min-h-screen p-4 text-white sm:px-6">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        <p className="text-gray-400">
          Please enter a search term to find tracks.
        </p>
      </div>
    );
  }

  // Fetch tracks with broader search (title, credit, notes)
  const { data: tracks, error } = await supabase
    .from("releases")
    .select("*")
    .or(`title.ilike.%${query}%,credit.ilike.%${query}%,notes.ilike.%${query}%`) // Multi-field search
    .order("title", { ascending: true })
    .limit(50); // Pagination: limit to 50 results

  if (error) {
    console.error("Error fetching search results:", error);
    return (
      <div className="min-h-screen p-4 text-white sm:px-6">
        <h1 className="text-2xl font-bold mb-4">
          Search Results for "{query}"
        </h1>
        <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
          <p className="text-red-300">
            Error loading search results: {error.message}. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }

  const searchResults: Release[] = tracks || [];

  return (
    <div className="min-h-screen p-4 text-white sm:px-6">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{query}" ({searchResults.length} found)
      </h1>
      {searchResults.length > 0 ? (
        <TrackList
          initialTracks={searchResults}
          sectionTracks={searchResults}
          viewMode="default"
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg">
            No tracks found matching
            <span className="font-semibold"> {query}</span>.
          </p>
          <p className="text-gray-500 mt-2">
            Try a different search term or check back later!
          </p>
        </div>
      )}
    </div>
  );
}

// Optional: Revalidation for caching
export const revalidate = 60; // Revalidate every 60 seconds
