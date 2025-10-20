"use client";
import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref, data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end end"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full font-sans md:px-10 bg-gradient-to-br from-gray-900 to-black"
      ref={containerRef}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-8">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-4 md:pt-6 md:gap-4 group cursor-pointer"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-16 self-center max-w-xs lg:max-w-sm md:w-full">
              <div className="h-6 absolute left-3 md:left-3 w-6 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-teal-600 transition-colors duration-200">
                <div className="h-2 w-2 rounded-full bg-neutral-700 border border-neutral-600 group-hover:bg-white group-hover:border-teal-500 p-1 transition-all duration-200" />
              </div>
              <h3 className="hidden md:block text-sm md:pl-10 md:text-sm font-medium text-neutral-400 group-hover:text-teal-300 transition-colors duration-200">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-12 pr-4 md:pl-2 w-full group hover:bg-gray-800 hover:bg-opacity-50 rounded-lg transition-colors duration-200 py-2 px-3 cursor-pointer group-hover:[&_.text-sm]:text-teal-300 group-hover:[&_.text-sm]:transition-colors group-hover:[&_.text-sm]:duration-200">
              <h3 className="md:hidden block text-sm mb-1 text-left font-medium text-neutral-400 group-hover:text-teal-300 transition-colors duration-200">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div className="text-center text-neutral-300 text-base font-medium mt-8 mb-8">
          That&apos;s all for now!
        </div>
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-5 left-5 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-600 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-teal-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
