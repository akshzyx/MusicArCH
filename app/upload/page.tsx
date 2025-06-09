"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import UploadFormVid from "@/components/UploadFormVid";

export default function UploadPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Content</h1>
      {!selectedOption ? (
        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={() => handleOptionClick("music")}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors w-full max-w-md text-center"
          >
            Upload Music
          </button>
          <button
            onClick={() => handleOptionClick("video")}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors w-full max-w-md text-center"
          >
            Upload Video
          </button>
        </div>
      ) : selectedOption === "music" ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-white text-center">
            Upload New Track (Music)
          </h2>
          <UploadForm />
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-white text-center">
            Upload New Video
          </h2>
          <UploadFormVid />
        </div>
      )}
    </div>
  );
}
