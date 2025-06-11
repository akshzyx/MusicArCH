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
              A dedicated archive celebrating Joji&#39;s journey through his
              iconic eras.
            </p>
          </div>

          {/* Introduction Section */}
          <section className="mb-12">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-semibold text-teal-400 mb-4">
                What is JojiArCH?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                JojiArCH is a fan-made archive created to document and celebrate
                the evolution of Joji’s career, from his comedic YouTube origins
                as Filthy Frank and Pink Guy to his rise as a global R&B and pop
                sensation. This platform allows fans to explore his complete
                discography—spanning comedic hip-hop, lo-fi experiments, and
                introspective albums—through distinct eras, each marked by
                unique sounds, themes, and releases.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                I wanted to provide a comprehensive and immersive experience for
                fans, offering access to tracks, releases, and insights into his
                creative journey across comedy and music. Whether you’re a
                longtime follower of Filthy Frank or a new listener of Joji’s
                chart-topping hits, JojiArCH is your gateway to discovering the
                depth of his work.
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
                Joji’s Journey
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Joji, born George Kusunoki Miller, first gained fame through his
                YouTube channels DizastaMusic, TVFilthyFrank, and TooDamnFilthy,
                where he created *The Filthy Frank Show* starting in 2011. As
                Filthy Frank, he portrayed oddball characters, delivering shock
                humor, rants, skits, and comedy hip-hop under his Pink Guy
                alias. His viral “Harlem Shake” video in 2013 popularized the
                meme, amassing millions of views. As Pink Guy, he released
                comedic projects like *Pink Guy* (2014), *Pink Season* (2017),
                which hit number 70 on the Billboard 200, and *Pink Season: The
                Prophecy* (2017).
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                In 2017, Miller retired Filthy Frank due to health concerns and
                a desire to pursue serious music, releasing his debut EP *In
                Tongues* as Joji. This marked his shift to lo-fi, R&B, and
                alternative pop, with emotional lyrics exploring love and loss.
                His discography includes early SoundCloud singles like “Thom”
                and “You Suck Charlie” (2015), the unreleased *Chloe Burbank:
                Volume 1*, and critically acclaimed albums: *Ballads 1* (2018)
                with “Slow Dancing in the Dark,” *Nectar* (2020) with
                “Sanctuary,” and *Smithereens* (2022) with “Glimpse of Us,” his
                highest-charting single.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                JojiArCH organizes his career into eras, from his comedic
                YouTube beginnings and Pink Guy releases to his transformative
                Joji albums, allowing you to dive into every phase of his
                artistic evolution.
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
                    <strong>Completing Archive:</strong> Working on updating the
                    archive with new songs, tracks and videos, ensuring that you
                    have access to the most comprehensive collection of Joji’s
                    content.
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
                Ready to dive into Joji’s world? Check out his eras and discover
                the stories behind the songs.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/eras">
                  <button className="bg-teal-400 text-white rounded-full px-6 py-3 hover:bg-teal-500 transition-colors">
                    Explore Musical Eras
                  </button>
                </Link>
                <Link href="/seasons">
                  <button className="bg-teal-400 text-white rounded-full px-6 py-3 hover:bg-teal-500 transition-colors">
                    Explore Comedic Seasons
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Suspense>
  );
}
