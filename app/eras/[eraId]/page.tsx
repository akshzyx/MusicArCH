import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { Suspense } from "react";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EraContentClient from "@/components/EraContentClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eraId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: era, error } = await supabase
    .from("eras")
    .select("title")
    .eq("id", resolvedParams.eraId)
    .single();

  if (error || !era) {
    return {
      title: "Era Not Found - JojiArCH",
    };
  }

  return {
    title: `${era.title} - JojiArCH`,
  };
}

async function EraContent({ eraId }: { eraId: string }) {
  const [
    { data: era, error: eraError },
    { data: releases, error: releasesError },
  ] = await Promise.all([
    supabase.from("eras").select("*").eq("id", eraId).single(),
    supabase.from("releases").select("*").eq("era_id", eraId),
  ]);

  if (eraError || releasesError || !era) {
    return (
      <div className="container mx-auto py-8 text-white min-h-screen">
        Era not found
        <p>Debug Info:</p>
        <pre>ID: {eraId}</pre>
        <pre>Era Error: {JSON.stringify(eraError, null, 2)}</pre>
        <pre>Releases Error: {JSON.stringify(releasesError, null, 2)}</pre>
      </div>
    );
  }

  const categories = {
    released: releases.filter((r) => r.category === "released"),
    unreleased: releases.filter((r) => r.category === "unreleased"),
    stems: releases.filter((r) => r.category === "stems"),
  };

  const tabOrder = ["released", "unreleased", "stems"];
  const firstTabWithTracks =
    tabOrder.find(
      (category) => categories[category as keyof typeof categories].length > 0
    ) || "released";

  const releasesWithLikes = releases.map((release) => ({
    ...release,
    likes: Math.floor(Math.random() * 5000) + 4000,
  }));

  return (
    <EraContentClient
      era={era}
      releasesWithLikes={releasesWithLikes}
      categories={categories}
      tabOrder={tabOrder}
      firstTabWithTracks={firstTabWithTracks}
    />
  );
}

interface PageProps {
  params: Promise<{ eraId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EraPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-white">
          <FontAwesomeIcon
            icon={faSpinner}
            spinPulse
            className="text-teal-400 text-4xl"
          />
        </div>
      }
    >
      <EraContent eraId={resolvedParams.eraId} />
    </Suspense>
  );
}
