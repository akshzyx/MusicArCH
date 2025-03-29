// app/about/page.tsx
import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-[#0C1521] text-white min-h-screen">
      <div className="max-w-4xl mx-auto pt-12 px-4 sm:px-6 md:px-8">
        {/* Header Section */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center">
          About JojiArCH
        </h1>
        <p className="text-gray-300 text-lg text-center mb-12">
          A dedicated archive celebrating the musical journey of Joji through
          his iconic eras.
        </p>

        {/* Introduction Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            What is JojiArCH?
          </h2>
          <p className="text-gray-300 leading-relaxed">
            JojiArCH is a fan-made music archive created to document and
            celebrate the evolution of Joji’s artistry. From his early days as a
            lo-fi innovator to his rise as a global R&B and pop sensation, this
            platform allows fans to explore his discography through distinct
            eras, each marked by unique sounds, themes, and releases.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Our mission is to provide a comprehensive and immersive experience
            for Joji fans, offering access to tracks, releases, and insights
            into his creative journey. Whether you’re a longtime fan or a new
            listener, JojiArCH is your gateway to discovering the depth of his
            music.
          </p>
        </section>

        {/* Joji’s Journey Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            Joji’s Musical Journey
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Joji, born George Kusunoki Miller, first gained fame through his
            comedic YouTube personas like Filthy Frank. However, in 2017, he
            transitioned to focus on his music career, releasing his debut EP{" "}
            <em>In Tongues</em>. This marked the beginning of his journey as a
            serious artist, blending lo-fi, R&B, and alternative pop with deeply
            emotional lyrics.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Over the years, Joji has released critically acclaimed projects like{" "}
            <em>Ballads 1</em> (2018), which featured the hit “Slow Dancing in
            the Dark,” and <em>Nectar</em> (2020), showcasing his growth as a
            versatile artist. His music often explores themes of love, loss, and
            self-reflection, resonating with millions of fans worldwide.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            JojiArCH organizes his discography into eras, allowing you to dive
            into each phase of his career, from his early SoundCloud releases to
            his latest chart-topping hits.
          </p>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            What We Offer
          </h2>
          <ul className="text-gray-300 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>
                <strong>Explore Eras:</strong> Navigate through Joji’s musical
                eras, each with its own unique sound and story.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>
                <strong>Track Listings:</strong> Access detailed track lists,
                including released and unreleased songs, stems, and sessions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>
                <strong>Interactive Experience:</strong> Play tracks directly on
                the site and create your own Joji playlist.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>
                <strong>Community Driven:</strong> Contribute to the archive by
                suggesting edits or new tracks (coming soon!).
              </span>
            </li>
          </ul>
        </section>

        {/* Team/Contact Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-300 leading-relaxed">
            JojiArCH was created by a small team of passionate fans dedicated to
            preserving Joji’s legacy. We’re always looking to improve the site
            and add new features.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Have feedback, suggestions, or want to contribute? Reach out to us
            at{" "}
            <a
              href="mailto:contact@jojiarch.com"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              contact@jojiarch.com
            </a>
            .
          </p>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            Start Exploring
          </h2>
          <p className="text-gray-300 mb-6">
            Ready to dive into Joji’s musical world? Check out his eras and
            discover the stories behind the songs.
          </p>
          <Link href="/">
            <button className="bg-blue-500 text-white rounded-full px-6 py-3 hover:bg-blue-600 transition-colors">
              Explore Eras
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
}
