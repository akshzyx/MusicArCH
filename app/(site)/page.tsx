import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
// import { era } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Era } from "@/lib/types";

export default async function Home() {
  const { data: eras, error } = await supabase.from("eras").select("*");
  if (error) {
    console.log("Supabase fetch error:", error);
    return <div>Failed to load eras</div>;
  }
  if (!eras || eras.length === 0) {
    return <div>No eras available</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Eras</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {eras.map((era: Era) => (
          <Link key={era.id} href={`/eras/${era.id}`} className="block">
            <Card className="py-4">
              <CardBody className="overflow-visible py-2">
                <Image
                  alt={era.title}
                  className="object-cover rounded-xl"
                  src={era.cover_image || "/default-image.jpg"}
                  width={270}
                  height={180}
                />
              </CardBody>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                {/* <p className="text-tiny uppercase font-bold">
                  {era.category || "Unknown"}
                </p>
                <small className="text-default-500">
                  {era.track_count || 0} Tracks
                </small> */}
                <h4 className="font-bold text-large">{era.title}</h4>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
