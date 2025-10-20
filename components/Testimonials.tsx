"use client";

import { useEffect, useState } from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { supabase } from "@/lib/supabase";
import { Testimonial } from "@/lib/types";
import { getCachedData } from "@/lib/dataCache";
import { useUser } from "@clerk/nextjs";
import { TestimonialForm } from "./TestimonialForm";

interface TestimonialsProps {
  autoplay?: boolean;
}

export function TestimonialsClient({ autoplay = true }: TestimonialsProps) {
  const { user, isSignedIn } = useUser();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [currentTestimonialId, setCurrentTestimonialId] = useState<
    string | null
  >(null);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      try {
        const cached = await getCachedData();
        if (cached.testimonials.length > 0) {
          setTestimonials(cached.testimonials.filter((t) => t.is_active));
        }

        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        setTestimonials(data || []);
        setCurrentTestimonialId(data?.[0]?.id || null);
        console.log("Fetched testimonials:", data);
        console.log("Initial currentTestimonialId:", data?.[0]?.id);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [isAdmin]);

  // Handle save (add/edit)
  const handleTestimonialSaved = async () => {
    setOpenDialog(false);
    setEditingTestimonial(null);
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data) {
      setTestimonials(data);
      setCurrentTestimonialId(data[0]?.id || null);
      console.log("Updated testimonials after save:", data);
      console.log("Updated currentTestimonialId:", data[0]?.id);
    }
  };

  // Handle edit
  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setOpenDialog(true);
  };

  // Handle carousel testimonial change
  const handleTestimonialChange = (index: number) => {
    if (testimonials[index]) {
      // Defer state update to avoid rendering phase conflict
      setTimeout(() => {
        setCurrentTestimonialId(testimonials[index].id);
        console.log(
          "Carousel changed to index:",
          index,
          "ID:",
          testimonials[index].id,
          "Name:",
          testimonials[index].name
        );
      }, 0);
    } else {
      console.log("No testimonial at index:", index);
      setTimeout(() => {
        setCurrentTestimonialId(null);
      }, 0);
    }
  };

  // Soft delete (set is_active = false)
  const handleSoftDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `🗑️ SOFT DELETE\n\nThis will hide the testimonial '${name}' from the site but keep it in the database.\nYou can restore it later.\n\nProceed?`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
      alert(`✅ Testimonial '${name}' hidden from site!`);
      handleTestimonialSaved();
    } catch (error) {
      alert("Delete failed: " + (error as Error).message);
      console.error("Soft delete error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-white">
        Loading testimonials...
      </div>
    );
  }

  // Handle empty testimonials
  if (testimonials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white">
        <p>No active testimonials available.</p>
        {isAdmin && (
          <button
            onClick={() => setOpenDialog(true)}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md"
          >
            + Add New Testimonial
          </button>
        )}
      </div>
    );
  }

  const currentTestimonial =
    testimonials.find((t) => t.id === currentTestimonialId) || testimonials[0]; // Fallback to first
  const formattedTestimonials = testimonials.map((t) => ({
    quote: t.quote,
    name: t.name,
    designation: t.designation,
    src: t.image_url,
    id: t.id, // Include id for AnimatedTestimonials
  }));

  return (
    <div className="relative mb-8">
      {/* Add New Button */}
      {isAdmin && (
        <div className="absolute top-0 right-0 mt-4 mr-4">
          <button
            onClick={() => setOpenDialog(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md"
          >
            + Add New Testimonial
          </button>
        </div>
      )}

      {/* Animated Testimonials */}
      <AnimatedTestimonials
        testimonials={formattedTestimonials}
        autoplay={autoplay}
        onChange={handleTestimonialChange}
      />

      {/* Edit/Delete Buttons */}
      {isAdmin && currentTestimonial && (
        <div className="absolute bottom-0 right-0 flex gap-2 bg-black/70 backdrop-blur-md rounded-tl-lg p-2 shadow-lg border border-white/20 mb-4 mr-4">
          <button
            onClick={() => handleEdit(currentTestimonial)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
            title="Edit Testimonial"
          >
            ✏️
          </button>
          <button
            onClick={() =>
              handleSoftDelete(currentTestimonial.id, currentTestimonial.name)
            }
            className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
            title="Hide Testimonial (Soft Delete)"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAdmin && openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 text-white border border-gray-700 rounded-xl max-w-4xl max-h-[90vh] w-full overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {editingTestimonial
                    ? "Edit Testimonial"
                    : "Add New Testimonial"}
                </h2>
                <button
                  onClick={() => {
                    setOpenDialog(false);
                    setEditingTestimonial(null);
                  }}
                  className="text-gray-400 hover:text-white text-3xl font-bold p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <TestimonialForm
                testimonial={editingTestimonial}
                onSaved={handleTestimonialSaved}
                onCancel={() => {
                  setOpenDialog(false);
                  setEditingTestimonial(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
