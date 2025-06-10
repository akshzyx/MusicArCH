import React, { Suspense } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function AboutPage() {
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
      <div className="min-h-screen text-white pb-10">
        <div className="max-w-6xl mx-auto pt-12 px-4 sm:px-6 md:px-8">
          {/* Header Section */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 mb-12 animate-fadeIn text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-teal-400 mb-6">
              About JojiArCH
            </h1>
            <p className="text-gray-300 text-lg">
              A dedicated archive celebrating the musical journey of Joji
              through his iconic eras.
            </p>
          </div>

          {/* Introduction Section */}
          <section className="mb-12">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-semibold text-teal-400 mb-4">
                What is JojiArCH?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                JojiArCH is a fan-made music archive created to document and
                celebrate the evolution of Joji’s artistry. From his early days
                as a lo-fi innovator to his rise as a global R&B and pop
                sensation, this platform allows fans to explore his discography
                through distinct eras, each marked by unique sounds, themes, and
                releases.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                I wanted to provide a comprehensive and immersive experience for
                Joji fans, offering access to tracks, releases, and insights
                into his creative journey. Whether you’re a longtime fan or a
                new listener, JojiArCH is your gateway to discovering the depth
                of his music.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                All the data was taken from the latest{" "}
                <a
                  href="https://docs.google.com/spreadsheets/d/1FPlWbXnx94y5FODJ2qniLf0BzViNSAmj6Xdfw1ZNwQ4/htmlview#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Joji Tracker
                </a>
                .
              </p>
            </div>
          </section>

          {/* Joji’s Journey Section */}
          <section className="mb-12">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-semibold text-teal-400 mb-4">
                Joji’s Musical Journey
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Joji, born George Kusunoki Miller, first gained fame through his
                comedic YouTube personas like Filthy Frank. However, in 2017, he
                transitioned to focus on his music career, releasing his debut
                EP <em>In Tongues</em>. This marked the beginning of his journey
                as a serious artist, blending lo-fi, R&B, and alternative pop
                with deeply emotional lyrics.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                Over the years, Joji has released critically acclaimed projects
                like <em>Ballads 1</em> (2018), which featured the hit “Slow
                Dancing in the Dark,” and <em>Nectar</em> (2020), showcasing his
                growth as a versatile artist. His music often explores themes of
                love, loss, and self-reflection, resonating with millions of
                fans worldwide.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                JojiArCH organizes his discography into eras, allowing you to
                dive into each phase of his career, from his early SoundCloud
                releases to his latest chart-topping hits.
              </p>
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-12">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-semibold text-teal-400 mb-4">
                What We Offer
              </h2>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>
                    <strong>Explore Eras:</strong> Navigate through Joji’s
                    musical eras, each with its own unique sound and story.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>
                    <strong>Track Listings:</strong> Access detailed track
                    lists, including released and unreleased songs, stems, and
                    sessions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>
                    <strong>Interactive Experience:</strong> Play tracks
                    directly on the site (and create your own Joji playlist - in
                    near future hopefully).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>
                    <strong>Community Driven:</strong> Contribute to the archive
                    by suggesting edits or new tracks (coming soon!).
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Currently Working On */}
          <section className="mb-12">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-semibold text-teal-400 mb-4">
                Currently Working On
              </h2>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>
                    <strong>Adding Songs:</strong> Working on adding new songs
                    and tracks to the archive, ensuring that you have access to
                    the most comprehensive collection of Joji’s music.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>
                    <strong>Playback Controls:</strong> Working to enhance the
                    playback controls for a smoother listening experience. Only
                    next, previous & pause buttons work right now.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Team/Contact Section */}
          <section className="mb-12">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-semibold text-teal-400 mb-4">
                Get in Touch
              </h2>
              <p className="text-gray-300 leading-relaxed">
                JojiArCH was created to preserve Joji’s legacy. As scrolling
                through the tracker was sometimes frustrating, I worked on this
                project to make exploring the discography easier.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                Have feedback, suggestions, or want to contribute? Reach out to
                me on{" "}
                <a
                  href="https://www.reddit.com/user/FewSong1527/"
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Reddit (u/FewSong1527)
                </a>{" "}
                or at{" "}
                <a
                  href="mailto:tres.suing503@passfwd.com"
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  tres.suing503@passfwd.com
                </a>
                .
              </p>
            </div>
          </section>

          {/* Call to Action */}
          <section className="mb-12 text-center">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-semibold text-teal-400 mb-4">
                Start Exploring
              </h2>
              <p className="text-gray-300 mb-6">
                Ready to dive into Joji’s musical world? Check out his eras and
                discover the stories behind the songs.
              </p>
              <Link href="/">
                <button className="bg-teal-400 text-white rounded-full px-6 py-3 hover:bg-teal-500 transition-colors">
                  Explore Eras
                </button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Suspense>
  );
}
