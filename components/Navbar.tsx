"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSkull,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

const navItems = ["About"];

const NavBar = () => {
  const navContainerRef = useRef(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const { isSignedIn, user } = useUser();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      await router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.stopPropagation();
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      ref={navContainerRef}
      className={`fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-300 sm:inset-x-6 ${
        isNavVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
      }`}
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4 bg-black rounded-lg shadow-lg">
          <Link href="/" prefetch className="flex items-center gap-7">
            <FontAwesomeIcon icon={faSkull} size="2x" color="white" />
            <p className="font-bold text-white">JojiArCH</p>
          </Link>
          <div className="flex h-full items-center">
            {/* Search Component - Icon only by default */}
            <div
              className="relative flex items-center mr-4 h-10"
              onMouseEnter={() => setIsSearchHovered(true)}
              onMouseLeave={() => !searchQuery && setIsSearchHovered(false)}
            >
              {/* Default icon state (no background) */}
              <button
                onClick={() => setIsSearchHovered(true)}
                className={`absolute right-0 text-gray-400 hover:text-white transition-colors z-10 ${
                  isSearchHovered ? "opacity-0" : "opacity-100"
                }`}
              >
                <FontAwesomeIcon icon={faSearch} size="lg" />
              </button>

              {/* Expanding search box */}
              <form
                onSubmit={handleSearch}
                className={`absolute right-0 flex items-center bg-gray-800 rounded-full transition-all duration-300 overflow-hidden ${
                  isSearchHovered
                    ? "w-64 px-4 py-2 opacity-100"
                    : "w-0 opacity-0"
                }`}
              >
                <button
                  type="submit"
                  className="text-gray-400 hover:text-white mr-2"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for songs, artists"
                  className="bg-transparent border-none text-white focus:outline-none w-full placeholder-gray-400"
                  autoFocus={isSearchHovered}
                />
                {isLoading && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    color="white"
                    className="animate-spin ml-2"
                  />
                )}
              </form>
            </div>

            {/* Nav Items */}
            <div className="hidden md:block">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={`/${item.toLowerCase()}`}
                  className="text-white mx-3 font-medium hover:text-blue-400 transition-colors duration-200"
                >
                  {item}
                </Link>
              ))}
            </div>
            {isAdmin && (
              <Link
                href="/upload"
                prefetch
                className="ml-10 font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Upload
              </Link>
            )}
            <div className="ml-4">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <button className="font-bold text-white bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
