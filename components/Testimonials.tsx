import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "JOJI’s “SLOW DANCING IN THE DARK” has now sold over 15 million units worldwide (streams alone). It’s his first song to achieve this.",
      name: "SLOW DANCING IN THE DARK",
      designation: "Joji",
      src: "https://raw.githubusercontent.com/JojiArch/metadata/main/testimonials/SLOW%20DANCING%20IN%20THE%20DARK.jpeg",
    },
    {
      quote:
        "All the tracks from “Nectar” has now surpassed 40 million streams on Spotify.",
      name: "40 Million Streams",
      designation: "Joji",
      src: "https://raw.githubusercontent.com/JojiArch/metadata/main/testimonials/Nectar.jpeg",
    },
    {
      quote:
        "JOJI has now surpassed 650 million streams on Spotify in 2025, despite not releasing anything for almost three years.",
      name: "650 Million Streams",
      designation: "Joji",
      src: "https://raw.githubusercontent.com/JojiArch/metadata/main/testimonials/jojiii.jpeg",
    },
    {
      quote:
        "The mastermind behind lo-fi beats and heart-wrenching ballads like ‘Slow Dancing in the Dark’. A former meme lord turned soulful crooner, baring his soul through 88Rising.",
      name: "Joji",
      designation: "Lo-Fi Sad Boi",
      src: "https://raw.githubusercontent.com/JojiArch/metadata/main/testimonials/joji.jpg",
    },
    {
      quote:
        "A deranged, chromosome-obsessed madman who rules the omniverse with a fetish for sacrifices. Known for banishing FilthyFrank to the Rice Fields and demanding chin-chin worship.",
      name: "Chin-Chin",
      designation: "Dark Lord of the Omniverse",
      src: "https://raw.githubusercontent.com/JojiArch/metadata/main/testimonials/chin-chin.webp",
    },
    {
      quote:
        "A Lycra-clad lunatic spitting absurd rap bars and causing chaos with stunts like eating haircake. From ‘STFU’ to ramen battles, he’s the ultimate b0ss of cringe.",
      name: "Pink Guy",
      designation: "Lycra Rap Anarchist",
      src: "https://raw.githubusercontent.com/JojiArch/metadata/main/testimonials/pink-guy.jpg",
    },
    {
      quote:
        "The foul-mouthed creator of internet mayhem, from ‘Harlem Shake’ to puking on cakes. A pioneer of filthy skits and meme culture, exiled by Chin-Chin but never forgotten.",
      name: "Filthy Frank",
      designation: "Meme Chaos Creator",
      src: "https://raw.githubusercontent.com/JojiArch/metadata/main/testimonials/FilthyFrank.jpg",
    },
    {
      quote:
        "A wild card in the FilthyFrank saga, popping up in bizarre skits with a knack for jungle chaos. Loyal to the archive, he’s the unsung hero of Frank’s unhinged world.",
      name: "Safari Man",
      designation: "Jungle Skits Sidekick",
      src: "https://raw.githubusercontent.com/JojiArch/metadata/main/testimonials/safari-man.webp",
    },
  ];
  return <AnimatedTestimonials testimonials={testimonials} autoplay={true} />;
}
