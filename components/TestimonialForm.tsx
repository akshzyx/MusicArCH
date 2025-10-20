"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Testimonial } from "@/lib/types";
import { IconAlertCircle } from "@tabler/icons-react";

interface TestimonialFormProps {
  testimonial?: Testimonial | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function TestimonialForm({
  testimonial,
  onSaved,
  onCancel,
}: TestimonialFormProps) {
  const [quote, setQuote] = useState(testimonial?.quote || "");
  const [name, setName] = useState(testimonial?.name || "");
  const [designation, setDesignation] = useState(
    testimonial?.designation || ""
  );
  const [imageUrl, setImageUrl] = useState(testimonial?.image_url || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (testimonial) {
        // Update existing testimonial
        const { error } = await supabase
          .from("testimonials")
          .update({
            quote,
            name,
            designation,
            image_url: imageUrl,
            updated_at: new Date(),
          })
          .eq("id", testimonial.id);

        if (error) throw error;
      } else {
        // Add new testimonial (set sort_order to appear first)
        const { data: existing } = await supabase
          .from("testimonials")
          .select("sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(1);

        const minSortOrder = existing?.[0]?.sort_order ?? 1;
        const newSortOrder = minSortOrder <= 1 ? 0 : minSortOrder - 1;

        const { error } = await supabase.from("testimonials").insert({
          quote,
          name,
          designation,
          image_url: imageUrl,
          is_active: true,
          sort_order: newSortOrder,
        });

        if (error) throw error;
      }

      onSaved();
    } catch (err) {
      setError((err as Error).message);
      console.error("Form submission error:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-gray-900 rounded-xl"
    >
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">
          <IconAlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {/* Quote Field */}
      <div>
        <label
          htmlFor="quote"
          className="block text-xs font-medium text-gray-200 mb-1"
        >
          Testimonial Quote
        </label>
        <textarea
          id="quote"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Enter the testimonial quote..."
          className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 placeholder-gray-500 text-sm transition-all duration-200"
          rows={3}
          required
        />
      </div>

      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-xs font-medium text-gray-200 mb-1"
        >
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="eg - 40 MIllion streams"
          className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 placeholder-gray-500 text-sm transition-all duration-200"
          required
        />
      </div>

      {/* Designation Field */}
      <div>
        <label
          htmlFor="designation"
          className="block text-xs font-medium text-gray-200 mb-1"
        >
          Designation
        </label>
        <input
          id="designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="eg - Joji"
          className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 placeholder-gray-500 text-sm transition-all duration-200"
          required
        />
      </div>

      {/* Image URL Field */}
      <div>
        <label
          htmlFor="imageUrl"
          className="block text-xs font-medium text-gray-200 mb-1"
        >
          Image URL
        </label>
        <input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
          className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 placeholder-gray-500 text-sm transition-all duration-200"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-3">
        <button
          type="submit"
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {testimonial ? "Update" : "Add"} Testimonial
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
