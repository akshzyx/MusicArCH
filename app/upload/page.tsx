import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Release or Track</h1>
      <UploadForm />
    </div>
  );
}
