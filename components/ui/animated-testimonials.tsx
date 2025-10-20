// "use client";

// import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
// import { motion, AnimatePresence } from "framer-motion"; // Updated import
// import Image from "next/image";
// import { useEffect, useState } from "react";

// type Testimonial = {
//   quote: string;
//   name: string;
//   designation: string;
//   src: string;
// };

// interface AnimatedTestimonialsProps {
//   testimonials: Testimonial[];
//   autoplay?: boolean;
//   onChange?: (index: number) => void;
// }

// export const AnimatedTestimonials = ({
//   testimonials,
//   autoplay = false,
//   onChange,
// }: AnimatedTestimonialsProps) => {
//   const [active, setActive] = useState(0);

//   const handleNext = () => {
//     setActive((prev) => {
//       const next = (prev + 1) % testimonials.length;
//       onChange?.(next);
//       return next;
//     });
//   };

//   const handlePrev = () => {
//     setActive((prev) => {
//       const prevIndex = (prev - 1 + testimonials.length) % testimonials.length;
//       onChange?.(prevIndex);
//       return prevIndex;
//     });
//   };

//   const isActive = (index: number) => index === active;

//   useEffect(() => {
//     if (autoplay && testimonials.length > 1) {
//       const interval = setInterval(() => {
//         setActive((prev) => {
//           const next = (prev + 1) % testimonials.length;
//           onChange?.(next);
//           return next;
//         });
//       }, 12000);
//       return () => clearInterval(interval);
//     }
//   }, [autoplay, testimonials.length, onChange]);

//   const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

//   if (!testimonials.length) return null; // Early return for empty testimonials

//   return (
//     <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
//       <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
//         {/* Image Section */}
//         <div className="relative h-80 w-full">
//           <AnimatePresence>
//             {testimonials.map((testimonial, index) => (
//               <motion.div
//                 key={testimonial.src} // Unique key
//                 initial={{
//                   opacity: 0,
//                   scale: 0.9,
//                   z: -100,
//                   rotate: randomRotateY(),
//                 }}
//                 animate={{
//                   opacity: isActive(index) ? 1 : 0.7,
//                   scale: isActive(index) ? 1 : 0.95,
//                   z: isActive(index) ? 0 : -100,
//                   rotate: isActive(index) ? 0 : randomRotateY(),
//                   zIndex: isActive(index)
//                     ? 40
//                     : testimonials.length + 2 - index,
//                   y: isActive(index) ? [0, -80, 0] : 0,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   scale: 0.9,
//                   z: 100,
//                   rotate: randomRotateY(),
//                 }}
//                 transition={{
//                   duration: 0.4,
//                   ease: "easeInOut",
//                 }}
//                 className="absolute inset-0 origin-bottom"
//               >
//                 <Image
//                   src={testimonial.src}
//                   alt={testimonial.name}
//                   width={500}
//                   height={500}
//                   draggable={false}
//                   className="h-full w-full rounded-3xl object-cover object-center"
//                 />
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Text Section */}
//         <div className="flex flex-col justify-between py-4">
//           <motion.div
//             key={active}
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -20, opacity: 0 }}
//             transition={{ duration: 0.2, ease: "easeInOut" }}
//           >
//             <h3 className="text-2xl font-bold text-black dark:text-white">
//               {testimonials[active].name}
//             </h3>
//             <p className="text-sm text-gray-500 dark:text-neutral-500">
//               {testimonials[active].designation}
//             </p>
//             <motion.p className="mt-8 text-lg text-gray-500 dark:text-neutral-300">
//               {testimonials[active].quote.split(" ").map((word, index) => (
//                 <motion.span
//                   key={`${active}-${index}`} // Ensure unique key
//                   initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
//                   animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
//                   transition={{
//                     duration: 0.2,
//                     ease: "easeInOut",
//                     delay: 0.02 * index,
//                   }}
//                   className="inline-block"
//                 >
//                   {word}&nbsp;
//                 </motion.span>
//               ))}
//             </motion.p>
//           </motion.div>
//           <div className="flex gap-4 pt-12 md:pt-0">
//             <button
//               onClick={handlePrev}
//               className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
//             >
//               <IconArrowLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
//             </button>
//             <button
//               onClick={handleNext}
//               className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
//             >
//               <IconArrowRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  onChange?: (index: number) => void;
}

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  onChange,
}: AnimatedTestimonialsProps) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => {
      const next = (prev + 1) % testimonials.length;
      onChange?.(next);
      return next;
    });
  };

  const handlePrev = () => {
    setActive((prev) => {
      const prevIndex = (prev - 1 + testimonials.length) % testimonials.length;
      onChange?.(prevIndex);
      return prevIndex;
    });
  };

  const isActive = (index: number) => index === active;

  useEffect(() => {
    if (autoplay && testimonials.length > 1) {
      const interval = setInterval(() => {
        setActive((prev) => {
          const next = (prev + 1) % testimonials.length;
          onChange?.(next);
          return next;
        });
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [autoplay, testimonials.length, onChange]);

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  if (!testimonials.length) return null;

  return (
    <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        {/* Image Section */}
        <div className="relative h-80 w-full">
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.src}-${index}`} // Updated to ensure unique key
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  z: -100,
                  rotate: randomRotateY(),
                }}
                animate={{
                  opacity: isActive(index) ? 1 : 0.7,
                  scale: isActive(index) ? 1 : 0.95,
                  z: isActive(index) ? 0 : -100,
                  rotate: isActive(index) ? 0 : randomRotateY(),
                  zIndex: isActive(index)
                    ? 40
                    : testimonials.length + 2 - index,
                  y: isActive(index) ? [0, -80, 0] : 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  z: 100,
                  rotate: randomRotateY(),
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 origin-bottom"
              >
                <Image
                  src={testimonial.src}
                  alt={testimonial.name}
                  width={500}
                  height={500}
                  draggable={false}
                  className="h-full w-full rounded-3xl object-cover object-center"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Text Section */}
        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              {testimonials[active].designation}
            </p>
            <motion.p className="mt-8 text-lg text-gray-500 dark:text-neutral-300">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={`${active}-${index}`}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
            >
              <IconArrowLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
            </button>
            <button
              onClick={handleNext}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
            >
              <IconArrowRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
